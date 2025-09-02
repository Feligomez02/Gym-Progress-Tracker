'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { workoutsAPI, ProgressStats } from '@/lib/api';

interface ProgressChartProps {
  exerciseId: number;
}

export default function ProgressChart({ exerciseId }: ProgressChartProps) {
  const [progressData, setProgressData] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgressData();
  }, [exerciseId]);

  const loadProgressData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await workoutsAPI.getProgress(exerciseId);
      setProgressData(data);
    } catch (err: any) {
      setError('Error al cargar datos de progreso');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        {error}
      </div>
    );
  }

  if (!progressData || progressData.progress_data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay datos de progreso para este ejercicio
      </div>
    );
  }

  const chartData = progressData.progress_data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {progressData.max_weight} kg
          </div>
          <div className="text-sm text-gray-500">Peso Máximo</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {progressData.avg_weight.toFixed(1)} kg
          </div>
          <div className="text-sm text-gray-500">Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {progressData.last_weight} kg
          </div>
          <div className="text-sm text-gray-500">Último</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {progressData.total_sessions}
          </div>
          <div className="text-sm text-gray-500">Sesiones</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'weight' ? `${value} kg` : value,
                name === 'weight' ? 'Peso' : name === 'reps' ? 'Repeticiones' : 'Series'
              ]}
              labelFormatter={(label) => `Fecha: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
