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
  tutorPhone?: string;
  disciplineName?: string;
  tutorDni?: string;
  groupIds?: number[];
  groupName?: string;

}

interface Volunteer {
  id: number;
  dni: string;
  first_name: string;
  last_name: string;
  email: string;
  rating?: number;
  groupId?: number;
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
  groupId?: number; // lo podés mantener si en algún momento querés usarlo para matcheo interno
  groupNames?: string; // ✅ este es el campo que usás en el rende // en vez de usar groupId si ya no lo necesitás
}

interface Group {
  id: number;
  name: string;
  discipline: string;
  schedule: string;
}

const safeParseArray = (value?: string): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function TutorPanel() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [studentsRes, groupsRes, volunteersRes, announcementsRes] = await Promise.all([
          axios.get(`${API_URL}/api/students`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/groups`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/volunteers`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/announcements`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setVolunteers(volunteersRes.data.data);


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
          return destinatarios.some((r) => ['tutores', 'todos'].includes(String(r).toLowerCase().trim()));
        });

        setStudents(studentsRes.data.data);
        setGroups(groupsRes.data.data);
        setAnnouncements(filtrados);
      } catch (error) {
        console.error('❌ Error al obtener datos:', error);
      }
    };
    fetchData();
  }, []);

  const getVolunteersByGroupId = (groupId?: number): Volunteer[] => {
    if (!groupId) return [];
    const group = groups.find(g => g.id === groupId);
    if (!group || !Array.isArray(group.volunteers)) return [];

    return group.volunteers.map(v => {
      const [firstName, ...rest] = v.name.split(' ');
      return {
        id: v.id,
        first_name: firstName,
        last_name: rest.join(' '),
        email: `${v.dni}@empate.org`,
        groupId
      };
    });
  };




  const buildAlumno = (student: Student): Alumno => {
    return {
      id: student.id,
      nombre: `${student.firstName} ${student.lastName}`,
      progreso: [], // se va a cargar en el componente ProgressHistory
      voluntario: getVolunteersByGroupId(student.groupIds?.[0]).map(v => ({
        id: v.id,
        nombre: `${v.first_name} ${v.last_name}`,
        email: v.email,
        rating: v.rating
      })),



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
      groupNames: student.groupName,
    };
  };


  const myStudents = useMemo(() => {
    return students
      .filter(student => student.tutorDni === user?.dni)
      .map(buildAlumno);
  }, [students, volunteers, user?.dni]);


  const handleSendMessage = (message: any) => {
    console.log('Sending message:', message);
  };

  const handleRateVolunteer = async (studentId: number, volunteerEmail: string, rating: number) => {
    const token = localStorage.getItem('token');

    const volunteer = volunteers.find(v => `${v.dni}@empate.org` === volunteerEmail);
    const volunteer_id = volunteer?.id;
    const tutor_id = user?.id;
    const score = rating;

    console.log('🎯 Intentando calificar...');
    console.log('Voluntario:', volunteer_id, volunteer?.first_name, volunteer?.last_name);
    console.log('Rating:', score);
    console.log('Tutor ID:', tutor_id);

    if (!volunteer_id || !tutor_id || !score) {
      console.error('❌ Faltan datos para registrar la calificación');
      toast.error('No se pudo registrar la calificación. Faltan datos.');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/ratings`, {
        volunteer_id,
        tutor_id,
        score,
        feedback: '', // podés agregar más adelante
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('✅ Calificación registrada correctamente');
    } catch (error: any) {
  if (error.response?.status === 409) {
    toast(
      '⚠️ Ya registraste una calificación para este voluntario esta semana.',
      {
        icon: '🔁',
        style: {
          background: '#FFF3CD',
          color: '#856404',
        }
      }
    );
  } else {
    console.error('❌ Error al guardar calificación:', error); // ✅ solo loguea si es un error real
    toast.error('Ocurrió un error al intentar guardar la calificación.');
  }
}

  }


  const handleUpdateMedicalRecord = async (record: any) => {
    if (!selectedAlumno) return;
    const token = localStorage.getItem('token');
    try {
      await axios.put(`${API_URL}/api/students/${selectedAlumno.id}/medical-record`, {
        diagnosis: record.condiciones[0] || '',
        allergies: JSON.stringify(record.alergias),
        medications: JSON.stringify(record.medicamentos),
        observations: record.observaciones,
        bloodType: record.grupoSanguineo || '',
        emergencyContactName: record.contactoEmergencia.nombre,
        emergencyContactPhone: record.contactoEmergencia.telefono,
        emergencyContactRelation: record.contactoEmergencia.relacion,
        lastUpdate: new Date().toISOString().split('T')[0],
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await axios.put(`${API_URL}/api/students/${selectedAlumno.id}/medical-record`, {
        diagnosis: record.condiciones[0] || '',
        allergies: JSON.stringify(record.alergias),
        medications: JSON.stringify(record.medicamentos),
        observations: record.observaciones,
        bloodType: record.grupoSanguineo || '',
        emergencyContactName: record.contactoEmergencia.nombre,
        emergencyContactPhone: record.contactoEmergencia.telefono,
        emergencyContactRelation: record.contactoEmergencia.relacion,
        lastUpdate: new Date().toISOString().split('T')[0],
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStudents(prev =>
        prev.map(s =>
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
              lastUpdate: new Date().toISOString().split('T')[0],
            }
            : s
        )
      );

      setSelectedAlumno({
        ...selectedAlumno,
        fichamedica: record
      });

      toast.success('Ficha médica actualizada correctamente');
      setShowMedicalRecord(false);
    } catch (error) {
      console.error('❌ Error actualizando ficha médica:', error);
      toast.error('Error al actualizar la ficha médica');
    }
  };

  const getGroupName = (groupId?: number) => {
    if (!groupId) return 'Sin asignación';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Sin asignación';
  };

  const volunteersAsignados = selectedAlumno?.voluntario
    ? selectedAlumno.voluntario.map(v => ({
      id: v.id,
      nombre: v.nombre,
      email: v.email,
      rating: v.rating
    }))
    : [];


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
              className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <User className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === 'overview' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
              Vista General
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

        {activeTab === 'overview' && announcements.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">📢 Comunicados</h2>
            {announcements.map((a) => (
              <div key={a.id} className="bg-blue-50 border-l-4 border-blue-500 p-4 shadow rounded-lg">
                <h4 className="text-md font-semibold text-blue-800">{a.subject}</h4>
                <p className="text-sm text-gray-700 mt-1">{a.content}</p>
                <p className="text-xs text-gray-500 mt-2">📅 Publicado: {new Date(a.publication_date).toLocaleDateString()}</p>
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
                        <p className="text-sm text-gray-500">Disciplina: {alumno.discipline || 'Sin asignación'}</p>
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
                      onCancel={() => setShowRatingForm(false)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <MessagingPanel students={myStudents} onSendMessage={handleSendMessage} />
        )}
      </div>

      {showMedicalRecord && selectedAlumno && (
        <MedicalRecordForm
          student={selectedAlumno}
          onSubmit={handleUpdateMedicalRecord}
          onCancel={() => {
            setShowMedicalRecord(false);
          }}
        />
      )}
    </div>
  );
}
