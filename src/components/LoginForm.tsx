import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginCredentials {
  email: string;
  password: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const validateForm = () => {
    if (!credentials.email) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      setError('El correo electrónico no es válido');
      return false;
    }
    if (!credentials.password) {
      setError('La contraseña es requerida');
      return false;
    }
    if (credentials.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const user = await login(credentials);
      console.log('🧾 Usuario recibido tras login:', user);

      const role = typeof user.role === 'string'
        ? user.role.toLowerCase()
        : String(user.role);

      const routes: Record<string, string> = {
        admin: '/admin/dashboard',
        voluntario: '/voluntario/panel',
        tutor: '/tutor/panel',
      };

      const route = routes[role];
      console.log('🧭 Rol:', role);
      console.log('🎯 Ruta encontrada:', route);

      if (route) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', credentials.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        toast.success('¡Bienvenido!');
        window.location.href = route;
      } else {
        setError('Tu rol no tiene acceso definido');
        toast.error('Acceso no disponible para tu rol');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      setError(message);
      toast.error(message);
      console.error('❌ Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setCredentials(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleForgotPassword = () => {
    toast('Funcionalidad de recuperación de contraseña próximamente disponible.');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.2)), url(/images/fondo-login.jpeg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-8 space-y-6 relative z-10">
      <div className="text-center">
  <img
    src="/images/empatecerca.png"
    alt="EmpateCerca"
    className="mx-auto w-36 sm:w-40 mb-4"
  />

</div>


        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => {
                setError('');
                setCredentials(prev => ({ ...prev, email: e.target.value }));
              }}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => {
                setError('');
                setCredentials(prev => ({ ...prev, password: e.target.value }));
              }}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Recordarme</span>
            </label>
            <button type="button" onClick={handleForgotPassword} className="text-sm text-green-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ingresando...
              </span>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
