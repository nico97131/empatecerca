import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FileText, UserRound, X } from 'lucide-react';
import StudentForm from './StudentForm';
import MedicalRecordForm from './MedicalRecordForm';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_URL } from '../../../config';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  tutorId: number;
  discipline?: string;
  groupId?: number;
  tutorName?: string;
  tutorDni?: string;
  tutorEmail?: string;
  tutorPhone?: string;
  tutorJoinDate?: string;
  groupName?: string;
  medicalRecord?: {
    diagnosis: string;
    allergies: string[];
    medications: string[];
    observations: string;
    lastUpdate: string;
    volunteerNotes?: string;
  };
}

interface Group {
  id: number;
  name: string;
  discipline_id: number | null;
}

interface Discipline {
  id: number;
  name: string;
  category: string;
  description: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [showTutorModal, setShowTutorModal] = useState(false);
  const [tutorInfo, setTutorInfo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const token = localStorage.getItem('token');

  const fetchAllData = async () => {
    try {
      const [studentsRes, groupsRes, disciplinesRes] = await Promise.all([
        axios.get(`${API_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/disciplines`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const parsedStudents = studentsRes.data.data.map((s: any) => {
        let medicalRecord;
        try {
          medicalRecord = s.diagnosis || s.allergies || s.medications || s.observations || s.lastUpdate || s.volunteerNotes
            ? {
                diagnosis: s.diagnosis || '',
                allergies: s.allergies ? JSON.parse(s.allergies) : [],
                medications: s.medications ? JSON.parse(s.medications) : [],
                observations: s.observations || '',
                lastUpdate: s.lastUpdate || '',
                volunteerNotes: s.volunteerNotes || ''
              }
            : undefined;
        } catch (err) {
          console.warn('⚠️ Error al parsear ficha médica para el alumno:', s.id, err);
        }

        return {
          ...s,
          medicalRecord
        };
      });

      setStudents(parsedStudents);
      setGroups(groupsRes.data.data);
      setDisciplines(disciplinesRes.data.data);
    } catch (error: any) {
      console.error('❌ Error al obtener datos:', error.response?.data || error.message);
      toast.error('Error al cargar los datos');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    try {
      await axios.post(`${API_URL}/api/students`, newStudent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Alumno creado correctamente');
      setShowForm(false);
      await fetchAllData();
    } catch (error: any) {
      console.error('❌ Error al crear alumno:', error.response?.data || error.message);
      toast.error('No se pudo crear el alumno');
    }
  };

  const handleEditStudent = async (updatedStudent: Student) => {
    try {
      await axios.put(`${API_URL}/api/students/${updatedStudent.id}`, updatedStudent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Alumno actualizado correctamente');
      setSelectedStudent(null);
      setShowForm(false);
      await fetchAllData();
    } catch (error: any) {
      console.error('❌ Error al editar alumno:', error.response?.data || error.message);
      toast.error('No se pudo actualizar el alumno');
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(students.filter(s => s.id !== id));
      toast.success('Alumno eliminado');
    } catch (error: any) {
      console.error('❌ Error al eliminar alumno:', error.response?.data || error.message);
      toast.error('No se pudo eliminar el alumno');
    }
  };

  const handleUpdateMedicalRecord = async (studentId: number, medicalRecord: Student['medicalRecord']) => {
    try {
      await axios.put(`${API_URL}/api/students/${studentId}/medical-record`, medicalRecord, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ficha médica actualizada');
      await fetchAllData();
      setShowMedicalForm(false);
      setSelectedStudent(null);
    } catch (error: any) {
      console.error('❌ Error al actualizar ficha médica:', error.response?.data || error.message);
      toast.error('No se pudo actualizar la ficha médica');
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dni.includes(searchTerm) ||
    (student.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleEditClick = (student: Student) => {
    const group = groups.find(g => g.id === student.groupId);
    const disciplineId = group?.discipline_id ?? null;

    setSelectedStudent({
      ...student,
      discipline: disciplineId !== null ? disciplineId.toString() : undefined
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar alumnos..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSelectedStudent(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Alumno
        </button>
      </div>

      {showForm && (
        <StudentForm
          student={selectedStudent}
          onSubmit={selectedStudent ? handleEditStudent : handleAddStudent}
          onCancel={() => {
            setShowForm(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {showMedicalForm && selectedStudent && (
        <MedicalRecordForm
          student={selectedStudent}
          onSubmit={(medicalRecord) => handleUpdateMedicalRecord(selectedStudent.id, medicalRecord)}
          onCancel={() => {
            setShowMedicalForm(false);
            setSelectedStudent(null);
          }}
        />
      )}

      {showTutorModal && tutorInfo && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Datos del Tutor</h2>
              <button onClick={() => setShowTutorModal(false)} className="text-gray-500 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Nombre:</strong> {tutorInfo.name}</p>
              <p><strong>DNI:</strong> {tutorInfo.dni}</p>
              <p><strong>Email:</strong> {tutorInfo.email}</p>
              <p><strong>Teléfono:</strong> {tutorInfo.phone}</p>
              <p><strong>Fecha de Alta:</strong> {new Date(tutorInfo.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Nacimiento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ficha Médica</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.firstName} {student.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.dni}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(student.birthDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.tutorName || 'No asignado'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.groupName || 'Sin grupo'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.medicalRecord ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Actualizada: {new Date(student.medicalRecord.lastUpdate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Pendiente
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      if (student.tutorName) {
                        setTutorInfo({
                          name: student.tutorName,
                          dni: student.tutorDni,
                          email: student.tutorEmail,
                          phone: student.tutorPhone,
                          joinDate: student.tutorJoinDate
                        });
                        setShowTutorModal(true);
                      }
                    }}
                    className="text-gray-600 hover:text-gray-900 mr-4"
                    title="Ver Tutor"
                  >
                    <UserRound className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowMedicalForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Ficha Médica"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditClick(student)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
