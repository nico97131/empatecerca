import { useState, useEffect } from 'react';
import { Users, LogOut, MessageSquare, SmilePlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MessagingPanel from '../components/voluntario/PrivateMessagesPanel';
import StudentRating from '../components/voluntario/StudentRating';
import MedicalRecord from '../components/voluntario/MedicalRecord';
import ProgressForm from '../components/voluntario/ProgressForm';
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
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  tutorName?: string;
  tutorEmail?: string;
}

interface Grupo {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
  volunteers?: { id: number; name: string; dni: string }[];
}

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

const safeParseArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function VoluntarioPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [groupsRes, studentsRes, announcementsRes] = await Promise.all([
          axios.get(`${API_URL}/api/groups`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/students`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/announcements`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("📢 Comunicados recibidos:", announcementsRes.data.data);

        const filtrados = announcementsRes.data.data.filter((a: any) => {
          let destinatarios: string[] = [];

          if (Array.isArray(a.recipients)) {
            destinatarios = a.recipients;
          } else if (typeof a.recipients === 'string') {
            try {
              const parsed = JSON.parse(a.recipients);
              if (Array.isArray(parsed)) destinatarios = parsed;
            } catch {
              console.warn(`⚠️ Recipients no es un array válido en anuncio ${a.id}:`, a.recipients);
            }
          }

          return destinatarios.some((r) =>
            ['voluntarios', 'todos'].includes(String(r).toLowerCase().trim())
          );
        });

        console.log("✅ Comunicados filtrados para voluntario:", filtrados);

        setGroups(groupsRes.data.data);
        setStudents(studentsRes.data.data);
        setAnnouncements(filtrados);
      } catch (err) {
        console.error('❌ Error al obtener datos:', err);
      }
    };

    fetchData();
  }, []);

  if (!user) {
    return <div className="text-center mt-10">Cargando usuario...</div>;
  }

  const volunteerDni = user.dni?.trim();

  const assignedGroups = groups.filter(group =>
    Array.isArray(group.volunteers) &&
    group.volunteers.some(v => v.dni?.trim() === volunteerDni)
  );

  const calcularEdad = (birthDateStr: string): number => {
    const birthDate = new Date(birthDateStr);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let edad = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) edad--;
    return edad;
  };

  const mapStudentToAlumno = (s: Student, group: Grupo): Alumno => ({
    id: s.id,
    nombre: `${s.firstName} ${s.lastName}`,
    edad: calcularEdad(s.birthDate),
    fichamedica: {
      alergias: safeParseArray(s.allergies),
      medicamentos: safeParseArray(s.medications),
      condiciones: s.diagnosis ? [s.diagnosis] : [],
      observaciones: s.observations || '',
      ultimaActualizacion: s.lastUpdate || '',
      grupoSanguineo: s.bloodType || '',
      contactoEmergencia: {
        nombre: s.emergencyContactName || '',
        telefono: s.emergencyContactPhone || '',
        relacion: s.emergencyContactRelation || '',
      },
    },
    tutor: {
      nombre: s.tutorName || '',
      email: s.tutorEmail || '',
    },
    grupo: group.name,
    discipline: group.discipline,
  });

  const groupStudents = assignedGroups.map(group => {
const alumnos: Alumno[] = students
  .filter(s => s.groupIds?.includes(group.id)) // ✅ usa groupIds en vez de groupId
  .map(s => mapStudentToAlumno(s, group));

    return {
      id: group.id,
      nombre: group.name,
      materia: group.discipline,
      alumnos,
    };
  });

  const handleSendMessage = (message: any) => {
    console.log('Sending message:', message);
  };

  const handleRateStudent = (
    studentId: number,
    rating: { score: number; feedback: string; attendance: boolean }
  ) => {
    console.log('Rating student:', studentId, rating);
    setShowRatingForm(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Panel de Voluntario</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Bienvenido, {user.name}</span>
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
                className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Users className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'overview' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                Grupos y Alumnos
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${activeTab === 'messages' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <MessageSquare className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'messages' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                Mensajes
              </button>
            </nav>
          </div>

          {activeTab === 'overview' ? (
            groupStudents.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                No tenés grupos asignados por el momento.
              </div>
            ) : (
              <>
                {announcements.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">📢 Comunicados</h2>
                    {announcements.map((a) => (
                      <div
                        key={a.id}
                        className="bg-blue-50 border-l-4 border-blue-500 p-4 shadow rounded-lg"
                      >
                        <h4 className="text-md font-semibold text-blue-800">{a.subject}</h4>
                        <p className="text-sm text-gray-700 mt-1">{a.content}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          📅 Publicado: {new Date(a.publication_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>


                )}

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
                                  <p className="text-sm text-gray-500">
                                    {alumno.edad > 0 ? `Edad: ${alumno.edad} años` : 'Edad no disponible'}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setSelectedAlumno({ ...alumno, groupId: grupo.id });
                                      setShowMedicalRecord(true);
                                    }}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    Ver Ficha Médica
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedAlumno({ ...alumno, groupId: grupo.id });
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
              </>
            )
          ) : (
            <MessagingPanel grupos={groupStudents} onSendMessage={handleSendMessage} />
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
          <ProgressForm
            student={selectedAlumno}
            groupId={selectedAlumno.groupId}
            onCancel={() => {
              setShowRatingForm(false);
              setSelectedAlumno(null);
            }}
            onSubmit={async (progressData) => {
              try {
                const token = localStorage.getItem('token');
                const response = await axios.post(`${API_URL}/api/progress`, {
                  studentId: selectedAlumno.id,
                  groupId: selectedAlumno.groupId,
                  ...progressData
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                console.log('✅ Progreso guardado con éxito:', response.data);
              } catch (err: any) {
                console.error('❌ Error al guardar el progreso:', err.response?.data || err.message);
                throw new Error(err.response?.data?.message || 'No se pudo guardar el progreso');
              }
            }}
          />
        )}
      </div>
    </>
  );
}
