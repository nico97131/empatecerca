import { LoginCredentials, User } from '../types/auth';

const API_URL = '/api/auth';

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
  try {
    console.log('[auth.service] 🔐 Enviando login con:', credentials);

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn('[auth.service] ❌ Error en respuesta del login:', error);
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    const data = await response.json();

    console.log('[auth.service] ✅ Login exitoso, usuario recibido:', data.user);
    console.log('[auth.service] 🧾 Rol del usuario:', data.user?.role);

    // Guardar el token en localStorage por defecto (aunque AuthContext lo sobreescriba luego)
    localStorage.setItem('token', data.token);

    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('[auth.service] ❌ Error en login:', error);
    throw new Error('Credenciales inválidas o error de red.');
  }
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('[auth.service] ⚠️ No hay token al solicitar usuario actual');
    throw new Error('No hay token');
  }

  try {
    console.log('[auth.service] 🔄 Obteniendo usuario actual con token...');

    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.warn('[auth.service] ❌ Error en getCurrentUser:', error);
      throw new Error(error.message || 'Error al obtener el usuario');
    }

    const data = await response.json();
    console.log('[auth.service] ✅ Usuario actual recibido:', data.user);
    console.log('[auth.service] 🧾 Rol del usuario:', data.user?.role);

    return { user: data.user };
  } catch (error) {
    console.error('[auth.service] ❌ Error general en getCurrentUser:', error);
    throw error;
  }
};

export const updatePassword = async (passwords: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[auth.service] ⚠️ No hay token al intentar actualizar contraseña');
      throw new Error('No hay token');
    }

    console.log('[auth.service] 🔒 Enviando solicitud de cambio de contraseña');

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
      console.warn('[auth.service] ❌ Error al actualizar contraseña:', error);
      throw new Error(error.message || 'Error al actualizar la contraseña');
    }

    const data = await response.json();
    console.log('[auth.service] ✅ Contraseña actualizada correctamente');
    return { message: data.message };
  } catch (error) {
    console.error('[auth.service] ❌ Error general al actualizar contraseña:', error);
    throw new Error('Error al actualizar contraseña');
  }
};
