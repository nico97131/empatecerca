export interface Progress {
  id: number;
  studentId: number;
  volunteerId: number;
  date: string;
  attendance: boolean;
  performance: 'Excelente' | 'Bueno' | 'Regular' | 'Necesita Mejorar';
  activities: string[];
  notes: string;
}

export interface Rating {
  id: number;
  studentId: number;
  volunteerId: number;
  tutorId: number;
  score: number;
  feedback: string;
  date: string;
}

export const mockProgress: Progress[] = [
  {
    id: 1,
    studentId: 1,
    volunteerId: 1,
    date: '2024-03-15',
    attendance: true,
    performance: 'Excelente',
    activities: ['Práctica deportiva', 'Ejercicios de respiración'],
    notes: 'Excelente manejo de su condición durante la actividad'
  }
];

export const mockRatings: Rating[] = [
  {
    id: 1,
    studentId: 1,
    volunteerId: 1,
    tutorId: 1,
    score: 4.5,
    feedback: 'Excelente trabajo con el alumno, muy atento a sus necesidades',
    date: '2024-03-15'
  }
];