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
  const [preSelectedExerciseId, setPreSelectedExerciseId] = useState<number | null>(null);
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
    setPreSelectedExerciseId(null); // Limpiar la pre-selección
  };

  const handleWorkoutUpdated = () => {
    loadData(); // Recargar todos los datos cuando se actualiza o elimina un workout
  };

  const handleExerciseAdded = (newExercise: Exercise) => {
    setExercises([...exercises, newExercise]);
    setShowExerciseForm(false);
  };

  // Nueva función para manejar click en ejercicio
  const handleExerciseClick = (exerciseId: number) => {
    setPreSelectedExerciseId(exerciseId);
    setShowWorkoutForm(true);
    // Scroll hacia el formulario de entrenamiento
    document.querySelector('[data-workout-form]')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  };

  // Función para cancelar el formulario y limpiar pre-selección
  const handleWorkoutFormCancel = () => {
    setShowWorkoutForm(false);
    setPreSelectedExerciseId(null);
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--gray-50)' }}>
      {/* Header mejorado */}
      <header className="header-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="fade-in">
              <h1 className="text-3xl font-bold" style={{ color: '#ffffff' }}>💪 Gym Tracker</h1>
              <p className="text-gray-200 mt-1">Bienvenido, <span className="text-white font-semibold">{user?.name}</span></p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-200 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card stats-card slide-up">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 107, 53, 0.1)' }}>
                  <TrendingUp className="h-8 w-8" style={{ color: 'var(--primary)' }} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-high-contrast">Total Entrenamientos</h3>
                  <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{workouts.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card stats-card stats-card-secondary slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: 'rgba(78, 205, 196, 0.1)' }}>
                  <BarChart3 className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-high-contrast">Ejercicios Disponibles</h3>
                  <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>{exercises.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card stats-card stats-card-accent slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                  <Plus className="h-8 w-8" style={{ color: 'var(--info)' }} />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-high-contrast">Esta Semana</h3>
                  <p className="text-3xl font-bold" style={{ color: 'var(--info)' }}>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Workout Form mejorado */}
          <div className="card fade-in" data-workout-form>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-high-contrast">Registrar Entrenamiento</h2>
              <p className="text-medium-contrast mt-1">
                {preSelectedExerciseId 
                  ? `Registrar ${exercises.find(e => e.id === preSelectedExerciseId)?.name || 'ejercicio'}`
                  : 'Añade un nuevo registro de ejercicio'
                }
              </p>
            </div>
            <div className="p-6">
              {showWorkoutForm ? (
                <WorkoutForm
                  exercises={exercises}
                  preSelectedExerciseId={preSelectedExerciseId}
                  onWorkoutAdded={handleWorkoutAdded}
                  onCancel={handleWorkoutFormCancel}
                />
              ) : (
                <button
                  onClick={() => setShowWorkoutForm(true)}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-lg text-medium-contrast hover:border-primary hover:text-primary transition-all duration-200 hover:bg-gray-50"
                  style={{ borderColor: 'var(--gray-300)' }}
                >
                  <Plus size={24} />
                  <span className="font-medium">Agregar Entrenamiento</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Chart mejorado */}
          <div className="card fade-in">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-high-contrast">Progreso</h2>
              <p className="text-medium-contrast mt-1">Visualiza tu evolución</p>
            </div>
            <div className="p-6">
              <select
                value={selectedExerciseForChart || ''}
                onChange={(e) => setSelectedExerciseForChart(Number(e.target.value) || null)}
                className="input-field mb-4"
              >
                <option value="">Seleccionar ejercicio para ver progreso</option>
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

                  // Orden preferido de grupos musculares con iconos
                  const muscleGroupsWithIcons = [
                    { name: 'Pecho', icon: '💪' },
                    { name: 'Espalda', icon: '🏋️' },
                    { name: 'Piernas', icon: '🦵' },
                    { name: 'Glúteos', icon: '🍑' },
                    { name: 'Hombros', icon: '💪' },
                    { name: 'Brazos', icon: '💪' },
                    { name: 'Abdomen', icon: '🔥' },
                    { name: 'Cardio', icon: '🏃' },
                    { name: 'Funcional', icon: '⚡' },
                    { name: 'Otro', icon: '🏃' }
                  ];

                  return muscleGroupsWithIcons.map(({ name, icon }) => {
                    const exercisesInGroup = groupedExercises[name];
                    if (!exercisesInGroup || exercisesInGroup.length === 0) return null;

                    return (
                      <optgroup key={name} label={`${icon} ${name}`}>
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
              {selectedExerciseForChart ? (
                <div className="slide-up">
                  <ProgressChart exerciseId={selectedExerciseForChart} />
                </div>
              ) : (
                <div className="text-center text-low-contrast py-12">
                  <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Selecciona un ejercicio</p>
                  <p className="text-sm">para ver tu progreso</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Exercise Management mejorado con agrupación */}
        <div className="mt-8 card fade-in">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-high-contrast">Gestión de Ejercicios</h2>
                <p className="text-medium-contrast mt-1">Administra tu catálogo de ejercicios agrupados por músculo</p>
              </div>
              <button
                onClick={() => setShowExerciseForm(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Dumbbell size={18} />
                Agregar Ejercicio
              </button>
            </div>
          </div>
          <div className="p-6">
            {showExerciseForm ? (
              <div className="slide-up">
                <ExerciseForm
                  onExerciseAdded={handleExerciseAdded}
                  onCancel={() => setShowExerciseForm(false)}
                />
              </div>
            ) : (
              <div className="space-y-8">
                {exercises.length > 0 ? (
                  (() => {
                    // Agrupar ejercicios por muscle_group
                    const groupedExercises = exercises.reduce((groups, exercise) => {
                      const group = exercise.muscle_group;
                      if (!groups[group]) {
                        groups[group] = [];
                      }
                      groups[group].push(exercise);
                      return groups;
                    }, {} as Record<string, typeof exercises>);

                    // Definir orden de grupos y iconos
                    const muscleGroupOrder = [
                      { name: 'Pecho', icon: '💪', color: 'var(--primary)' },
                      { name: 'Espalda', icon: '🏋️', color: 'var(--accent)' },
                      { name: 'Piernas', icon: '🦵', color: 'var(--secondary)' },
                      { name: 'Glúteos', icon: '🍑', color: '#E91E63' },
                      { name: 'Hombros', icon: '💪', color: '#FF9800' },
                      { name: 'Brazos', icon: '💪', color: '#9C27B0' },
                      { name: 'Abdomen', icon: '🔥', color: '#F44336' },
                      { name: 'Cardio', icon: '🏃', color: '#2196F3' },
                      { name: 'Funcional', icon: '⚡', color: '#4CAF50' },
                      { name: 'Otro', icon: '🏃', color: 'var(--gray-600)' }
                    ];

                    return muscleGroupOrder.map((muscleGroup, groupIndex) => {
                      const exercisesInGroup = groupedExercises[muscleGroup.name];
                      if (!exercisesInGroup || exercisesInGroup.length === 0) return null;

                      return (
                        <div 
                          key={muscleGroup.name} 
                          className="fade-in"
                          style={{ animationDelay: `${groupIndex * 0.1}s` }}
                        >
                          {/* Header del grupo muscular */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{muscleGroup.icon}</span>
                            <div>
                              <h3 
                                className="text-lg font-semibold"
                                style={{ color: muscleGroup.color }}
                              >
                                {muscleGroup.name}
                              </h3>
                              <p className="text-sm text-medium-contrast">
                                {exercisesInGroup.length} ejercicio{exercisesInGroup.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          {/* Grid de ejercicios del grupo */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-8">
                            {exercisesInGroup.map((exercise, index) => (
                              <div 
                                key={exercise.id} 
                                onClick={() => handleExerciseClick(exercise.id)}
                                className="card border border-gray-200 p-4 hover:shadow-md transition-all duration-200 slide-up cursor-pointer hover:scale-105 group"
                                style={{ 
                                  animationDelay: `${(groupIndex * 0.1) + (index * 0.05)}s`,
                                  borderLeft: `4px solid ${muscleGroup.color}`
                                }}
                                title="Click para registrar entrenamiento con este ejercicio"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-high-contrast group-hover:text-primary transition-colors">
                                      {exercise.name}
                                    </h4>
                                    {exercise.description && (
                                      <p className="text-sm text-medium-contrast mt-2 line-clamp-2">
                                        {exercise.description}
                                      </p>
                                    )}
                                    {/* Indicador visual de que es clickeable */}
                                    <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Plus size={14} style={{ color: 'var(--primary)' }} />
                                      <span className="text-xs text-primary font-medium">
                                        Click para entrenar
                                      </span>
                                    </div>
                                  </div>
                                  <span 
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      exercise.user_id 
                                        ? 'text-white' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                    style={{
                                      backgroundColor: exercise.user_id ? muscleGroup.color : undefined
                                    }}
                                  >
                                    {exercise.user_id ? 'Personal' : 'Predefinido'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }).filter(Boolean);
                  })()
                ) : (
                  <div className="text-center text-low-contrast py-12">
                    <Dumbbell size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-medium">No hay ejercicios disponibles</p>
                    <p className="text-sm">Agrega tu primer ejercicio personalizado</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Workouts mejorado */}
        <div className="mt-8 card fade-in">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-high-contrast">Entrenamientos Recientes</h2>
                <p className="text-medium-contrast mt-1">Últimos 10 entrenamientos registrados</p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-primary text-white">
                {workouts.length} total
              </span>
            </div>
          </div>
          <div className="p-6">
            <WorkoutList workouts={workouts.slice(0, 10)} onWorkoutUpdated={handleWorkoutUpdated} />
          </div>
        </div>
      </main>
    </div>
  );
}
