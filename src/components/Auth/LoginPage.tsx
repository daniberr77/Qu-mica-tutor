import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthView } from './AuthView';
import { ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/tutor';
  const intendedFeature = (location.state as any)?.intendedFeature;

  useEffect(() => {
    // Si ya está autenticado, redirigir a la ruta deseada o tutor
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, from, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 py-8 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Página de Inicio</span>
        </button>

        <AuthView
          intendedFeature={intendedFeature}
          onSuccess={() => {
            navigate(from, { replace: true });
          }}
          onCancel={() => navigate('/')}
        />
      </div>
    </div>
  );
};

export default LoginPage;
