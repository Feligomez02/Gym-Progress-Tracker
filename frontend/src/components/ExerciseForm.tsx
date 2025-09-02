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
    <div className="card p-6 slide-up">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-high-contrast">Agregar Ejercicio Personalizado</h3>
        <button
          onClick={onCancel}
          className="text-low-contrast hover:text-medium-contrast transition-colors p-1 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-group">
          <label className="form-label">
            Nombre del Ejercicio
          </label>
          <input
            {...register('name', { 
              required: 'El nombre es requerido',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' }
            })}
            type="text"
            className="input-field"
            placeholder="Ej: Press inclinado con mancuernas"
          />
          {errors.name && (
            <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Grupo Muscular
          </label>
          <select
            {...register('muscle_group', { required: 'Selecciona un grupo muscular' })}
            className="input-field"
          >
            <option value="">Seleccionar grupo muscular</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          {errors.muscle_group && (
            <p className="mt-1 text-sm" style={{ color: 'var(--danger)' }}>
              {errors.muscle_group.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Descripción (opcional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="input-field"
            placeholder="Descripción del ejercicio, técnica, consejos..."
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
            className="btn-secondary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus size={16} />
                Crear Ejercicio
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
