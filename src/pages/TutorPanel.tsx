import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, TrendingUp, LogOut, MessageSquare, FileText } from 'lucide-react';
import MessagingPanel from '../components/tutor/MessagingPanel';
import ProgressHistory from '../components/tutor/ProgressHistory';
import MedicalRecordForm from '../components/tutor/MedicalRecordForm';
import axios from 'axios';
import { API_URL } from '../config';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  dni: string;
  tutorId: number;
  discipline?: string;
  groupId?: number;
  diagnosis?: string;
  allergies?: string;
  medications?: string;
  observations?: string;
  lastUpdate?: string;
  volunteerNotes?: string;
}

interface Volunteer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  rating?: number;
  groupId?: number; // si tenés asignación explícita, mejor aún
}

interface Alumno {
  id: number;
  nombre: string;
  progreso: Array<{
    fecha: string;
    asistencia: boolean;
    desempeño: string;
    actividades: string[];
    notas: string;
  }>;
  voluntario: {
    nombre: string;
    email: string;
    rating?: number;
  };
  fichamedica: {
    alergias: string[];
    medicamentos: string[];
    condiciones: string[];
    observaciones: string;
    ultimaActualizacion: string;
    grupoSanguineo?: string;
    contactoEmergencia: {
      nombre: string;
      telefono: string;
      relacion: string;
    };
  };
  discipline?: string;
  groupId?: number;
}

interface Group {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
}

export default function TutorPanel() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [studentsRes, groupsRes, volunteersRes] = await Promise.all([
          axios.get(`${API_URL}/api/students`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/groups`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/volunteers`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);
        setStudents(studentsRes.data.data);
        setGroups(groupsRes.data.data);
        setVolunteers(volunteersRes.data.data);
      } catch (error) {
        console.error('❌ Error al obtener datos:', error);
      }
    };
    fetchData();
  }, []);

  const getVolunteerByGroup = (groupId?: number) => {
    if (!groupId) return undefined;
    return volunteers.find(v => v.groupId === groupId); // O ajustá esto según tu lógica real
  };

  const myStudents: Alumno[] = students
  .filter(student => student.tutorId === user?.id)
  .map(student => {
    const assignedVolunteer = getVolunteerByGroup(student.groupId);
    return {
      id: student.id,
      nombre: `${student.firstName} ${student.lastName}`,
      progreso: [
        {
          fecha: '2024-03-15',
          asistencia: true,
          desempeño: 'Excelente',
          actividades: ['Práctica deportiva', 'Ejercicios de respiración'],
          notas: 'Excelente manejo de su condición durante la actividad'
        }
      ],
      voluntario: {
        nombre: assignedVolunteer
          ? `${assignedVolunteer.first_name} ${assignedVolunteer.last_name}`
          : 'Voluntario Asignado',
        email: assignedVolunteer?.email || 'voluntario@empate.org',
        rating: assignedVolunteer?.rating || 4.5
      },
      fichamedica: {
        alergias: student.allergies?.split(',') || [],
        medicamentos: student.medications?.split(',') || [],
        condiciones: [student.diagnosis || ''],
        observaciones: student.observations || '',
        ultimaActualizacion: student.lastUpdate || '',
        grupoSanguineo: 'O+',
        contactoEmergencia: {
          nombre: 'Ana Martínez',
          telefono: '123-456-7890',
          relacion: 'Madre'
        }
      },
      discipline: student.discipline,
      groupId: student.groupId
    };
  });

  const handleSendMessage = (message: any) => {
    console.log('Sending message:', message);
  };

  const handleRateVolunteer = (studentId: number, rating: number) => {
    console.log('Rating volunteer for student:', studentId, 'with rating:', rating);
  };

  const handleUpdateMedicalRecord = (record: any) => {
    console.log('Updating medical record:', record);
    setShowMedicalRecord(false);
  };

  const getGroupName = (groupId?: number) => {
    if (!groupId) return 'Sin asignación';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Sin asignación';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Tutor</h1>
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
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className={`-ml-0.5 mr-2 h-5 w-5 ${
                activeTab === 'overview' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              Vista General
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className={`-ml-0.5 mr-2 h-5 w-5 ${
                activeTab === 'messages' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              Mensajes
            </button>
          </nav>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {myStudents.map((alumno) => (
              <div key={alumno.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {alumno.nombre}
                      </h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">
                          Disciplina: {alumno.discipline || 'Sin asignación'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Grupo: {getGroupName(alumno.groupId)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setSelectedAlumno(alumno);
                          setShowMedicalRecord(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        Ficha Médica
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAlumno(alumno);
                          setShowProgress(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                        Ver Progreso
                      </button>
                    </div>
                  </div>
                </div>
                {selectedAlumno?.id === alumno.id && showProgress && (
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                      <ProgressHistory
                        student={alumno}
                        onRateVolunteer={handleRateVolunteer}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <MessagingPanel
            students={myStudents}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>

      {showMedicalRecord && selectedAlumno && (
        <MedicalRecordForm
          student={selectedAlumno}
          onSubmit={handleUpdateMedicalRecord}
          onCancel={() => {
            setShowMedicalRecord(false);
            setSelectedAlumno(null);
          }}
        />
      )}
    </div>
  );
}
