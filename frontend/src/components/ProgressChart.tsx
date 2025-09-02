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
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--primary)' }}></div>
          <p className="mt-2 text-sm" style={{ color: 'var(--gray-600)' }}>Cargando progreso...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="font-medium" style={{ color: 'var(--danger)' }}>{error}</p>
          <p className="text-sm mt-1" style={{ color: 'var(--gray-600)' }}>Intenta recargar la página</p>
        </div>
      </div>
    );
  }

  if (!progressData || progressData.progress_data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-medium" style={{ color: 'var(--gray-700)' }}>No hay datos de progreso para este ejercicio</p>
        <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>Registra algunos entrenamientos para ver tu evolución</p>
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
          <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
            {progressData.max_weight} kg
          </div>
          <div className="text-sm" style={{ color: 'var(--gray-600)' }}>Peso Máximo</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            {progressData.avg_weight.toFixed(1)} kg
          </div>
          <div className="text-sm" style={{ color: 'var(--gray-600)' }}>Promedio</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>
            {progressData.last_weight} kg
          </div>
          <div className="text-sm" style={{ color: 'var(--gray-600)' }}>Último</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--info)' }}>
            {progressData.total_sessions}
          </div>
          <div className="text-sm" style={{ color: 'var(--gray-600)' }}>Sesiones</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: 'var(--gray-700)' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--gray-700)' }}
              label={{ 
                value: 'Peso (kg)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'var(--gray-700)' }
              }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                name === 'weight' ? `${value} kg` : value,
                name === 'weight' ? 'Peso' : name === 'reps' ? 'Repeticiones' : 'Series'
              ]}
              labelFormatter={(label) => `Fecha: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'var(--gray-900)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="var(--primary)" 
              strokeWidth={3}
              dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'var(--primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
