"""
Script de migración para agregar campos time_minutes y distance_km a WorkoutEntry
"""
import sqlite3
import os

def migrate_database():
    db_path = os.path.join(os.path.dirname(__file__), "gym_tracker.db")
    print(f"Migrando base de datos en: {db_path}")
    
    # Conectar a la base de datos
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar si las columnas ya existen
        cursor.execute("PRAGMA table_info(workout_entries)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Columnas actuales: {columns}")
        
        # Agregar columna time_minutes si no existe
        if 'time_minutes' not in columns:
            print("Agregando columna time_minutes...")
            cursor.execute("ALTER TABLE workout_entries ADD COLUMN time_minutes REAL")
            print("✅ Columna time_minutes agregada")
        else:
            print("⏭️  Columna time_minutes ya existe")
        
        # Agregar columna distance_km si no existe
        if 'distance_km' not in columns:
            print("Agregando columna distance_km...")
            cursor.execute("ALTER TABLE workout_entries ADD COLUMN distance_km REAL")
            print("✅ Columna distance_km agregada")
        else:
            print("⏭️  Columna distance_km ya existe")
        
        # Hacer las columnas weight, repetitions y sets opcionales
        # (SQLite no permite modificar columnas, pero los campos ya son compatibles)
        
        # Commit de los cambios
        conn.commit()
        print("\n🎉 ¡Migración completada exitosamente!")
        
        # Mostrar estructura final
        cursor.execute("PRAGMA table_info(workout_entries)")
        columns = cursor.fetchall()
        print("\n📋 Estructura final de workout_entries:")
        for column in columns:
            print(f"   {column[1]} ({column[2]}) - {'NOT NULL' if column[3] else 'NULLABLE'}")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
