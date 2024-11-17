import React from 'react';
import { BookOpen, Users, GraduationCap, UserCheck } from 'lucide-react';
import { mockDisciplines } from '../../data/mockDisciplines';
import { mockGroups } from '../../data/mockGroups';
import { mockStudents } from '../../data/mockStudents';
import { mockVolunteers } from '../../data/mockVolunteers';

interface Stat {
  label: string;
  value: number;
  icon: React.ElementType;
  description: string;
  color: string;
}

export default function DashboardStats() {
  // Calcular estadísticas
  const activeVolunteers = mockVolunteers.filter(v => v.status === 'active').length;

  const stats: Stat[] = [
    { 
      label: 'Disciplinas',
      value: mockDisciplines.length,
      icon: BookOpen,
      description: 'Total de disciplinas registradas',
      color: 'bg-blue-500'
    },
    { 
      label: 'Grupos',
      value: mockGroups.length,
      icon: Users,
      description: 'Total de grupos creados',
      color: 'bg-green-500'
    },
    { 
      label: 'Alumnos',
      value: mockStudents.length,
      icon: GraduationCap,
      description: 'Total de alumnos registrados',
      color: 'bg-purple-500'
    },
    { 
      label: 'Voluntarios Activos',
      value: activeVolunteers,
      icon: UserCheck,
      description: 'Voluntarios en estado activo',
      color: 'bg-indigo-500'
    }
  ];

  return (
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
                <span className="text-gray-500">
                  {stat.description}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}