import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Layout, Users, BookOpen, Calendar, MessageSquare, UserCog, TrendingUp, GraduationCap } from 'lucide-react';
import DashboardStats from '../components/admin/DashboardStats';
import GroupsManagement from '../components/admin/groups/GroupsManagement';
import DisciplinesManagement from '../components/admin/disciplines/DisciplinesManagement';
import VolunteersManagement from '../components/admin/volunteers/VolunteersManagement';
import UserManagement from '../components/admin/users/UserManagement';
import CommunicationPanel from '../components/admin/communication/CommunicationPanel';
import ProgressPanel from '../components/admin/progress/ProgressPanel';
import StudentManagement from '../components/admin/students/StudentManagement';

type TabType = 'overview' | 'groups' | 'disciplines' | 'volunteers' | 'users' | 'communication' | 'progress' | 'students';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: Layout },
    { id: 'students', label: 'Alumnos', icon: GraduationCap },
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'disciplines', label: 'Disciplinas', icon: BookOpen },
    { id: 'volunteers', label: 'Voluntarios', icon: Calendar },
    { id: 'users', label: 'Usuarios', icon: UserCog },
    { id: 'progress', label: 'Progresos', icon: TrendingUp },
    { id: 'communication', label: 'Comunicación', icon: MessageSquare }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardStats />;
      case 'students':
        return <StudentManagement />;
      case 'groups':
        return <GroupsManagement />;
      case 'disciplines':
        return <DisciplinesManagement />;
      case 'volunteers':
        return <VolunteersManagement />;
      case 'users':
        return <UserManagement />;
      case 'communication':
        return <CommunicationPanel />;
      case 'progress':
        return <ProgressPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel Administrativo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user?.name}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`
                  group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm
                  ${activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}