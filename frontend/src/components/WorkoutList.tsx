'use client';

import { WorkoutEntry, workoutsAPI } from '@/lib/api';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface WorkoutListProps {
  workouts: WorkoutEntry[];
  onWorkoutUpdated: () => void;
}

export default function WorkoutList({ workouts, onWorkoutUpdated }: WorkoutListProps) {
  const [editingWorkout, setEditingWorkout] = useState<WorkoutEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleEdit = (workout: WorkoutEntry) => {
    setEditingWorkout(workout);
  };

  const handleDelete = async (workoutId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      return;
    }

    setIsDeleting(workoutId);
    try {
      await workoutsAPI.delete(workoutId);
      onWorkoutUpdated();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Error al eliminar el entrenamiento');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async (workoutData: any) => {
    if (!editingWorkout) return;

    try {
      await workoutsAPI.update(editingWorkout.id, workoutData);
      setEditingWorkout(null);
      onWorkoutUpdated();
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Error al actualizar el entrenamiento');
    }
  };

  if (workouts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay entrenamientos registrados aún
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ejercicio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Peso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Series x Reps
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workouts.map((workout) => (
            <tr key={workout.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {workout.exercise.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {workout.exercise.muscle_group}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {workout.weight} kg
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {workout.sets} x {workout.repetitions}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(workout.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {workout.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(workout)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                    title="Editar entrenamiento"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    disabled={isDeleting === workout.id}
                    className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                    title="Eliminar entrenamiento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      {editingWorkout && (
        <EditWorkoutModal
          workout={editingWorkout}
          onSave={handleUpdate}
          onCancel={() => setEditingWorkout(null)}
        />
      )}
    </div>
  );
}

// Componente modal para editar workout
interface EditWorkoutModalProps {
  workout: WorkoutEntry;
  onSave: (data: any) => void;
  onCancel: () => void;
}

function EditWorkoutModal({ workout, onSave, onCancel }: EditWorkoutModalProps) {
  const [formData, setFormData] = useState({
    weight: workout.weight,
    repetitions: workout.repetitions,
    sets: workout.sets,
    notes: workout.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            Editar Entrenamiento
          </h3>
          <p className="modal-subtitle">
            Ejercicio: <strong>{workout.exercise.name}</strong>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                Repeticiones
              </label>
              <input
                type="number"
                value={formData.repetitions}
                onChange={(e) => setFormData({ ...formData, repetitions: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Series
              </label>
              <input
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Agrega cualquier observación..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
