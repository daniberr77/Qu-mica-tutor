import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';
import type { StudentProfile } from '../types';
import {
  DEFAULT_STUDENT_PROFILE,
  getStoredProfile,
  saveStoredProfile,
} from './storage';

/**
 * Configuración de Firebase leída desde variables de entorno de Vite (VITE_FIREBASE_*).
 * Estas variables se configuran en el archivo `.env` en la raíz del proyecto.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Determina si las credenciales de Firebase han sido configuradas válidamente
 * por el desarrollador en el archivo .env.
 */
export const isFirebaseConfigured = (): boolean => {
  const key = firebaseConfig.apiKey?.trim();
  const projectId = firebaseConfig.projectId?.trim();

  if (!key || !projectId) return false;
  if (key.includes('tu_firebase') || key.includes('tu_api_key')) return false;
  if (projectId.includes('tu-proyecto') || projectId.includes('quimica-tutor-placeholder')) return false;

  return key.length > 10;
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } else if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
    try {
      app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (e) {
      console.warn('[Firebase] Configuración en modo de prueba local:', e);
    }
  }
} catch (error) {
  console.warn('[Firebase] Error durante la inicialización de Firebase:', error);
}

// Proveedor de Google con selector de cuenta explícito
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Normaliza y sanea un perfil de estudiante para asegurar que contiene
 * todas las propiedades requeridas y tipadas.
 */
export const sanitizeStudentProfile = (raw?: Partial<StudentProfile> | null): StudentProfile => {
  if (!raw) return { ...DEFAULT_STUDENT_PROFILE };
  return {
    ...DEFAULT_STUDENT_PROFILE,
    ...raw,
    completedModules: Array.isArray(raw.completedModules) ? raw.completedModules : [],
    completedSubtopics: Array.isArray(raw.completedSubtopics) ? raw.completedSubtopics : [],
    quizScores: raw.quizScores && typeof raw.quizScores === 'object' ? raw.quizScores : {},
    masteredFlashcards: Array.isArray(raw.masteredFlashcards) ? raw.masteredFlashcards : [],
    favoriteElements: Array.isArray(raw.favoriteElements) ? raw.favoriteElements : [1, 6, 8],
    notes: raw.notes && typeof raw.notes === 'object' ? raw.notes : {},
    credits: typeof raw.credits === 'number' ? raw.credits : DEFAULT_STUDENT_PROFILE.credits,
    dailyCreditLimit: typeof raw.dailyCreditLimit === 'number' ? raw.dailyCreditLimit : 20,
    isPremium: Boolean(raw.isPremium),
  };
};

/**
 * Obtiene el perfil del estudiante desde Firestore si está disponible,
 * o de LocalStorage como respaldo inmediato.
 */
export const fetchStudentProfileFromDb = async (studentId: string): Promise<StudentProfile> => {
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'students', studentId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return sanitizeStudentProfile(snapshot.data() as Partial<StudentProfile>);
      }
    } catch (e) {
      console.warn('[Firestore] No se pudo leer perfil de Firestore, usando LocalStorage:', e);
    }
  }
  return sanitizeStudentProfile(getStoredProfile());
};

/**
 * Guarda el perfil del estudiante en LocalStorage y Firestore simultáneamente.
 */
export const saveStudentProfileToDb = async (profile: StudentProfile): Promise<void> => {
  saveStoredProfile(profile);

  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'students', profile.id);
      await setDoc(docRef, profile, { merge: true });
    } catch (e) {
      console.warn('[Firestore] Error al sincronizar perfil en Firestore:', e);
    }
  }
};

/**
 * Escucha cambios en tiempo real en el documento de perfil de Firestore.
 */
export const subscribeToStudentProfile = (
  studentId: string,
  callback: (profile: StudentProfile) => void
): (() => void) | null => {
  if (db && isFirebaseConfigured()) {
    try {
      const docRef = doc(db, 'students', studentId);
      return onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            callback(sanitizeStudentProfile(snapshot.data() as Partial<StudentProfile>));
          }
        },
        (err) => {
          console.warn('[Firestore] Error en snapshot listener:', err);
        }
      );
    } catch (e) {
      console.warn('[Firestore] No se pudo crear snapshot listener:', e);
      return null;
    }
  }
  return null;
};

export { app, auth, db };
export default auth;
