import { useState } from 'react';
import { Users, LogOut, Calendar, MessageSquare, SmilePlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MessagingPanel from '../components/voluntario/MessagingPanel';
import StudentRating from '../components/voluntario/StudentRating';
import MedicalRecord from '../components/voluntario/MedicalRecord';
import { mockGroups } from '../data/mockGroups';
import { mockStudents } from '../data/mockStudents';
import { mockVolunteers } from '../data/mockVolunteers';

interface Alumno {
  id: number;
  nombre: string;
  edad: number;
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
  tutor: {
    nombre: string;
    email: string;
  };
  lastRating?: {
    date: string;
    score: number;
    feedback: string;
    attendance: boolean;
  };
  grupo?: string;
  discipline?: string;
}

interface Grupo {
  id: number;
  nombre: string;
  materia: string;
  alumnos: Alumno[];
}

export default function VoluntarioPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);

  // Get volunteer's assigned groups
  const volunteer = mockVolunteers.find(v => v.email === user?.email);
  const assignedGroups = mockGroups.filter(group => 
    volunteer?.assignedGroups.includes(group.id)
  );

  // Get students from assigned groups
  const groupStudents = assignedGroups.map(group => {
    const students = mockStudents.filter(student => 
      student.groupId === group.id
    ).map(student => ({
      id: student.id,
      nombre: `${student.firstName} ${student.lastName}`,
      edad: new Date().getFullYear() - new Date(student.birthDate).getFullYear(),
      fichamedica: {
        alergias: student.medicalRecord?.allergies || [],
        medicamentos: student.medicalRecord?.medications || [],
        condiciones: student.medicalRecord?.diagnosis ? [student.medicalRecord.diagnosis] : [],
        observaciones: student.medicalRecord?.observations || '',
        ultimaActualizacion: student.medicalRecord?.lastUpdate || '',
        grupoSanguineo: 'O+',
        contactoEmergencia: {
          nombre: 'Ana Martínez',
          telefono: '123-456-7890',
          relacion: 'Madre'
        }
      },
      tutor: {
        nombre: 'María González',
        email: 'maria.gonzalez@empate.org'
      },
      grupo: group.name,
      discipline: group.discipline
    }));

    return {
      id: group.id,
      nombre: group.name,
      materia: group.discipline,
      alumnos: students
    };
  });

  const handleSendMessage = (message: any) => {
    console.log('Sending message:', message);
  };

  const handleRateStudent = (studentId: number, rating: { score: number; feedback: string; attendance: boolean }) => {
    console.log('Rating student:', studentId, rating);
    setShowRatingForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Voluntario</h1>
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
              className={`
                group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === 'overview'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Users className={`
                -ml-0.5 mr-2 h-5 w-5
                ${activeTab === 'overview' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
              `} />
              Grupos y Alumnos
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`
                group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm
                ${activeTab === 'messages'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <MessageSquare className={`
                -ml-0.5 mr-2 h-5 w-5
                ${activeTab === 'messages' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}
              `} />
              Mensajes
            </button>
          </nav>
        </div>

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {groupStudents.map((grupo) => (
              <div key={grupo.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {grupo.nombre}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        {grupo.materia}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {grupo.alumnos.length} alumnos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {grupo.alumnos.map((alumno) => (
                      <li key={alumno.id} className="px-4 py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{alumno.nombre}</h4>
                            <p className="text-sm text-gray-500">Edad: {alumno.edad} años</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAlumno(alumno);
                                setShowMedicalRecord(true);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              Ver Ficha Médica
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAlumno(alumno);
                                setShowRatingForm(true);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                              <SmilePlus className="h-4 w-4 mr-1" />
                              Evaluar
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <MessagingPanel
            grupos={groupStudents}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>

      {showMedicalRecord && selectedAlumno && (
        <MedicalRecord
          student={selectedAlumno}
          onClose={() => {
            setShowMedicalRecord(false);
            setSelectedAlumno(null);
          }}
        />
      )}

      {showRatingForm && selectedAlumno && (
        <StudentRating
          student={selectedAlumno}
          onSubmit={handleRateStudent}
          onClose={() => {
            setShowRatingForm(false);
            setSelectedAlumno(null);
          }}
        />
      )}
    </div>
  );
}