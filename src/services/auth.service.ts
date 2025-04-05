import { LoginCredentials, User } from '../types/auth';

const API_URL = '/api/auth';

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const data = await response.json();

    // Guardar el token en localStorage
    localStorage.setItem('token', data.token);

    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    throw new Error('Credenciales inválidas o error de red.');
  }
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay token');

  const response = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al obtener el usuario');
  }

  const data = await response.json();
  return { user: data.user };
};


export const updatePassword = async (passwords: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token');

    const response = await fetch(`${API_URL}/updatepassword`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(passwords)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar la contraseña');
    }

    const data = await response.json();
    return { message: data.message };
  } catch (error) {
    throw new Error('Error al actualizar contraseña');
  }
};
