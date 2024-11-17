import api from './api';
import { LoginCredentials, User } from '../types/auth';
import { mockUsers } from '../data/mockUsers';

// Simulación de delay para la API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
  try {
    // Simulamos un delay de red
    await delay(1000);

    // Buscar usuario en datos mock
    const user = mockUsers.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
    }

    // Generar token mock
    const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));

    // Omitir la contraseña del objeto de usuario
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error al iniciar sesión. Por favor, intenta nuevamente.');
  }
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token de autenticación');

    // Decodificar token mock
    const userData = JSON.parse(atob(token));
    const user = mockUsers.find(u => u.id === userData.id);

    if (!user) throw new Error('Usuario no encontrado');

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  } catch (error) {
    throw new Error('Error al obtener información del usuario');
  }
};

export const updatePassword = async (passwords: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
  // Simulación de actualización de contraseña
  await delay(1000);
  return { message: 'Contraseña actualizada exitosamente' };
};