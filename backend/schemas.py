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
    weight: float = Field(..., ge=0, le=1000)  # 0-1000 kg
    repetitions: int = Field(..., ge=1, le=1000)  # 1-1000 reps
    sets: int = Field(..., ge=1, le=50)  # 1-50 sets
    date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)

class WorkoutEntryUpdate(BaseModel):
    exercise_id: Optional[int] = Field(None, gt=0)
    weight: Optional[float] = Field(None, ge=0, le=1000)
    repetitions: Optional[int] = Field(None, ge=1, le=1000)
    sets: Optional[int] = Field(None, ge=1, le=50)
    date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=500)

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
