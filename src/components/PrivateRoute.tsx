import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export default function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        Cargando...
      </div>
    );
  }

  if (!user) {
    console.warn('[PrivateRoute] Usuario no autenticado → Redirigiendo al login');
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase().trim();
  console.log(`[PrivateRoute] Rol detectado: ${userRole}`);

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.warn(`[PrivateRoute] Rol no autorizado (${user.role}) → Redirigiendo`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log(`[PrivateRoute] ✅ Acceso autorizado para: ${user.role}`);
  return children;
}
