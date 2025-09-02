'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { workoutsAPI, Exercise, WorkoutEntry } from '@/lib/api';

interface WorkoutFormProps {
  exercises: Exercise[];
  onWorkoutAdded: (workout: WorkoutEntry) => void;
  onCancel: () => void;
}

interface WorkoutFormData {
  exercise_id: number;
  weight: number;
  repetitions: number;
  sets: number;
  notes?: string;
}

export default function WorkoutForm({ exercises, onWorkoutAdded, onCancel }: WorkoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm<WorkoutFormData>();

  const onSubmit = async (data: WorkoutFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const workout = await workoutsAPI.create({
        exercise_id: Number(data.exercise_id),
        weight: Number(data.weight),
        repetitions: Number(data.repetitions),
        sets: Number(data.sets),
        notes: data.notes,
      });
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
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name} - {exercise.muscle_group}
            </option>
          ))}
        </select>
        {errors.exercise_id && (
          <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
            {errors.exercise_id.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">
            Peso (kg)
          </label>
          <input
            {...register('weight', { 
              required: 'El peso es requerido',
              min: { value: 0, message: 'El peso debe ser positivo' }
            })}
            type="number"
            step="0.5"
            className="input-field"
            placeholder="50"
          />
          {errors.weight && (
            <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
              {errors.weight.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Repeticiones
          </label>
          <input
            {...register('repetitions', { 
              required: 'Las repeticiones son requeridas',
              min: { value: 1, message: 'Mínimo 1 repetición' }
            })}
            type="number"
            className="input-field"
            placeholder="10"
          />
          {errors.repetitions && (
            <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
              {errors.repetitions.message}
            </p>
          )}
        </div>

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
      </div>

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
