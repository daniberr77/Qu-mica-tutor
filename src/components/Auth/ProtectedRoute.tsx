import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthView } from './AuthView';
import { Atom } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureName?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  featureName = 'esta sección protegida',
  onCancel,
  onSuccess,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center animate-pulse">
          <Atom className="w-8 h-8 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Comprobando sesión de estudiante...
          </p>
          <p className="text-xs text-slate-400 mt-1">Conectando con Firebase Authentication</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <AuthView
          intendedFeature={featureName}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
