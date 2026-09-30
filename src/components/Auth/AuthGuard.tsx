import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Atom } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center animate-pulse shadow-inner">
          <Atom className="w-8 h-8 animate-[spin_8s_linear_infinite]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Verificando sesión de estudiante...
          </p>
          <p className="text-xs text-slate-400 mt-1">Conectando con Firebase Authentication</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirige al login guardando la ruta intentada en el estado
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
