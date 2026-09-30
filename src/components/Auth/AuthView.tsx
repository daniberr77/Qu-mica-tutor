import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import type { StudyLevel } from '../../types';
import {
  Atom,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  GraduationCap,
  KeyRound,
  Info,
} from 'lucide-react';

interface AuthViewProps {
  onSuccess?: () => void;
  intendedFeature?: string;
  onCancel?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthView: React.FC<AuthViewProps> = ({
  onSuccess,
  intendedFeature,
  onCancel,
}) => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAsDemo,
    resetPassword,
    authError,
    clearError,
    isConfigured,
  } = useAuth();

  const { updateLevel, updateName } = useStudent();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [studyLevel, setStudyLevel] = useState<StudyLevel>('Preuniversitario');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    clearError();
    setValidationError(null);
    setResetSuccessMessage(null);
  };

  const handleGoogleSignIn = async () => {
    clearError();
    setValidationError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);
    setResetSuccessMessage(null);

    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setValidationError('Por favor ingresá tu correo electrónico.');
        return;
      }
      setIsSubmitting(true);
      try {
        await resetPassword(email.trim());
        setResetSuccessMessage(
          'Se ha enviado un correo con instrucciones para restablecer tu contraseña. Revisá tu bandeja de entrada.'
        );
      } catch {
        // Error captured by context
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setValidationError('Completá todos los campos requeridos.');
      return;
    }

    if (mode === 'register') {
      if (password.length < 6) {
        setValidationError('La contraseña debe contener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setValidationError('Las contraseñas ingresadas no coinciden.');
        return;
      }

      setIsSubmitting(true);
      try {
        await registerWithEmail(email.trim(), password, displayName.trim() || 'Estudiante');
        if (studyLevel) updateLevel(studyLevel);
        if (displayName.trim()) updateName(displayName.trim());
        if (onSuccess) onSuccess();
      } catch {
        // Error handled in context
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Login mode
      setIsSubmitting(true);
      try {
        await loginWithEmail(email.trim(), password);
        if (onSuccess) onSuccess();
      } catch {
        // Error handled in context
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDemoSignIn = () => {
    loginAsDemo(displayName.trim() || 'Estudiante Invitado', email.trim() || 'demo@quimicatutor.edu');
    if (studyLevel) updateLevel(studyLevel);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Intended Feature Banner */}
        {intendedFeature && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-start gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Acceso Exclusivo Requerido
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                Iniciá sesión o registrate para acceder a <strong>{intendedFeature}</strong>, interactuar con QuimiBot IA y guardar tu progreso en la nube.
              </p>
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-8 pb-6 text-center border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/20 to-transparent">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-3">
              <Atom className="w-8 h-8 animate-[spin_16s_linear_infinite]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Química<span className="text-emerald-600 dark:text-emerald-400">Tutor</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'login' && 'Ingresá a tu espacio de estudio y laboratorios'}
              {mode === 'register' && 'Creá tu cuenta de estudiante en QuímicaTutor'}
              {mode === 'forgot_password' && 'Recuperación de acceso estudiantil'}
            </p>

            {/* Mode Switcher Tabs */}
            {mode !== 'forgot_password' && (
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-6 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Error & Alert messages */}
            {(validationError || authError) && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <div className="flex-1 font-medium">{validationError || authError}</div>
              </div>
            )}

            {resetSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <div className="flex-1 font-medium">{resetSuccessMessage}</div>
              </div>
            )}

            {/* Google Login Button */}
            {mode !== 'forgot_password' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
                    O con correo electrónico
                  </span>
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                </div>
              </>
            )}

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre completo o apodo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Ej. Dmitri Mendeléyev"
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nivel de estudio
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <select
                        value={studyLevel}
                        onChange={(e) => setStudyLevel(e.target.value as StudyLevel)}
                        className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 text-slate-800 dark:text-slate-100 transition-all"
                      >
                        <option value="Secundaria">Secundaria</option>
                        <option value="Preuniversitario">Preuniversitario (Bachillerato)</option>
                        <option value="Universidad">Universidad (Superior)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="estudiante@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Contraseña
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => handleModeChange('forgot_password')}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repetí tu contraseña"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Entrar a QuímicaTutor'}
                      {mode === 'register' && 'Completar Registro'}
                      {mode === 'forgot_password' && 'Enviar Correo de Recuperación'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back link when in forgot password */}
            {mode === 'forgot_password' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Volver a Iniciar Sesión</span>
                </button>
              </div>
            )}

            {/* Demo / Guest mode button */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleDemoSignIn}
                className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Probar en Modo Estudiante Invitado (Demo)</span>
              </button>

              {!isConfigured && (
                <div className="mt-2.5 flex items-start gap-1.5 p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-[11px] text-sky-800 dark:text-sky-300">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>
                    El proyecto incluye soporte para Firebase Auth. Agregá tus claves en <code>.env</code> para sincronización directa con tu consola.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Autenticación Segura Firebase</span>
            </div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Ver Tabla Periódica →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
