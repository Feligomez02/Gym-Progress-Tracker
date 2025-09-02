from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

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
    name: str
    description: Optional[str] = None
    muscle_group: str

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
    exercise_id: int
    weight: float
    repetitions: int
    sets: int
    date: Optional[datetime] = None
    notes: Optional[str] = None

class WorkoutEntryResponse(BaseModel):
    id: int
    exercise_id: int
    weight: float
    repetitions: int
    sets: int
    date: datetime
    notes: Optional[str]
    exercise: ExerciseResponse
    
    class Config:
        from_attributes = True

# Progress schemas
class ProgressDataPoint(BaseModel):
    date: str
    weight: float
    reps: int
    sets: int

class ProgressStats(BaseModel):
    max_weight: float
    avg_weight: float
    last_weight: float
    total_sessions: int
    progress_data: List[ProgressDataPoint]
