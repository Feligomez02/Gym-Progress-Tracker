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

  // Función para formatear los datos del workout según el tipo
  const formatWorkoutData = (workout: WorkoutEntry) => {
    const muscleGroup = workout.exercise.muscle_group;
    
    switch (muscleGroup) {
      case 'Cardio':
        return {
          primary: workout.time_minutes ? `${workout.time_minutes} min` : '-',
          secondary: workout.distance_km ? `${workout.distance_km} km` : '',
          label: 'Tiempo / Distancia'
        };
      case 'Abdomen':
        return {
          primary: workout.repetitions ? `${workout.repetitions} reps` : '-',
          secondary: workout.time_minutes ? `${workout.time_minutes} min` : '',
          label: 'Reps / Tiempo'
        };
      case 'Funcional':
        return {
          primary: workout.weight ? `${workout.weight} kg` : '-',
          secondary: workout.repetitions && workout.sets ? `${workout.sets} x ${workout.repetitions}` : '',
          label: 'Peso / Series'
        };
      default:
        return {
          primary: workout.weight ? `${workout.weight} kg` : '-',
          secondary: workout.repetitions && workout.sets ? `${workout.sets} x ${workout.repetitions}` : '',
          label: 'Peso / Series'
        };
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
              Métrica Principal
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Métrica Secundaria
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
          {workouts.map((workout) => {
            const workoutData = formatWorkoutData(workout);
            return (
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
                    {workoutData.primary}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {workoutData.secondary}
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
            );
          })}
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
    weight: workout.weight || 0,
    repetitions: workout.repetitions || 0,
    sets: workout.sets || 0,
    time_minutes: workout.time_minutes || 0,
    distance_km: workout.distance_km || 0,
    notes: workout.notes || '',
  });

  // Determinar qué campos mostrar según el grupo muscular
  const getFieldsForMuscleGroup = (muscleGroup: string) => {
    switch (muscleGroup) {
      case 'Cardio':
        return {
          showWeight: false,
          showReps: false,
          showSets: false,
          showTime: true,
          showDistance: true,
        };
      case 'Abdomen':
        return {
          showWeight: false,
          showReps: true,
          showSets: true,
          showTime: true,
          showDistance: false,
        };
      case 'Funcional':
        return {
          showWeight: true,
          showReps: true,
          showSets: true,
          showTime: false,
          showDistance: false,
        };
      default:
        return {
          showWeight: true,
          showReps: true,
          showSets: true,
          showTime: false,
          showDistance: false,
        };
    }
  };

  const fieldConfig = getFieldsForMuscleGroup(workout.exercise.muscle_group);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear payload solo con los campos relevantes
    const payload: any = { notes: formData.notes };
    
    if (fieldConfig.showWeight) payload.weight = formData.weight;
    if (fieldConfig.showReps) payload.repetitions = formData.repetitions;
    if (fieldConfig.showSets) payload.sets = formData.sets;
    if (fieldConfig.showTime) payload.time_minutes = formData.time_minutes;
    if (fieldConfig.showDistance) payload.distance_km = formData.distance_km;
    
    onSave(payload);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            Editar Entrenamiento
          </h3>
          <p className="modal-subtitle">
            Ejercicio: <strong>{workout.exercise.name}</strong> ({workout.exercise.muscle_group})
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campo Principal */}
            {fieldConfig.showWeight && (
              <div className="form-group">
                <label className="form-label">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            )}

            {fieldConfig.showTime && (
              <div className="form-group">
                <label className="form-label">Tiempo (min)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.time_minutes}
                  onChange={(e) => setFormData({ ...formData, time_minutes: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            )}

            {/* Campo Secundario */}
            {fieldConfig.showReps && (
              <div className="form-group">
                <label className="form-label">Repeticiones</label>
                <input
                  type="number"
                  value={formData.repetitions}
                  onChange={(e) => setFormData({ ...formData, repetitions: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            )}

            {fieldConfig.showDistance && (
              <div className="form-group">
                <label className="form-label">Distancia (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance_km}
                  onChange={(e) => setFormData({ ...formData, distance_km: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            )}

            {fieldConfig.showSets && (
              <div className="form-group">
                <label className="form-label">Series</label>
                <input
                  type="number"
                  value={formData.sets}
                  onChange={(e) => setFormData({ ...formData, sets: parseInt(e.target.value) || 0 })}
                  className="input-field"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Notas</label>
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
