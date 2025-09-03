from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
import re

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    name: str = Field(..., min_length=2, max_length=50)
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v
    
    @validator('name')
    def validate_name(cls, v):
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', v):
            raise ValueError('Name can only contain letters and spaces')
        return v.strip()

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Exercise schemas
class ExerciseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    muscle_group: str = Field(..., min_length=2, max_length=50)
    
    @validator('name', 'muscle_group')
    def validate_text_fields(cls, v):
        if v:
            return v.strip()
        return v

class ExerciseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    muscle_group: Optional[str] = Field(None, min_length=2, max_length=50)
    
    @validator('name', 'muscle_group')
    def validate_text_fields(cls, v):
        if v:
            return v.strip()
        return v

class ExerciseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    muscle_group: str
    user_id: Optional[int]
    
    class Config:
        from_attributes = True

# Workout entry schemas
class WorkoutEntryCreate(BaseModel):
    exercise_id: int = Field(..., gt=0)
    weight: Optional[float] = Field(None, ge=0, le=1000)  # Opcional para cardio
    repetitions: Optional[int] = Field(None, ge=1, le=1000)  # Opcional para cardio
    sets: Optional[int] = Field(None, ge=1, le=50)  # Opcional para cardio
    time_minutes: Optional[float] = Field(None, ge=0, le=1440)  # 0-24 horas
    distance_km: Optional[float] = Field(None, ge=0, le=1000)  # 0-1000 km
    date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)
    
    @validator('weight', 'repetitions', 'sets', 'time_minutes', 'distance_km')
    def at_least_one_metric(cls, v, values):
        # Al menos uno de los campos principales debe estar presente
        metrics = ['weight', 'repetitions', 'sets', 'time_minutes', 'distance_km']
        provided_metrics = [k for k in metrics if values.get(k) is not None or v is not None]
        if len(provided_metrics) == 0:
            raise ValueError('Al menos un campo de medición es requerido')
        return v

class WorkoutEntryUpdate(BaseModel):
    exercise_id: Optional[int] = Field(None, gt=0)
    weight: Optional[float] = Field(None, ge=0, le=1000)
    repetitions: Optional[int] = Field(None, ge=1, le=1000)
    sets: Optional[int] = Field(None, ge=1, le=50)
    time_minutes: Optional[float] = Field(None, ge=0, le=1440)
    distance_km: Optional[float] = Field(None, ge=0, le=1000)
    date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)

class WorkoutEntryResponse(BaseModel):
    id: int
    exercise_id: int
    weight: Optional[float]
    repetitions: Optional[int]
    sets: Optional[int]
    time_minutes: Optional[float]
    distance_km: Optional[float]
    date: datetime
    notes: Optional[str]
    exercise: ExerciseResponse
    
    class Config:
        from_attributes = True

# Progress schemas
class ProgressDataPoint(BaseModel):
    date: str
    weight: Optional[float] = None
    reps: Optional[int] = None
    sets: Optional[int] = None
    time_minutes: Optional[float] = None
    distance_km: Optional[float] = None
    primary_metric: float  # Métrica principal para el gráfico
    primary_label: str    # Etiqueta de la métrica principal

class ProgressStats(BaseModel):
    max_primary: float
    avg_primary: float
    last_primary: float
    total_sessions: int
    primary_metric_name: str  # "Peso", "Tiempo", etc.
    primary_metric_unit: str  # "kg", "min", etc.
    progress_data: List[ProgressDataPoint]
