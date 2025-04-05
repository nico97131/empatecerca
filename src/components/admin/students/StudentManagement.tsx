import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, FileText } from 'lucide-react';
import StudentForm from './StudentForm';
import MedicalRecordForm from './MedicalRecordForm';
import { mockTutors } from '../../../data/mockTutors';
import { mockStudents } from '../../../data/mockStudents';
import axios from 'axios';
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
  discipline: string;
  schedule: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/groups`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Grupos cargados:', res.data.data);
        setGroups(res.data.data);
      } catch (error: any) {
        console.error('❌ Error al obtener grupos:', error.message);
      }
    };

    fetchGroups();
  }, []);

  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    setStudents([...students, { ...newStudent, id: students.length + 1 }]);
    setShowForm(false);
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(students.map(student =>
      student.id === updatedStudent.id ? updatedStudent : student
    ));
    setSelectedStudent(null);
    setShowForm(false);
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const handleUpdateMedicalRecord = (studentId: number, medicalRecord: Student['medicalRecord']) => {
    setStudents(students.map(student =>
      student.id === studentId
        ? { ...student, medicalRecord: { ...medicalRecord, lastUpdate: new Date().toISOString() } }
        : student
    ));
    setShowMedicalForm(false);
    setSelectedStudent(null);
  };

  const getTutorName = (tutorId: number) => {
    const tutor = mockTutors.find(t => t.id === tutorId);
    return tutor ? tutor.name : 'No asignado';
  };

  const getGroupInfo = (student: Student) => {
    if (!student.discipline) return 'Sin asignación';
    if (!student.groupId) return `${student.discipline} - Sin grupo asignado`;
    const group = groups.find(g => g.id === student.groupId);
    return group ? `${student.discipline} - ${group.name}` : 'Sin asignación';
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.dni.includes(searchTerm) ||
    getGroupInfo(student).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                  {getTutorName(student.tutorId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getGroupInfo(student)}
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
                      setSelectedStudent(student);
                      setShowMedicalForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Ficha Médica"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowForm(true);
                    }}
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
