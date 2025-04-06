import React, { useEffect, useState } from 'react';
import { BookOpen, Users, GraduationCap, UserCheck } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config';
import { mockVolunteers } from '../../data/mockVolunteers';

interface Discipline {
  id: number;
  name: string;
  description: string;
  category: string;
}

interface Group {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
  maxMembers: number;
  currentMembers: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  dni: string;
  tutorId: number;
  discipline?: string;
  groupId?: number;
}

export default function DashboardStats() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchData = async () => {
      try {
        const [discRes, groupRes, studentRes] = await Promise.all([
          axios.get(`${API_URL}/api/disciplines`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/groups`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/students`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setDisciplines(discRes.data.data);
        setGroups(groupRes.data.data);
        setStudents(studentRes.data.data);
        setLoading(false);

        console.log('📊 Disciplinas:', discRes.data.data);
        console.log('📊 Grupos:', groupRes.data.data);
        console.log('📊 Alumnos:', studentRes.data.data);
      } catch (error: any) {
        console.error('❌ Error al obtener datos:', error.message);
        setApiError('Error al cargar estadísticas');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeVolunteers = mockVolunteers.filter((v) => v.status === 'active').length;

  const stats = [
    {
      label: 'Disciplinas',
      value: disciplines.length,
      icon: BookOpen,
      description: 'Total de disciplinas registradas',
      color: 'bg-blue-500',
    },
    {
      label: 'Grupos',
      value: groups.length,
      icon: Users,
      description: 'Total de grupos creados',
      color: 'bg-green-500',
    },
    {
      label: 'Alumnos',
      value: students.length,
      icon: GraduationCap,
      description: 'Total de alumnos registrados',
      color: 'bg-purple-500',
    },
    {
      label: 'Voluntarios Activos',
      value: activeVolunteers,
      icon: UserCheck,
      description: 'Voluntarios en estado activo',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div>
      {loading && (
        <p className="text-center text-gray-500 text-sm mb-4">Cargando estadísticas...</p>
      )}
      {apiError && (
        <p className="text-center text-red-500 text-sm mb-4">{apiError}</p>
      )}

      {/* Cards principales */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
            >
              <div>
                <div className={`absolute rounded-md p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-16 pt-1">
                  <p className="text-sm font-medium text-gray-500 truncate">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <span className="text-gray-500">{stat.description}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección adicional: Grupos por Disciplina */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📌 Grupos por Disciplina</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((disc) => {
            const cantidad = groups.filter((g) => g.discipline === disc.name).length;
            return (
              <div
                key={disc.id}
                className="bg-white shadow rounded-md p-4 border-l-4 border-blue-500"
              >
                <h3 className="text-md font-bold text-gray-800">{disc.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Grupos asociados: <strong>{cantidad}</strong>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
