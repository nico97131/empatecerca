export interface User {
  id: number;
  email: string;
  role: 'admin' | 'voluntario' | 'tutor';
  name: string;
  dni: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}