from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import time
from collections import defaultdict

from database import get_db, engine
from models import Base, User, Exercise, WorkoutEntry

# FORZAR la base de datos correcta
import os
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
CORRECTED_DATABASE_URL = f"sqlite:///{os.path.join(BACKEND_DIR, 'gym_tracker.db')}"
print(f"FORCED DATABASE_URL: {CORRECTED_DATABASE_URL}")

# Recrear engine con la URL correcta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
engine = create_engine(
    CORRECTED_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
from schemas import (
    UserCreate, UserLogin, UserResponse, Token,
    ExerciseCreate, ExerciseUpdate, ExerciseResponse,
    WorkoutEntryCreate, WorkoutEntryUpdate, WorkoutEntryResponse,
    ProgressStats
)

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gym Tracker API", version="1.0.0")

# Rate limiting simple
request_counts = defaultdict(list)

async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    current_time = time.time()
    
    # Limpiar requests antiguos (últimos 60 segundos)
    request_counts[client_ip] = [
        req_time for req_time in request_counts[client_ip] 
        if current_time - req_time < 60
    ]
    
    # Verificar límite (100 requests por minuto por IP)
    if len(request_counts[client_ip]) >= 100:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
    
    request_counts[client_ip].append(current_time)
    response = await call_next(request)
    return response

app.middleware("http")(rate_limit_middleware)

# CORS middleware - CONFIGURACIÓN FLEXIBLE PARA DESARROLLO
def get_allowed_origins():
    """Obtiene los orígenes permitidos basados en el entorno"""
    environment = os.getenv("ENVIRONMENT", "development")
    
    if environment == "production":
        # En producción, solo orígenes específicos
        return os.getenv("ALLOWED_ORIGINS", "").split(",")
    else:
        # En desarrollo, permitir localhost y red local
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://192.168.0.220:3000",
            "http://192.168.0.220:8001",
            # Permitir cualquier IP de red local en desarrollo
            "http://192.168.*:3000",
            "http://10.*:3000",
        ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENVIRONMENT", "development") == "development" else get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings - MEJORADOS
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Validar que SECRET_KEY esté configurada en producción
if SECRET_KEY == "your-secret-key-here-change-in-production":
    import warnings
    warnings.warn("⚠️  SECURITY WARNING: Using default SECRET_KEY. Change this in production!")

# Security
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user

@app.post("/api/auth/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return UserResponse(id=user.id, email=user.email, name=user.name)

@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(id=current_user.id, email=current_user.email, name=current_user.name)

@app.get("/api/exercises", response_model=List[ExerciseResponse])
def get_exercises(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exercises = db.query(Exercise).filter(
        (Exercise.user_id == current_user.id) | (Exercise.user_id.is_(None))
    ).all()
    return exercises

@app.post("/api/exercises", response_model=ExerciseResponse)
def create_exercise(exercise_data: ExerciseCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    exercise = Exercise(
        name=exercise_data.name,
        description=exercise_data.description,
        muscle_group=exercise_data.muscle_group,
        user_id=current_user.id
    )
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise

@app.get("/api/workouts", response_model=List[WorkoutEntryResponse])
def get_workouts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workouts = db.query(WorkoutEntry).filter(WorkoutEntry.user_id == current_user.id).all()
    return workouts

@app.post("/api/workouts", response_model=WorkoutEntryResponse)
def create_workout(workout_data: WorkoutEntryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verificar que el ejercicio existe y el usuario tiene acceso
    exercise = db.query(Exercise).filter(
        Exercise.id == workout_data.exercise_id,
        (Exercise.user_id == current_user.id) | (Exercise.user_id.is_(None))
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found or you don't have access to it"
        )
    
    # Validar fecha (no puede ser futura más de 1 día)
    workout_date = workout_data.date or datetime.utcnow()
    if workout_date > datetime.utcnow() + timedelta(days=1):
        raise HTTPException(
            status_code=400,
            detail="Workout date cannot be more than 1 day in the future"
        )
    
    workout = WorkoutEntry(
        user_id=current_user.id,
        exercise_id=workout_data.exercise_id,
        weight=workout_data.weight,
        repetitions=workout_data.repetitions,
        sets=workout_data.sets,
        time_minutes=workout_data.time_minutes,
        distance_km=workout_data.distance_km,
        date=workout_date,
        notes=workout_data.notes
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout

@app.get("/api/progress/{exercise_id}", response_model=ProgressStats)
def get_exercise_progress(exercise_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Obtener el ejercicio para determinar su tipo
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    
    workouts = db.query(WorkoutEntry).filter(
        WorkoutEntry.user_id == current_user.id,
        WorkoutEntry.exercise_id == exercise_id
    ).all()
    
    if not workouts:
        return ProgressStats(
            max_primary=0,
            avg_primary=0,
            last_primary=0,
            total_sessions=0,
            primary_metric_name="Peso",
            primary_metric_unit="kg",
            progress_data=[]
        )
    
    # Determinar la métrica principal según el grupo muscular
    def get_primary_metric_config(muscle_group: str):
        if muscle_group == 'Cardio':
            return {
                'field': 'time_minutes',
                'name': 'Tiempo',
                'unit': 'min',
                'fallback_field': 'distance_km',
                'fallback_name': 'Distancia',
                'fallback_unit': 'km'
            }
        elif muscle_group == 'Abdomen':
            return {
                'field': 'repetitions',
                'name': 'Repeticiones',
                'unit': 'reps',
                'fallback_field': 'time_minutes',
                'fallback_name': 'Tiempo',
                'fallback_unit': 'min'
            }
        else:
            return {
                'field': 'weight',
                'name': 'Peso',
                'unit': 'kg',
                'fallback_field': 'repetitions',
                'fallback_name': 'Repeticiones',
                'fallback_unit': 'reps'
            }
    
    config = get_primary_metric_config(exercise.muscle_group)
    
    # Extraer valores de la métrica principal
    primary_values = []
    progress_data = []
    
    for w in sorted(workouts, key=lambda x: x.date):
        # Obtener valor principal
        primary_value = getattr(w, config['field'], None)
        if primary_value is None and 'fallback_field' in config:
            primary_value = getattr(w, config['fallback_field'], None)
        
        if primary_value is not None:
            primary_values.append(primary_value)
            
            # Determinar etiqueta basada en qué campo se usó
            used_field = config['field'] if getattr(w, config['field'], None) is not None else config.get('fallback_field', config['field'])
            label = config['name'] if used_field == config['field'] else config.get('fallback_name', config['name'])
            
            progress_data.append({
                "date": w.date.isoformat(),
                "weight": w.weight,
                "reps": w.repetitions,
                "sets": w.sets,
                "time_minutes": w.time_minutes,
                "distance_km": w.distance_km,
                "primary_metric": primary_value,
                "primary_label": label
            })
    
    if not primary_values:
        return ProgressStats(
            max_primary=0,
            avg_primary=0,
            last_primary=0,
            total_sessions=len(workouts),
            primary_metric_name=config['name'],
            primary_metric_unit=config['unit'],
            progress_data=[]
        )
    
    return ProgressStats(
        max_primary=max(primary_values),
        avg_primary=sum(primary_values) / len(primary_values),
        last_primary=primary_values[-1] if primary_values else 0,
        total_sessions=len(workouts),
        primary_metric_name=config['name'],
        primary_metric_unit=config['unit'],
        progress_data=progress_data
    )

# Update endpoints
@app.put("/api/exercises/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    exercise_id: int, 
    exercise_data: ExerciseUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Find the exercise
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.user_id == current_user.id  # Only allow editing own custom exercises
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=404, 
            detail="Exercise not found or you don't have permission to edit it"
        )
    
    # Update only provided fields
    update_data = exercise_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)
    
    db.commit()
    db.refresh(exercise)
    return exercise

@app.put("/api/workouts/{workout_id}", response_model=WorkoutEntryResponse)
def update_workout(
    workout_id: int, 
    workout_data: WorkoutEntryUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Find the workout
    workout = db.query(WorkoutEntry).filter(
        WorkoutEntry.id == workout_id,
        WorkoutEntry.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=404, 
            detail="Workout not found or you don't have permission to edit it"
        )
    
    # Update only provided fields
    update_data = workout_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workout, field, value)
    
    db.commit()
    db.refresh(workout)
    return workout

# Delete endpoints
@app.delete("/api/exercises/{exercise_id}")
def delete_exercise(
    exercise_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Find the exercise
    exercise = db.query(Exercise).filter(
        Exercise.id == exercise_id,
        Exercise.user_id == current_user.id  # Only allow deleting own custom exercises
    ).first()
    
    if not exercise:
        raise HTTPException(
            status_code=404, 
            detail="Exercise not found or you don't have permission to delete it"
        )
    
    # Check if exercise is used in workouts
    workout_count = db.query(WorkoutEntry).filter(WorkoutEntry.exercise_id == exercise_id).count()
    if workout_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete exercise. It is used in {workout_count} workout(s)"
        )
    
    db.delete(exercise)
    db.commit()
    return {"message": "Exercise deleted successfully"}

@app.delete("/api/workouts/{workout_id}")
def delete_workout(
    workout_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Find the workout
    workout = db.query(WorkoutEntry).filter(
        WorkoutEntry.id == workout_id,
        WorkoutEntry.user_id == current_user.id
    ).first()
    
    if not workout:
        raise HTTPException(
            status_code=404, 
            detail="Workout not found or you don't have permission to delete it"
        )
    
    db.delete(workout)
    db.commit()
    return {"message": "Workout deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
