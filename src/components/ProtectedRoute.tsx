import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[]; // ej: ['admin']
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        Cargando...
      </div>
    );
  }

  if (!user) {
    console.warn('[ProtectedRoute] 🚫 Usuario no autenticado, redirigiendo al login.');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn('[ProtectedRoute] 🚫 Usuario sin permisos, redirigiendo al login.');
    return <Navigate to="/login" replace />;
  }

  return children;
}
