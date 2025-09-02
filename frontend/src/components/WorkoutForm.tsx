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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Ejercicio
        </label>
        <select
          {...register('exercise_id', { required: 'Selecciona un ejercicio' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
        >
          <option value="" className="text-gray-500">Seleccionar ejercicio</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id} className="text-gray-900">
              {exercise.name} - {exercise.muscle_group}
            </option>
          ))}
        </select>
        {errors.exercise_id && (
          <p className="mt-1 text-sm text-red-600">{errors.exercise_id.message}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Peso (kg)
          </label>
          <input
            {...register('weight', { 
              required: 'El peso es requerido',
              min: { value: 0, message: 'El peso debe ser positivo' }
            })}
            type="number"
            step="0.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="50"
          />
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Repeticiones
          </label>
          <input
            {...register('repetitions', { 
              required: 'Las repeticiones son requeridas',
              min: { value: 1, message: 'Mínimo 1 repetición' }
            })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="10"
          />
          {errors.repetitions && (
            <p className="mt-1 text-sm text-red-600">{errors.repetitions.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Series
          </label>
          <input
            {...register('sets', { 
              required: 'Las series son requeridas',
              min: { value: 1, message: 'Mínimo 1 serie' }
            })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="3"
          />
          {errors.sets && (
            <p className="mt-1 text-sm text-red-600">{errors.sets.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Notas (opcional)
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          placeholder="Notas sobre el entrenamiento..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Guardando...' : 'Guardar Entrenamiento'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
