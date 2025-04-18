import { useState, useEffect } from 'react';
import { LogOut, Layout, Users, BookOpen, Calendar, MessageSquare, UserCog, TrendingUp, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardStats from '../components/admin/DashboardStats';
import GroupsManagement from '../components/admin/groups/GroupsManagement';
import DisciplinesManagement from '../components/admin/disciplines/DisciplinesManagement';
import VolunteersManagement from '../components/admin/volunteers/VolunteersManagement';
import UserManagement from '../components/admin/users/UserManagement';
import CommunicationPanel from '../components/admin/communication/CommunicationPanel';
import ProgressPanel from '../components/admin/progress/ProgressPanel';
import TutorManagement from '../components/tutor/TutorManagement.tsx';
import StudentManagement from '../components/admin/students/StudentManagement';
import { useNavigate } from 'react-router-dom';

type TabType =
  | 'overview'
  | 'groups'
  | 'disciplines'
  | 'volunteers'
  | 'users'
  | 'communication'
  | 'progress'
  | 'students'
  | 'tutors';

const validTabs: TabType[] = [
  'overview', 'students', 'groups', 'disciplines',
  'volunteers', 'users', 'progress', 'communication', 'tutors'
];

const getInitialTab = (): TabType => {
  const saved = localStorage.getItem('adminTab');
  return validTabs.includes(saved as TabType) ? (saved as TabType) : 'overview';
};

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('adminTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!isLoading && !user) {
      console.warn('[AdminDashboard] ❌ No hay usuario. Redirigiendo al login.');
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [activeTab]);

  const tabs = [
    { id: 'overview', label: 'Vista General', icon: Layout },
    { id: 'students', label: 'Alumnos', icon: GraduationCap },
    { id: 'tutors', label: 'Tutores', icon: UserCog }, 
    { id: 'groups', label: 'Grupos', icon: Users },
    { id: 'disciplines', label: 'Disciplinas', icon: BookOpen },
    { id: 'volunteers', label: 'Voluntarios', icon: Calendar },
    { id: 'users', label: 'Usuarios', icon: UserCog },
    { id: 'progress', label: 'Progresos', icon: TrendingUp },
    { id: 'communication', label: 'Comunicación', icon: MessageSquare }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <DashboardStats />;
      case 'students': return <StudentManagement />;
      case 'tutors': return <TutorManagement />;
      case 'groups': return <GroupsManagement />;
      case 'disciplines': return <DisciplinesManagement />;
      case 'volunteers': return <VolunteersManagement />;
      case 'users': return <UserManagement />;
      case 'communication': return <CommunicationPanel />;
      case 'progress': return <ProgressPanel />;
      default: return <p className="text-center text-red-500">Error: pestaña desconocida</p>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-500 text-sm">Cargando usuario...</div>
      </div>
    );
  }

  console.log('[AdminDashboard] 👤 Usuario:', user);
  console.log('[AdminDashboard] 🧭 Pestaña activa:', activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16 items-center">
      <h1 className="text-2xl font-bold text-gray-800">Panel Administrativo</h1>
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

        <main>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-6 w-6 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-sm text-gray-500">Cargando contenido...</span>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
