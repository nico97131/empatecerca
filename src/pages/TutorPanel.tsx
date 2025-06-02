// src/pages/TutorPanel.tsx

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, TrendingUp, LogOut, MessageSquare, FileText, Star } from 'lucide-react';
import MessagingPanel from '../components/tutor/MessagingPanel';
import ProgressHistory from '../components/tutor/ProgressHistory';
import MedicalRecordForm from '../components/tutor/MedicalRecordForm';
import VolunteerRatingForm from '../components/tutor/VolunteerRatingForm';
import axios from 'axios';
import { API_URL } from '../config';
import { toast } from 'react-hot-toast';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  dni: string;
  tutorId: number;
  discipline?: string;
  groupIds?: number[];
  groupName?: string;
  diagnosis?: string;
  allergies?: string;
  medications?: string;
  observations?: string;
  lastUpdate?: string;
  bloodType?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  disciplineName?: string;
  tutorName?: string;
  tutorDni?: string;
  tutorEmail?: string;
  tutorPhone?: string;
}

interface Volunteer {
  id: number;
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  rating?: number;
}

interface Contact {
  id: number;               // id del voluntario
  name: string;             // “María Fernández”, etc.
  email: string;
  role: 'voluntario';
  studentName?: string;     // “Nicolas” (nombre del estudiante)
  groupName?: string;       // “Fútbol Infantil”, por ejemplo
}

interface Alumno {
  id: number;
  nombre: string;           // “Nicolas Jofre”
  progreso: Array<{
    fecha: string;
    asistencia: boolean;
    desempeño: string;
    actividades: string[];
    notas: string;
  }>;
  voluntario: {
    id: number;
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
  groupId?: number;      // primer elemento de groupIds
  groupNames?: string;   // texto con los nombres de los grupos
}

interface Group {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
}

interface Announcement {
  id: number;
  subject: string;
  content: string;
  recipients: string[] | string;
  publication_date: string;
}

interface Message {
  id: number;
  from_id: number;
  from_role: 'tutor' | 'voluntario';
  to_id: number;
  to_role: 'tutor' | 'voluntario';
  content: string;
  timestamp: string;
  is_read: boolean;
}

const safeParseArray = (value?: string): string[] => {
  if (!value) return [];
  try {
    const p = JSON.parse(value);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
};

export default function TutorPanel() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [tutorIdReal, setTutorIdReal] = useState<number | null>(null);

  // 1) Obtener el ID real del tutor a partir del DNI del usuario
  useEffect(() => {
    const fetchTutorId = async () => {
      if (!user?.dni) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<{ success: boolean; data: { id: number } }>(
          `${API_URL}/api/tutors/dni/${user.dni}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('🪪 [TutorPanel] ID real del tutor obtenido por DNI:', res.data.data.id);
        setTutorIdReal(res.data.data.id);
      } catch (err) {
        console.error('❌ [TutorPanel] Error al obtener el ID real del tutor:', err);
      }
    };
    fetchTutorId();
  }, [user?.dni]);

  // 2) Fetch inicial de datos “base”
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      console.log('🔄 [TutorPanel] Iniciando fetchData...');
      const token = localStorage.getItem('token');
      try {
        const [
          studentsRes,
          groupsRes,
          volunteersRes,
          announcementsRes,
          messagesRes
        ] = await Promise.all([
          axios.get<{ success: boolean; data: Student[] }>(
            `${API_URL}/api/students`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<{ success: boolean; data: Group[] }>(
            `${API_URL}/api/groups`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<{ success: boolean; data: Volunteer[] }>(
            `${API_URL}/api/volunteers`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<{ success: boolean; data: Announcement[] }>(
            `${API_URL}/api/announcements`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<{ success: boolean; data: Message[] }>(
            `${API_URL}/api/messages`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { user_id: user.id, user_role: user.role }
            }
          )
        ]);

        console.log('🧑‍🎓 [TutorPanel] studentsRes.data.data =', studentsRes.data.data);
        console.log('📦 [TutorPanel] groupsRes.data.data =', groupsRes.data.data);
        console.log('📦 [TutorPanel] volunteersRes.data.data =', volunteersRes.data.data);
        console.log('📦 [TutorPanel] announcementsRes.data.data (raw) =', announcementsRes.data.data);
        console.log('📩 [TutorPanel] messagesRes.data.data =', messagesRes.data.data);

        setStudents(studentsRes.data.data);
        setGroups(groupsRes.data.data);
        setVolunteers(volunteersRes.data.data);
        setMessages(messagesRes.data.data);

        // Filtrar “announcements” para solo “tutores” o “todos”
        const filtrados = announcementsRes.data.data.filter((a) => {
          let destinatarios: string[] = [];
          if (Array.isArray(a.recipients)) {
            destinatarios = a.recipients as string[];
          } else if (typeof a.recipients === 'string') {
            try {
              const parsed = JSON.parse(a.recipients);
              if (Array.isArray(parsed)) destinatarios = parsed;
            } catch {
              console.warn(
                `⚠️ [TutorPanel] Recipients no es array válido en anuncio ${a.id}:`,
                a.recipients
              );
            }
          }
          return destinatarios
            .map((r) => String(r).toLowerCase().trim())
            .some((r) => r === 'tutores' || r === 'todos');
        });
        console.log('🔔 [TutorPanel] announcements (filtrados) =', filtrados);
        setAnnouncements(filtrados);
      } catch (error) {
        console.error('❌ [TutorPanel] Error al obtener datos:', error);
      }
    };

    fetchData();
  }, [user]);

  // 3) Una vez que ya tenemos `tutorIdReal`, traemos los contactos (voluntarios) de ese tutor
  useEffect(() => {
    if (tutorIdReal === null) {
      console.warn('⛔ [TutorPanel] tutorIdReal no definido, no se buscarán contactos');
      return;
    }
    const fetchVolunteersAsignados = async () => {
      console.log('🎯 [TutorPanel] Buscando contactos con tutorIdReal:', tutorIdReal);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get<{ success: boolean; data: any[] }>(
          `${API_URL}/api/contacts/tutor/${tutorIdReal}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('📦 [TutorPanel] Datos crudos del backend (contacts):', response.data.data);

        if (!Array.isArray(response.data.data) || response.data.data.length === 0) {
          console.warn('⚠️ [TutorPanel] No se encontraron contactos asignados al tutor.');
          setContacts([]);
          return;
        }

        // Mapeamos cada “contacto” a nuestra interfaz local
        const uniqueById = (arr: any[]) => {
          const seen = new Set<number>();
          return arr.filter((item) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
        };
        const mappedContacts = uniqueById(response.data.data).map((v: any) => ({
          id: v.id,
          name: v.name || 'Nombre no disponible',
          email: v.email,
          role: 'voluntario' as const,
          studentName: v.studentName || '',
          groupName: v.groupName || ''
        }));
        console.log('📇 [TutorPanel] Contactos construidos:', mappedContacts);
        setContacts(mappedContacts);

        // Auto-seleccionamos el primero si no hay ninguno seleccionado
        if (!selectedContact && mappedContacts.length > 0) {
          console.log('✅ [TutorPanel] Primer contacto seleccionado automáticamente:', mappedContacts[0]);
          setSelectedContact(mappedContacts[0]);
        }
      } catch (error) {
        console.error('❌ [TutorPanel] Error al obtener contactos asignados al tutor:', error);
        setContacts([]);
      }
    };

    fetchVolunteersAsignados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorIdReal]);

  // Si no hay “selectedContact” pero ya tenemos “contacts”, lo inicializamos
  useEffect(() => {
    if (!selectedContact && contacts.length > 0) {
      console.log('✅ [TutorPanel] Primer contacto seleccionado automáticamente (2):', contacts[0]);
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  // 4) Construimos un array de “Alumnos” (`Alumno[]`) a partir de `students`
  const buildAlumno = (student: Student): Alumno => {
    // Voluntario “por defecto” (si no encontramos ninguno)
    const voluntarioDefault = {
      id: 0,
      nombre: 'Sin asignar',
      email: '',
      rating: undefined
    };

    return {
      id: student.id,
      nombre: `${student.firstName} ${student.lastName}`,
      progreso: [], // inicialmente vacío; ProgressHistory lo llenará
      voluntario: voluntarioDefault,
      fichamedica: {
        alergias: safeParseArray(student.allergies),
        medicamentos: safeParseArray(student.medications),
        condiciones: student.diagnosis ? [student.diagnosis] : [],
        observaciones: student.observations || '',
        ultimaActualizacion: student.lastUpdate || '',
        grupoSanguineo: student.bloodType || '',
        contactoEmergencia: {
          nombre: student.emergencyContactName || 'Tutor/a',
          telefono: student.emergencyContactPhone || 'No disponible',
          relacion: student.emergencyContactRelation || 'Tutor/a'
        }
      },
      discipline: student.disciplineName,
      groupId: student.groupIds?.[0],
      groupNames: student.groupName
    };
  };

  const myStudents = useMemo<Alumno[]>(() => {
    if (!tutorIdReal) return [];
    console.log('🔍 [TutorPanel] Filtrando alumnos con tutorIdReal:', tutorIdReal);
    const filtrados = students.filter((st) => Number(st.tutorId) === tutorIdReal);
    console.log('🎓 [TutorPanel] Alumnos filtrados:', filtrados);
    return filtrados.map(buildAlumno);
  }, [students, tutorIdReal]);

  // 5) Helper para obtener voluntarios de un alumno
  const getVolunteersForAlumno = (alumno: Alumno): Contact[] => {
    if (!alumno) return [];
    const nombrePrimer = alumno.nombre.split(' ')[0]; // “Nicolas” de “Nicolas Jofre”
    const encontrados = contacts.filter((c) => c.studentName === nombrePrimer);
    console.log(`🔍 [TutorPanel] getVolunteersForAlumno('${alumno.nombre}') →`, encontrados);
    return encontrados;
  };

  // Cuando cambie “selectedAlumno”, volvemos a descubrir los voluntarios para él:
  const volunteersAsignados = selectedAlumno ? getVolunteersForAlumno(selectedAlumno) : [];

  // 6) Marcamos mensajes como leídos
  useEffect(() => {
    const marcarComoLeidos = async () => {
      if (!selectedContact) return;
      try {
        await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/messages/mark-as-read`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to_id: user!.id,
              to_role: user!.role,
              from_id: selectedContact.id,
              from_role: selectedContact.role
            })
          }
        );
        console.log('✅ [MessagingPanel] Mensajes marcados como leídos');
      } catch (err) {
        console.error('❌ [MessagingPanel] Error al marcar como leídos:', err);
      }
    };
    marcarComoLeidos();
  }, [selectedContact, user]);

  // 7) Efecto de debugging general
  useEffect(() => {
    console.log('🧠 [TutorPanel] useEffect general de debugging');
    console.log('👤 [TutorPanel] user:', user);
    console.log('🧾 [TutorPanel] contacts:', contacts);
    console.log('📩 [TutorPanel] messages:', messages);
    console.log('📌 [TutorPanel] selectedContact:', selectedContact);
    console.log('🟣 [TutorPanel] activeTab:', activeTab);
    console.log('🎯 [TutorPanel] tutorIdReal:', tutorIdReal);
    console.log('▶ [TutorPanel] myStudents (para renderizar):', myStudents);
    console.log('▶ [TutorPanel] announcements (para renderizar):', announcements);
  }, [user, contacts, messages, selectedContact, activeTab, tutorIdReal, myStudents, announcements]);

  // 8) Envío de nuevo mensaje
  const handleSendMessage = async (message: {
    from_id: number;
    from_role: 'tutor' | 'voluntario';
    to_id: number;
    to_role: 'tutor' | 'voluntario';
    content: string;
  }) => {
    console.log('📤 [TutorPanel] Enviando mensaje:', message);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${API_URL}/api/messages`, message, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ [TutorPanel] Mensaje guardado:', response.data);
      toast.success('Mensaje enviado');
      return response;
    } catch (error) {
      console.error('❌ [TutorPanel] Error al enviar mensaje:', error);
      toast.error('No se pudo enviar el mensaje');
    }
  };

  // 9) Calificar voluntario (esto lo pasamos a VolunteerRatingForm vía prop)
  const handleRateVolunteer = async (
    studentId: number,
  volunteerId: number,
    rating: number,
    feedback: string
  ) => {
    const token = localStorage.getItem('token');
    // Buscamos al voluntario por email directamente:
const volunteer = volunteers.find(v => v.id === volunteerId);

    const volunteer_id = volunteer?.id;
    const tutorDni = user?.dni;
    const score = rating;
    console.log('🎯 [TutorPanel] Intentando calificar voluntario...', {
      studentId,
      volunteer_id,
      score,
      tutorDni
    });

if (!volunteerId || !tutorDni || !score) {
  console.error('Faltan datos…');
  toast.error('No se pudo registrar la calificación. Faltan datos.');
  return;
}

    try {
      await axios.post(
        `${API_URL}/api/ratings`,
        { volunteer_id, tutorDni, score, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ Calificación registrada correctamente');
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast('⚠️ Ya registraste una calificación para este voluntario esta semana.', {
          icon: '🔁',
          style: { background: '#FFF3CD', color: '#856404' }
        });
      } else {
        console.error('❌ [TutorPanel] Error al guardar calificación:', error);
        toast.error('Ocurrió un error al intentar guardar la calificación.');
      }
    }
  };

  // 10) Actualizar ficha médica
  const handleUpdateMedicalRecord = async (record: any) => {
    if (!selectedAlumno) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${API_URL}/api/students/${selectedAlumno.id}/medical-record`,
        {
          diagnosis: record.condiciones[0] || '',
          allergies: JSON.stringify(record.alergias),
          medications: JSON.stringify(record.medicamentos),
          observations: record.observaciones,
          bloodType: record.grupoSanguineo || '',
          emergencyContactName: record.contactoEmergencia.nombre,
          emergencyContactPhone: record.contactoEmergencia.telefono,
          emergencyContactRelation: record.contactoEmergencia.relacion,
          lastUpdate: new Date().toISOString().split('T')[0]
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedAlumno.id
            ? {
                ...s,
                diagnosis: record.condiciones[0] || '',
                allergies: JSON.stringify(record.alergias),
                medications: JSON.stringify(record.medicamentos),
                observations: record.observaciones,
                bloodType: record.grupoSanguineo || '',
                emergencyContactName: record.contactoEmergencia.nombre,
emergencyContactPhone: record.contactoEmergencia.telefono,
                emergencyContactRelation: record.contactoEmergencia.relacion,
                lastUpdate: new Date().toISOString().split('T')[0]
              }
            : s
        )
      );
      setSelectedAlumno({ ...selectedAlumno, fichamedica: record });
      toast.success('Ficha médica actualizada correctamente');
      setShowMedicalRecord(false);
    } catch (error) {
      console.error('❌ [TutorPanel] Error actualizando ficha médica:', error);
      toast.error('Error al actualizar la ficha médica');
    }
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
              <User
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === 'overview' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
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
              <MessageSquare
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === 'messages' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              Mensajes
            </button>
          </nav>
        </div>

        {activeTab === 'overview' && announcements.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">📢 Comunicados</h2>
            {announcements.map((a) => (
              <div key={a.id} className="bg-blue-50 border-l-4 border-blue-500 p-4 shadow rounded-lg">
                <h4 className="text-md font-semibold text-blue-800">{a.subject}</h4>
                <p className="text-sm text-gray-700 mt-1">{a.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  📅 Publicado: {new Date(a.publication_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {myStudents.map((alumno) => (
              <div key={alumno.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">{alumno.nombre}</h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">
                          Disciplina: {alumno.discipline || 'Sin asignación'}
                        </p>
                        <p className="text-sm text-gray-500">Grupo: {alumno.groupNames || 'Sin asignación'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setSelectedAlumno(alumno);
                          setShowMedicalRecord(true);
                          setShowProgress(false);
                          setShowRatingForm(false);
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
                          setShowMedicalRecord(false);
                          setShowRatingForm(false);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                        Ver Progreso
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAlumno(alumno);
                          setShowRatingForm(true);
                          setShowMedicalRecord(false);
                          setShowProgress(false);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Star className="h-4 w-4 mr-2 text-gray-500" />
                        Calificar Voluntarios
                      </button>
                    </div>
                  </div>
                </div>

                {selectedAlumno?.id === alumno.id && showProgress && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <ProgressHistory
                      studentId={alumno.id}
                      studentName={alumno.nombre}
                      volunteer={alumno.voluntario}
                      onRateVolunteer={handleRateVolunteer}
                    />
                  </div>
                )}

                {selectedAlumno?.id === alumno.id && showRatingForm && (
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
<VolunteerRatingForm
  volunteers={volunteersAsignados}
  tutorId={tutorIdReal!}
  onCancel={() => setShowRatingForm(false)}
  onRate={(volunteerId, rating, feedback) =>
    handleRateVolunteer(alumno.id, volunteerId, rating, feedback)
  }
/>

                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <MessagingPanel
            currentUser={user!}
            contacts={contacts}
            messages={messages}
            onSendMessage={handleSendMessage}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
            loadingContacts={contacts.length === 0}
          />
        )}
      </div>

      {showMedicalRecord && selectedAlumno && (
        <MedicalRecordForm
          student={selectedAlumno}
          onSubmit={handleUpdateMedicalRecord}
          onCancel={() => setShowMedicalRecord(false)}
        />
      )}
    </div>
  );
}
