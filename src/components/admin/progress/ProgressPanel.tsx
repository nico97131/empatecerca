import { useState } from 'react';
import { Search, Calendar, Star, User, BookOpen } from 'lucide-react';
import VolunteerRatings from './VolunteerRatings';
import StudentProgress from './StudentProgress';
import { mockProgress, mockRatings } from '../../../data/mockProgress';
import { mockStudents } from '../../../data/mockStudents';
import { mockVolunteers } from '../../../data/mockVolunteers';
import { mockTutors } from '../../../data/mockTutors';

type ProgressView = 'volunteers' | 'students';

export default function ProgressPanel() {
  const [activeView, setActiveView] = useState<ProgressView>('volunteers');
  const [searchTerm, setSearchTerm] = useState('');

  // Combine progress data with ratings
  const progressData = mockProgress.map(progress => {
    const student = mockStudents.find(s => s.id === progress.studentId);
    const volunteer = mockVolunteers.find(v => v.id === progress.volunteerId);
    const ratings = mockRatings.filter(r => r.volunteerId === progress.volunteerId);
    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length
      : 0;

    return {
      ...progress,
      studentName: student ? `${student.firstName} ${student.lastName}` : '',
      volunteerName: volunteer?.name || '',
      volunteerRating: averageRating
    };
  });

  // Combine ratings data with tutor feedback
  const ratingsData = mockVolunteers.map(volunteer => {
    const ratings = mockRatings.filter(r => r.volunteerId === volunteer.id);
    const averageRating = ratings.length > 0
      ? ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length
      : 0;
    const tutorFeedback = ratings.map(rating => {
      const tutor = mockTutors.find(t => t.id === rating.tutorId);
      return {
        tutorName: tutor?.name || '',
        feedback: rating.feedback,
        date: rating.date
      };
    });

    return {
      id: volunteer.id,
      name: volunteer.name,
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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