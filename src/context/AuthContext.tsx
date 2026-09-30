import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo?: boolean;
}

export interface AuthContextType {
  user: AppUser | FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  authError: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemo: (name?: string, email?: string) => void;
  clearError: () => void;
}

const STORAGE_DEMO_KEY = 'quimica_tutor_demo_user';

export const getFriendlyAuthErrorMessage = (error: unknown): string => {
  if (!error || typeof error !== 'object') return 'Ocurrió un error inesperado al autenticar.';

  const code = (error as { code?: string }).code || '';
  const message = (error as { message?: string }).message || '';

  switch (code) {
    case 'auth/user-not-found':
      return 'No se encontró ninguna cuenta registrada con este correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta.';
    case 'auth/invalid-credential':
      return 'Credenciales inválidas. Comprobá que el correo y la contraseña sean correctos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo electrónico. Probá iniciar sesión.';
    case 'auth/weak-password':
      return 'La contraseña debe tener un mínimo de 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato de correo electrónico ingresado no es válido.';
    case 'auth/operation-not-allowed':
      return 'El proveedor de inicio de sesión no está habilitado en Firebase Console (Authentication > Sign-in method).';
    case 'auth/popup-closed-by-user':
      return 'Se cerró la ventana de inicio de sesión de Google antes de finalizar.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de Google. Habilitá las ventanas emergentes para este sitio.';
    case 'auth/cancelled-popup-request':
      return 'Operación cancelada por nueva solicitud emergente.';
    case 'auth/network-request-failed':
      return 'Error de conexión a internet. Verificá tu red e intentalo de nuevo.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, aguardá unos minutos antes de reintentar.';
    case 'auth/missing-password':
      return 'Por favor, ingresá una contraseña.';
    case 'auth/missing-email':
      return 'Por favor, ingresá tu correo electrónico.';
    default:
      if (message.includes('API key not valid')) {
        return 'La clave VITE_FIREBASE_API_KEY no es válida. Verificá tu archivo .env con los datos de Firebase Console.';
      }
      return message || 'Error al autenticar con el servidor de Firebase.';
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [configured] = useState<boolean>(() => isFirebaseConfigured());

  // Listen to Firebase auth state or recover demo user
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (auth) {
      try {
        unsubscribe = onAuthStateChanged(
          auth,
          (firebaseUser) => {
            if (firebaseUser) {
              setUser(firebaseUser);
              try {
                localStorage.removeItem(STORAGE_DEMO_KEY);
              } catch {
                // Ignore storage error
              }
            } else {
              // Check if a demo user is stored locally
              try {
                const storedDemo = localStorage.getItem(STORAGE_DEMO_KEY);
                if (storedDemo) {
                  setUser(JSON.parse(storedDemo));
                } else {
                  setUser(null);
                }
              } catch {
                setUser(null);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.warn('[AuthContext] Error en onAuthStateChanged:', error);
            setLoading(false);
          }
        );
      } catch (err) {
        console.warn('[AuthContext] No se pudo inicializar listener de Firebase:', err);
        setLoading(false);
      }
    } else {
      // Firebase not active, check demo user
      try {
        const storedDemo = localStorage.getItem(STORAGE_DEMO_KEY);
        if (storedDemo) {
          setUser(JSON.parse(storedDemo));
        }
      } catch {
        // Ignore
      }
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string): Promise<void> => {
    setAuthError(null);
    if (!email.trim() || !pass) {
      setAuthError('Por favor completá todos los campos.');
      return;
    }

    if (!auth) {
      setAuthError(
        'Firebase no está configurado aún en el archivo .env. Podés usar el botón "Modo Demo" para probar la plataforma.'
      );
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(userCredential.user);
      try {
        localStorage.removeItem(STORAGE_DEMO_KEY);
      } catch {
        // Ignore
      }
    } catch (err) {
      const msg = getFriendlyAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, pass: string, displayName?: string): Promise<void> => {
      setAuthError(null);
      if (!email.trim() || !pass) {
        setAuthError('Por favor ingresá un correo y una contraseña.');
        return;
      }
      if (pass.length < 6) {
        setAuthError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      if (!auth) {
        setAuthError(
          'Firebase no está configurado aún en el archivo .env. Podés usar el botón "Modo Demo" para probar la plataforma.'
        );
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
        if (displayName?.trim()) {
          try {
            await updateProfile(userCredential.user, {
              displayName: displayName.trim(),
            });
          } catch (e) {
            console.warn('[Auth] No se pudo actualizar displayName:', e);
          }
        }
        setUser(userCredential.user);
        try {
          localStorage.removeItem(STORAGE_DEMO_KEY);
        } catch {
          // Ignore
        }
      } catch (err) {
        const msg = getFriendlyAuthErrorMessage(err);
        setAuthError(msg);
        throw err;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (): Promise<void> => {
    setAuthError(null);

    if (!auth) {
      setAuthError(
        'Firebase no está conectado con credenciales activas. Verificá tus variables VITE_FIREBASE_* en .env o utilizá el Modo Demo.'
      );
      return;
    }

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      setUser(userCredential.user);
      try {
        localStorage.removeItem(STORAGE_DEMO_KEY);
      } catch {
        // Ignore
      }
    } catch (err) {
      const msg = getFriendlyAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setAuthError(null);
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('[Auth] Error al cerrar sesión en Firebase:', err);
    } finally {
      setUser(null);
      try {
        localStorage.removeItem(STORAGE_DEMO_KEY);
      } catch {
        // Ignore
      }
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setAuthError(null);
    if (!email.trim()) {
      setAuthError('Por favor ingresá tu correo electrónico para restablecer tu contraseña.');
      return;
    }

    if (!auth) {
      setAuthError('Firebase Authentication no está inicializado.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      const msg = getFriendlyAuthErrorMessage(err);
      setAuthError(msg);
      throw err;
    }
  }, []);

  const loginAsDemo = useCallback((name = 'Estudiante Invitado', email = 'estudiante@quimicatutor.edu') => {
    const demoUser: AppUser = {
      uid: 'demo-' + Date.now(),
      email,
      displayName: name,
      photoURL: null,
      isDemo: true,
    };
    setUser(demoUser);
    setAuthError(null);
    try {
      localStorage.setItem(STORAGE_DEMO_KEY, JSON.stringify(demoUser));
    } catch (err) {
      console.warn('[Auth] Error al guardar usuario demo en localStorage:', err);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isConfigured: configured,
    authError,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
    loginAsDemo,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
