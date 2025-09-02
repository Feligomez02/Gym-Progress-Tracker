from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Exercise

# Create tables
Base.metadata.create_all(bind=engine)

def seed_exercises():
    db = SessionLocal()
    
    # Check if exercises already exist
    if db.query(Exercise).first():
        print("Exercises already exist, skipping seed.")
        db.close()
        return
    
    # Predefined exercises
    exercises = [
        {"name": "Press de Banca", "description": "Ejercicio de pecho con barra", "muscle_group": "Pecho"},
        {"name": "Sentadillas", "description": "Ejercicio de piernas con barra", "muscle_group": "Piernas"},
        {"name": "Peso Muerto", "description": "Ejercicio de espalda y piernas", "muscle_group": "Espalda"},
        {"name": "Press Militar", "description": "Ejercicio de hombros con barra", "muscle_group": "Hombros"},
        {"name": "Curl de Bíceps", "description": "Ejercicio de bíceps con mancuernas", "muscle_group": "Brazos"},
        {"name": "Press Inclinado", "description": "Press de banca inclinado", "muscle_group": "Pecho"},
        {"name": "Remo con Barra", "description": "Ejercicio de espalda con barra", "muscle_group": "Espalda"},
        {"name": "Extensiones de Tríceps", "description": "Ejercicio de tríceps", "muscle_group": "Brazos"},
        {"name": "Elevaciones Laterales", "description": "Ejercicio de hombros con mancuernas", "muscle_group": "Hombros"},
        {"name": "Prensa de Piernas", "description": "Ejercicio de piernas en máquina", "muscle_group": "Piernas"},
    ]
    
    for exercise_data in exercises:
        exercise = Exercise(
            name=exercise_data["name"],
            description=exercise_data["description"],
            muscle_group=exercise_data["muscle_group"],
            user_id=None  # Predefined exercises
        )
        db.add(exercise)
    
    db.commit()
    db.close()
    print("Exercises seeded successfully!")

if __name__ == "__main__":
    seed_exercises()
