from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

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
    ExerciseCreate, ExerciseResponse,
    WorkoutEntryCreate, WorkoutEntryResponse,
    ProgressStats
)

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gym Tracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En desarrollo permite todos los orígenes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
    workout = WorkoutEntry(
        user_id=current_user.id,
        exercise_id=workout_data.exercise_id,
        weight=workout_data.weight,
        repetitions=workout_data.repetitions,
        sets=workout_data.sets,
        date=workout_data.date
    )
    db.add(workout)
    db.commit()
    db.refresh(workout)
    return workout

@app.get("/api/progress/{exercise_id}", response_model=ProgressStats)
def get_exercise_progress(exercise_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    workouts = db.query(WorkoutEntry).filter(
        WorkoutEntry.user_id == current_user.id,
        WorkoutEntry.exercise_id == exercise_id
    ).all()
    
    if not workouts:
        return ProgressStats(
            max_weight=0,
            avg_weight=0,
            last_weight=0,
            total_sessions=0,
            progress_data=[]
        )
    
    weights = [w.weight for w in workouts]
    progress_data = [
        {"date": w.date.isoformat(), "weight": w.weight, "reps": w.repetitions, "sets": w.sets}
        for w in sorted(workouts, key=lambda x: x.date)
    ]
    
    return ProgressStats(
        max_weight=max(weights),
        avg_weight=sum(weights) / len(weights),
        last_weight=weights[-1],
        total_sessions=len(workouts),
        progress_data=progress_data
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
