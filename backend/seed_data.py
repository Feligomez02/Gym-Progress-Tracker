from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Exercise

# Create tables
Base.metadata.create_all(bind=engine)

def seed_exercises():
    db = SessionLocal()
    
    # Check if exercises already exist
    existing_count = db.query(Exercise).count()
    print(f"Ejercicios existentes en BD: {existing_count}")
    
    # Contador de ejercicios agregados
    added_count = 0
    
    # Predefined exercises - LISTA COMPLETA
    exercises = [
        # Pecho
        {"name": "Press de Banca", "description": "Ejercicio de pecho con barra", "muscle_group": "Pecho"},
        {"name": "Press Inclinado", "description": "Press de banca inclinado", "muscle_group": "Pecho"},
        {"name": "Press Declinado", "description": "Press de banca declinado", "muscle_group": "Pecho"},
        {"name": "Press con Mancuernas", "description": "Press de pecho con mancuernas", "muscle_group": "Pecho"},
        {"name": "Aperturas con Mancuernas", "description": "Aperturas para pecho con mancuernas", "muscle_group": "Pecho"},
        {"name": "Fondos en Paralelas", "description": "Fondos para pecho y tríceps", "muscle_group": "Pecho"},
        {"name": "Press en Máquina", "description": "Press de pecho en máquina", "muscle_group": "Pecho"},
        {"name": "Cruces en Polea", "description": "Cruces de pecho en poleas", "muscle_group": "Pecho"},
        
        # Espalda
        {"name": "Peso Muerto", "description": "Ejercicio de espalda y piernas", "muscle_group": "Espalda"},
        {"name": "Remo con Barra", "description": "Ejercicio de espalda con barra", "muscle_group": "Espalda"},
        {"name": "Remo con Mancuerna", "description": "Remo unilateral con mancuerna", "muscle_group": "Espalda"},
        {"name": "Dominadas", "description": "Dominadas con peso corporal", "muscle_group": "Espalda"},
        {"name": "Jalones al Pecho", "description": "Jalones en polea alta", "muscle_group": "Espalda"},
        {"name": "Peso Muerto Rumano", "description": "Peso muerto enfocado en isquiotibiales", "muscle_group": "Espalda"},
        {"name": "Remo en Polea Baja", "description": "Remo sentado en polea", "muscle_group": "Espalda"},
        {"name": "Pullover", "description": "Pullover con mancuerna o barra", "muscle_group": "Espalda"},
        
        # Piernas
        {"name": "Sentadillas", "description": "Ejercicio de piernas con barra", "muscle_group": "Piernas"},
        {"name": "Prensa de Piernas", "description": "Ejercicio de piernas en máquina", "muscle_group": "Piernas"},
        {"name": "Sentadilla Frontal", "description": "Sentadilla con barra al frente", "muscle_group": "Piernas"},
        {"name": "Sentadilla Búlgara", "description": "Sentadilla unilateral elevada", "muscle_group": "Piernas"},
        {"name": "Extensiones de Cuádriceps", "description": "Extensiones en máquina", "muscle_group": "Piernas"},
        {"name": "Curl de Isquiotibiales", "description": "Curl acostado o sentado", "muscle_group": "Piernas"},
        {"name": "Zancadas", "description": "Zancadas con mancuernas o barra", "muscle_group": "Piernas"},
        {"name": "Hack Squat", "description": "Sentadilla en máquina hack", "muscle_group": "Piernas"},
        
        # Glúteos
        {"name": "Hip Thrust", "description": "Empuje de cadera con barra", "muscle_group": "Glúteos"},
        {"name": "Peso Muerto Sumo", "description": "Peso muerto con stance amplio", "muscle_group": "Glúteos"},
        {"name": "Patadas de Glúteo", "description": "Patadas en cuadrupedia", "muscle_group": "Glúteos"},
        {"name": "Puente de Glúteo", "description": "Puente con peso corporal", "muscle_group": "Glúteos"},
        {"name": "Sentadilla Sumo", "description": "Sentadilla con stance amplio", "muscle_group": "Glúteos"},
        
        # Hombros
        {"name": "Press Militar", "description": "Ejercicio de hombros con barra", "muscle_group": "Hombros"},
        {"name": "Elevaciones Laterales", "description": "Ejercicio de hombros con mancuernas", "muscle_group": "Hombros"},
        {"name": "Press con Mancuernas Hombros", "description": "Press de hombros con mancuernas", "muscle_group": "Hombros"},
        {"name": "Elevaciones Frontales", "description": "Elevaciones frontales con mancuernas", "muscle_group": "Hombros"},
        {"name": "Elevaciones Posteriores", "description": "Elevaciones para deltoides posterior", "muscle_group": "Hombros"},
        {"name": "Remo al Mentón", "description": "Remo vertical con barra", "muscle_group": "Hombros"},
        {"name": "Press Arnold", "description": "Press con rotación de mancuernas", "muscle_group": "Hombros"},
        
        # Brazos
        {"name": "Curl de Bíceps", "description": "Ejercicio de bíceps con mancuernas", "muscle_group": "Brazos"},
        {"name": "Extensiones de Tríceps", "description": "Ejercicio de tríceps", "muscle_group": "Brazos"},
        {"name": "Curl con Barra", "description": "Curl de bíceps con barra", "muscle_group": "Brazos"},
        {"name": "Press Francés", "description": "Extensiones de tríceps acostado", "muscle_group": "Brazos"},
        {"name": "Curl Martillo", "description": "Curl con agarre neutro", "muscle_group": "Brazos"},
        {"name": "Fondos en Banco", "description": "Fondos para tríceps en banco", "muscle_group": "Brazos"},
        {"name": "Curl en Polea", "description": "Curl de bíceps en polea", "muscle_group": "Brazos"},
        {"name": "Extensiones en Polea", "description": "Extensiones de tríceps en polea", "muscle_group": "Brazos"},
        {"name": "Curl Concentrado", "description": "Curl de bíceps concentrado", "muscle_group": "Brazos"},
        
        # Abdomen
        {"name": "Plank", "description": "Plancha isométrica", "muscle_group": "Abdomen"},
        {"name": "Crunches", "description": "Abdominales tradicionales", "muscle_group": "Abdomen"},
        {"name": "Elevaciones de Piernas", "description": "Elevaciones colgado o acostado", "muscle_group": "Abdomen"},
        {"name": "Russian Twists", "description": "Giros rusos con peso", "muscle_group": "Abdomen"},
        {"name": "Mountain Climbers", "description": "Escaladores en plancha", "muscle_group": "Abdomen"},
        {"name": "Dead Bug", "description": "Ejercicio de estabilidad core", "muscle_group": "Abdomen"},
        {"name": "Bicycle Crunches", "description": "Abdominales bicicleta", "muscle_group": "Abdomen"},
        {"name": "Ab Wheel", "description": "Rueda abdominal", "muscle_group": "Abdomen"},
        
        # Cardio - ¡AGREGADOS!
        {"name": "Caminata", "description": "Caminata en cinta o exterior", "muscle_group": "Cardio"},
        {"name": "Correr", "description": "Carrera en cinta o exterior", "muscle_group": "Cardio"},
        {"name": "Bicicleta Estática", "description": "Cardio en bicicleta", "muscle_group": "Cardio"},
        {"name": "Elíptica", "description": "Cardio en máquina elíptica", "muscle_group": "Cardio"},
        {"name": "Remo Cardio", "description": "Cardio en máquina de remo", "muscle_group": "Cardio"},
        {"name": "HIIT", "description": "Entrenamiento de intervalos", "muscle_group": "Cardio"},
        {"name": "Burpees", "description": "Ejercicio cardio funcional", "muscle_group": "Cardio"},
        {"name": "Spinning", "description": "Clase de bicicleta indoor", "muscle_group": "Cardio"},
        {"name": "Step", "description": "Aeróbicos con step", "muscle_group": "Cardio"},
        
        # Funcional
        {"name": "Kettlebell Swing", "description": "Balanceo con pesa rusa", "muscle_group": "Funcional"},
        {"name": "Thrusters", "description": "Sentadilla + press overhead", "muscle_group": "Funcional"},
        {"name": "Clean and Press", "description": "Cargada y press", "muscle_group": "Funcional"},
        {"name": "Turkish Get-Up", "description": "Levantamiento turco", "muscle_group": "Funcional"},
        {"name": "Farmers Walk", "description": "Caminata del granjero", "muscle_group": "Funcional"},
        {"name": "Battle Ropes", "description": "Cuerdas de batalla", "muscle_group": "Funcional"},
        {"name": "Box Jumps", "description": "Saltos al cajón", "muscle_group": "Funcional"},
        {"name": "Wall Balls", "description": "Lanzamientos de balón medicinal", "muscle_group": "Funcional"},
    ]
    
    # Obtener nombres de ejercicios existentes
    existing_names = {ex.name for ex in db.query(Exercise).all()}
    print(f"Ejercicios existentes: {len(existing_names)}")
    
    # Agregar solo ejercicios nuevos
    for exercise_data in exercises:
        if exercise_data["name"] not in existing_names:
            exercise = Exercise(
                name=exercise_data["name"],
                description=exercise_data["description"],
                muscle_group=exercise_data["muscle_group"],
                user_id=None  # Predefined exercises
            )
            db.add(exercise)
            added_count += 1
            print(f"✅ Agregando: {exercise_data['name']} ({exercise_data['muscle_group']})")
        else:
            print(f"⏭️  Ya existe: {exercise_data['name']}")
    
    if added_count > 0:
        db.commit()
        print(f"\n🎉 ¡Se agregaron {added_count} ejercicios nuevos!")
    else:
        print("\n✅ Todos los ejercicios ya estaban en la base de datos.")
    
    # Mostrar resumen final
    final_count = db.query(Exercise).count()
    print(f"📊 Total ejercicios en BD: {final_count}")
    
    # Mostrar conteo por grupo muscular
    print("\n📋 Ejercicios por grupo muscular:")
    from sqlalchemy import func
    groups = db.query(Exercise.muscle_group, func.count(Exercise.id)).group_by(Exercise.muscle_group).all()
    for group, count in groups:
        print(f"   {group}: {count} ejercicios")
    
    db.close()

if __name__ == "__main__":
    seed_exercises()
