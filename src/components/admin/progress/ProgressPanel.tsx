import { useEffect, useState } from 'react';
import { Search, User, BookOpen } from 'lucide-react';
import VolunteerRatings from './VolunteerRatings';
import StudentProgress from './StudentProgress';
import axios from 'axios';
import { API_URL } from '../../../config';

type ProgressView = 'volunteers' | 'students';


export default function ProgressPanel() {
  const [activeView, setActiveView] = useState<ProgressView>('volunteers');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [progressRecords, setProgressRecords] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);


  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        console.log('📡 Cargando datos desde la API...');

        const [studentsRes, volunteersRes, tutorsRes, progressRes, ratingsRes] = await Promise.all([
          axios.get(`${API_URL}/api/students`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/volunteers`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/tutors`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/progress`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/ratings`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        console.log('✅ Datos recibidos:');
        console.log('🧑‍🎓 students:', studentsRes.data.data);
        console.log('🙋‍♂️ volunteers:', volunteersRes.data.data);
        console.log('🧑‍🏫 tutors:', tutorsRes.data.data);
        console.log('📈 progress:', progressRes.data.data);
        console.log('⭐ ratings:', ratingsRes.data.data);

        setStudents(studentsRes.data.data);
        setVolunteers(volunteersRes.data.data);
        setTutors(tutorsRes.data.data);
        setProgressRecords(progressRes.data.data);
        setRatings(ratingsRes.data.data);
      } catch (error: any) {
        console.error('❌ Error al cargar datos desde API:', error.message);
      }
    };

    fetchAll();
  }, []);


 const groupedProgress = students.map((student) => {
  const studentProgress = progressRecords
    .filter(p => p.student_id === student.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (studentProgress.length === 0) return null;

  const latest = studentProgress[0];
  const rating = ratings.find(r => r.id === latest.volunteer_id);

  return {
    studentId: student.id,
    studentName: `${student.firstName} ${student.lastName}`,
    latestEntry: {
      id: latest.id,
      attendance: latest.attendance,
      performance: latest.performance,
      activities: Array.isArray(latest.activities) ? latest.activities : [],
      notes: latest.notes,
      date: latest.date,
      volunteerName: latest.volunteerName || 'Desconocido',
      volunteerRating: Number(rating?.averageRating) || 0
    },
    history: studentProgress.map(p => {
      const r = ratings.find(r => r.id === p.volunteer_id);
      return {
        id: p.id,
        attendance: p.attendance,
        performance: p.performance,
        activities: Array.isArray(p.activities) ? p.activities : [],
        notes: p.notes,
        date: p.date,
        volunteerName: p.volunteerName || 'Desconocido',
        volunteerRating: Number(r?.averageRating) || 0
      };
    })
  };
}).filter(Boolean);


  const ratingsData = ratings.map((rating) => ({
    id: rating.volunteer_id,
    name: rating.name,
    email: rating.email,
    averageRating: Number(rating.averageRating) || 0,
    totalRatings: rating.totalRatings,
    feedback: Array.isArray(rating.feedback) ? rating.feedback : []
  }));

  console.log('📊 ratingsData generado:', ratingsData);



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Buscar ${activeView === 'volunteers' ? 'voluntarios' : 'alumnos'}...`}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('volunteers')}
            className={`inline-flex items-center px-4 py-2 border ${activeView === 'volunteers'
              ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } rounded-md shadow-sm text-sm font-medium`}
          >
            <User className="h-4 w-4 mr-2" />
            Voluntarios
          </button>
          <button
            onClick={() => setActiveView('students')}
            className={`inline-flex items-center px-4 py-2 border ${activeView === 'students'
              ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } rounded-md shadow-sm text-sm font-medium`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Alumnos
          </button>
        </div>
      </div>

      {activeView === 'volunteers' ? (
        <VolunteerRatings
          volunteers={ratingsData}
          searchTerm={searchTerm}
        />
      ) : (
        <StudentProgress
          progress={groupedProgress}
          searchTerm={searchTerm}
        />

      )}
    </div>
  );
}
