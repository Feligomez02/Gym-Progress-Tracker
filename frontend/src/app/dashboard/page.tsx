'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { exercisesAPI, workoutsAPI, Exercise, WorkoutEntry } from '@/lib/api';
import { Plus, TrendingUp, BarChart3, LogOut, Dumbbell } from 'lucide-react';
import WorkoutForm from '@/components/WorkoutForm';
import WorkoutList from '@/components/WorkoutList';
import ProgressChart from '@/components/ProgressChart';
import ExerciseForm from '@/components/ExerciseForm';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [selectedExerciseForChart, setSelectedExerciseForChart] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) {
      return;
    }
    
    try {
      const [exercisesData, workoutsData] = await Promise.all([
        exercisesAPI.getAll(),
        workoutsAPI.getAll()
      ]);
      setExercises(exercisesData);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutAdded = (newWorkout: WorkoutEntry) => {
    setWorkouts([newWorkout, ...workouts]);
    setShowWorkoutForm(false);
  };

  const handleExerciseAdded = (newExercise: Exercise) => {
    setExercises([...exercises, newExercise]);
    setShowExerciseForm(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gym Tracker</h1>
              <p className="text-gray-600">Bienvenido, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Entrenamientos</h3>
                <p className="text-3xl font-bold text-blue-600">{workouts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Ejercicios Disponibles</h3>
                <p className="text-3xl font-bold text-green-600">{exercises.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Plus className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Esta Semana</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {workouts.filter(w => {
                    const workoutDate = new Date(w.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return workoutDate >= weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout Form */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Registrar Entrenamiento</h2>
            </div>
            <div className="p-6">
              {showWorkoutForm ? (
                <WorkoutForm
                  exercises={exercises}
                  onWorkoutAdded={handleWorkoutAdded}
                  onCancel={() => setShowWorkoutForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowWorkoutForm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus size={24} />
                  Agregar Entrenamiento
                </button>
              )}
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Progreso</h2>
              <select
                value={selectedExerciseForChart || ''}
                onChange={(e) => setSelectedExerciseForChart(Number(e.target.value) || null)}
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-500">Seleccionar ejercicio</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id} className="text-gray-900">
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="p-6">
              {selectedExerciseForChart ? (
                <ProgressChart exerciseId={selectedExerciseForChart} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Selecciona un ejercicio para ver el progreso
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Management */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Gestión de Ejercicios</h2>
              <button
                onClick={() => setShowExerciseForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Dumbbell size={18} />
                Agregar Ejercicio
              </button>
            </div>
          </div>
          <div className="p-6">
            {showExerciseForm ? (
              <ExerciseForm
                onExerciseAdded={handleExerciseAdded}
                onCancel={() => setShowExerciseForm(false)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.length > 0 ? (
                  exercises.map((exercise) => (
                    <div key={exercise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                          <p className="text-sm text-blue-600 mt-1">{exercise.muscle_group}</p>
                          {exercise.description && (
                            <p className="text-sm text-gray-600 mt-2">{exercise.description}</p>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {exercise.user_id ? 'Personal' : 'Predefinido'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    <Dumbbell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No hay ejercicios disponibles</p>
                    <p className="text-sm">Agrega tu primer ejercicio personalizado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Workouts */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Entrenamientos Recientes</h2>
          </div>
          <div className="p-6">
            <WorkoutList workouts={workouts.slice(0, 10)} />
          </div>
        </div>
      </main>
    </div>
  );
}
