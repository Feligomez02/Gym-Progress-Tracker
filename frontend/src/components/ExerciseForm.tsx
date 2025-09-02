'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { exercisesAPI, Exercise } from '@/lib/api';
import { Plus, X } from 'lucide-react';

interface ExerciseFormProps {
  onExerciseAdded: (exercise: Exercise) => void;
  onCancel: () => void;
}

interface ExerciseFormData {
  name: string;
  description?: string;
  muscle_group: string;
}

const muscleGroups = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Brazos',
  'Piernas',
  'Glúteos',
  'Abdomen',
  'Cardio',
  'Funcional',
  'Otro'
];

export default function ExerciseForm({ onExerciseAdded, onCancel }: ExerciseFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ExerciseFormData>();

  const onSubmit = async (data: ExerciseFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      const exercise = await exercisesAPI.create({
        name: data.name.trim(),
        description: data.description?.trim(),
        muscle_group: data.muscle_group,
      });
      onExerciseAdded(exercise);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear ejercicio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Agregar Ejercicio Personalizado</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Nombre del ejercicio *
          </label>
          <input
            {...register('name', { 
              required: 'El nombre es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' }
            })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="Ej: Press inclinado con mancuernas"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Grupo muscular *
          </label>
          <select
            {...register('muscle_group', { required: 'Selecciona un grupo muscular' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          >
            <option value="" className="text-gray-500">Seleccionar grupo muscular</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group} className="text-gray-900">
                {group}
              </option>
            ))}
          </select>
          {errors.muscle_group && (
            <p className="mt-1 text-sm text-red-600">{errors.muscle_group.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Descripción (opcional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            placeholder="Descripción del ejercicio, técnica, consejos..."
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              'Creando...'
            ) : (
              <>
                <Plus size={18} />
                Crear Ejercicio
              </>
            )}
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
    </div>
  );
}
