import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface UserAuthButtonProps {
  onOpenLogin: () => void;
}

export const UserAuthButton: React.FC<UserAuthButtonProps> = ({ onOpenLogin }) => {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        onClick={onOpenLogin}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        title="Iniciar sesión para acceder a todas las funciones"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Iniciar Sesión</span>
        <span className="sm:hidden">Acceso</span>
      </button>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'Estudiante';
  const isDemo = 'isDemo' in user && user.isDemo;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer"
        title={`Conectado como ${displayName}`}
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-5 h-5 rounded-full object-cover border border-emerald-500"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="max-w-[110px] truncate hidden md:inline">{displayName}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in duration-150">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user.email || 'Sin correo registrado'}
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isDemo
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1'
                }`}
              >
                {!isDemo && <ShieldCheck className="w-3 h-3 inline" />}
                {isDemo ? 'Modo Demo' : 'Firebase Auth'}
              </span>
            </div>
          </div>

          <div className="p-1">
            <button
              onClick={async () => {
                setMenuOpen(false);
                await logout();
              }}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAuthButton;
