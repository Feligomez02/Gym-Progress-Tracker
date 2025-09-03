'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { workoutsAPI, Exercise, WorkoutEntry } from '@/lib/api';

interface WorkoutFormProps {
  exercises: Exercise[];
  preSelectedExerciseId?: number | null;
  onWorkoutAdded: (workout: WorkoutEntry) => void;
  onCancel: () => void;
}

interface WorkoutFormData {
  exercise_id: number;
  weight: number;
  repetitions: number;
  sets: number;
  time?: number; // Para cardio y abdomen
  distance?: number; // Para cardio
  notes?: string;
}

export default function WorkoutForm({ exercises, preSelectedExerciseId, onWorkoutAdded, onCancel }: WorkoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<WorkoutFormData>();

  // Observar el ejercicio seleccionado
  const watchedExerciseId = watch('exercise_id');
  
  // Actualizar ejercicio seleccionado cuando cambie
  useEffect(() => {
    if (watchedExerciseId) {
      const exercise = exercises.find(ex => ex.id === Number(watchedExerciseId));
      setSelectedExercise(exercise || null);
    }
  }, [watchedExerciseId, exercises]);

  // Pre-seleccionar ejercicio si se proporciona
  useEffect(() => {
    if (preSelectedExerciseId && exercises.length > 0) {
      setValue('exercise_id', preSelectedExerciseId);
      const exercise = exercises.find(ex => ex.id === preSelectedExerciseId);
      setSelectedExercise(exercise || null);
    }
  }, [preSelectedExerciseId, exercises, setValue]);

  // Determinar qué campos mostrar según el grupo muscular
  const getFieldsForMuscleGroup = (muscleGroup: string | undefined) => {
    switch (muscleGroup) {
      case 'Cardio':
        return {
          showWeight: false,
          showReps: false,
          showSets: false,
          showTime: true,
          showDistance: true,
          primaryLabel: 'Tiempo (min)',
          secondaryLabel: 'Distancia (km)',
          placeholder1: '30',
          placeholder2: '5'
        };
      case 'Abdomen':
        return {
          showWeight: false,
          showReps: true,
          showSets: true,
          showTime: true,
          showDistance: false,
          primaryLabel: 'Repeticiones',
          secondaryLabel: 'Tiempo (min)',
          placeholder1: '20',
          placeholder2: '5'
        };
      case 'Funcional':
        return {
          showWeight: true,
          showReps: true,
          showSets: true,
          showTime: false,
          showDistance: false,
          primaryLabel: 'Peso (kg)',
          secondaryLabel: 'Repeticiones',
          placeholder1: '20',
          placeholder2: '15'
        };
      default:
        return {
          showWeight: true,
          showReps: true,
          showSets: true,
          showTime: false,
          showDistance: false,
          primaryLabel: 'Peso (kg)',
          secondaryLabel: 'Repeticiones',
          placeholder1: '50',
          placeholder2: '10'
        };
    }
  };

  const fieldConfig = getFieldsForMuscleGroup(selectedExercise?.muscle_group);

  const onSubmit = async (data: WorkoutFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Construir el payload según el tipo de ejercicio
      const payload: any = {
        exercise_id: Number(data.exercise_id),
        notes: data.notes,
      };

      // Agregar campos según la configuración del ejercicio
      if (fieldConfig.showWeight && data.weight !== undefined) {
        payload.weight = Number(data.weight);
      }
      if (fieldConfig.showReps && data.repetitions !== undefined) {
        payload.repetitions = Number(data.repetitions);
      }
      if (fieldConfig.showSets && data.sets !== undefined) {
        payload.sets = Number(data.sets);
      }
      if (fieldConfig.showTime && data.time !== undefined) {
        payload.time_minutes = Number(data.time);
      }
      if (fieldConfig.showDistance && data.distance !== undefined) {
        payload.distance_km = Number(data.distance);
      }

      const workout = await workoutsAPI.create(payload);
      onWorkoutAdded(workout);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar entrenamiento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="form-group">
        <label className="form-label">
          Ejercicio
        </label>
        <select
          {...register('exercise_id', { required: 'Selecciona un ejercicio' })}
          className="input-field"
        >
          <option value="">Seleccionar ejercicio</option>
          {(() => {
            // Agrupar ejercicios por muscle_group
            const groupedExercises = exercises.reduce((groups, exercise) => {
              const group = exercise.muscle_group;
              if (!groups[group]) {
                groups[group] = [];
              }
              groups[group].push(exercise);
              return groups;
            }, {} as Record<string, typeof exercises>);

            // Orden preferido de grupos musculares
            const preferredOrder = [
              'Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros', 
              'Brazos', 'Abdomen', 'Cardio', 'Funcional', 'Otro'
            ];

            return preferredOrder.map(muscleGroup => {
              const exercisesInGroup = groupedExercises[muscleGroup];
              if (!exercisesInGroup || exercisesInGroup.length === 0) return null;

              return (
                <optgroup key={muscleGroup} label={`💪 ${muscleGroup}`}>
                  {exercisesInGroup
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((exercise) => (
                      <option key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </option>
                    ))}
                </optgroup>
              );
            }).filter(Boolean);
          })()}
        </select>
        {errors.exercise_id && (
          <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
            {errors.exercise_id.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Campo Principal (Peso, Tiempo, etc.) */}
        {(fieldConfig.showWeight || fieldConfig.showTime) && (
          <div className="form-group">
            <label className="form-label">
              {fieldConfig.primaryLabel}
            </label>
            <input
              {...register(fieldConfig.showWeight ? 'weight' : 'time', { 
                required: `${fieldConfig.primaryLabel} es requerido`,
                min: { value: 0, message: `${fieldConfig.primaryLabel} debe ser positivo` }
              })}
              type="number"
              step={fieldConfig.showWeight ? "0.5" : "1"}
              className="input-field"
              placeholder={fieldConfig.placeholder1}
            />
            {errors.weight && fieldConfig.showWeight && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
                {errors.weight.message}
              </p>
            )}
            {errors.time && !fieldConfig.showWeight && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
                {errors.time?.message}
              </p>
            )}
          </div>
        )}

        {/* Campo Secundario (Repeticiones, Distancia) */}
        {(fieldConfig.showReps || fieldConfig.showDistance) && (
          <div className="form-group">
            <label className="form-label">
              {fieldConfig.secondaryLabel}
            </label>
            <input
              {...register(fieldConfig.showReps ? 'repetitions' : 'distance', { 
                required: `${fieldConfig.secondaryLabel} es requerido`,
                min: { value: fieldConfig.showReps ? 1 : 0, message: `${fieldConfig.secondaryLabel} debe ser positivo` }
              })}
              type="number"
              step={fieldConfig.showDistance ? "0.1" : "1"}
              className="input-field"
              placeholder={fieldConfig.placeholder2}
            />
            {errors.repetitions && fieldConfig.showReps && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
                {errors.repetitions.message}
              </p>
            )}
            {errors.distance && fieldConfig.showDistance && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
                {errors.distance?.message}
              </p>
            )}
          </div>
        )}

        {/* Series - Solo para ejercicios que no sean cardio puro */}
        {fieldConfig.showSets && (
          <div className="form-group">
            <label className="form-label">
              Series
            </label>
            <input
              {...register('sets', { 
                required: 'Las series son requeridas',
                min: { value: 1, message: 'Mínimo 1 serie' }
              })}
              type="number"
              className="input-field"
              placeholder="3"
            />
            {errors.sets && (
              <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
                {errors.sets.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mostrar información contextual según el tipo de ejercicio */}
      {selectedExercise && (
        <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', border: '1px solid var(--primary)' }}>
          <p className="text-sm" style={{ color: 'var(--primary)' }}>
            <strong>{selectedExercise.muscle_group}:</strong> {selectedExercise.description}
            {selectedExercise.muscle_group === 'Cardio' && (
              <span className="block mt-1 text-xs opacity-75">
                💡 Para cardio, registra el tiempo principal y distancia si aplica
              </span>
            )}
            {selectedExercise.muscle_group === 'Abdomen' && (
              <span className="block mt-1 text-xs opacity-75">
                💡 Para abdomen, registra repeticiones y tiempo total del ejercicio
              </span>
            )}
            {selectedExercise.muscle_group === 'Funcional' && (
              <span className="block mt-1 text-xs opacity-75">
                💡 Para ejercicios funcionales, usa el peso del implemento si aplica
              </span>
            )}
          </p>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          Notas (opcional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="input-field"
          placeholder="Agrega cualquier observación sobre el entrenamiento..."
        />
      </div>

      {error && (
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', border: '1px solid var(--danger)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Guardando...
            </div>
          ) : (
            'Registrar Entrenamiento'
          )}
        </button>
      </div>
    </form>
  );
}
