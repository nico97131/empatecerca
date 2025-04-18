import { useEffect, useState } from 'react';
import { Search, User, BookOpen } from 'lucide-react';
import VolunteerRatings from './VolunteerRatings';
import StudentProgress from './StudentProgress';
import { mockProgress, mockRatings } from '../../../data/mockProgress';
import axios from 'axios';
import { API_URL } from '../../../config';

type ProgressView = 'volunteers' | 'students';

export default function ProgressPanel() {
  const [activeView, setActiveView] = useState<ProgressView>('volunteers');
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data.data);
      } catch (error: any) {
        console.error('❌ Error al cargar alumnos desde API:', error.message);
      }
    };

    const fetchVolunteers = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/volunteers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVolunteers(res.data.data);
      } catch (error: any) {
        console.error('❌ Error al cargar voluntarios desde API:', error.message);
      }
    };

    const fetchTutors = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/tutors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTutors(res.data.data);
      } catch (error: any) {
        console.error('❌ Error al cargar tutores desde API:', error.message);
      }
    };

    fetchStudents();
    fetchVolunteers();
    fetchTutors();
  }, []);

  const progressData = mockProgress.map(progress => {
    const student = students.find(s => s.id === progress.studentId);
    const volunteer = volunteers.find(v => v.id === progress.volunteerId);
    const ratings = mockRatings.filter(r => r.volunteerId === progress.volunteerId);
    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length
      : 0;

    return {
      ...progress,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      volunteerName: volunteer ? `${volunteer.firstName} ${volunteer.lastName}` : '',
      volunteerRating: averageRating
    };
  });

  const ratingsData = volunteers.map(volunteer => {
    const ratings = mockRatings.filter(r => r.volunteerId === volunteer.id);
    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length
      : 0;
    const tutorFeedback = ratings.map(rating => {
      const tutor = tutors.find(t => t.id === rating.tutorId);
      return {
        tutorName: tutor?.name || '',
        feedback: rating.feedback,
        date: rating.date
      };
    });

    return {
      id: volunteer.id,
      name: `${volunteer.firstName} ${volunteer.lastName}`,
      email: volunteer.email,
      averageRating,
      totalRatings: ratings.length,
      feedback: tutorFeedback
    };
  });

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
            className={`inline-flex items-center px-4 py-2 border ${
              activeView === 'volunteers'
                ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } rounded-md shadow-sm text-sm font-medium`}
          >
            <User className="h-4 w-4 mr-2" />
            Voluntarios
          </button>
          <button
            onClick={() => setActiveView('students')}
            className={`inline-flex items-center px-4 py-2 border ${
              activeView === 'students'
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
          progress={progressData}
          searchTerm={searchTerm}
        />
      )}
    </div>
  );
}