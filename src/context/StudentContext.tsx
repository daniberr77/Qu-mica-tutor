import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { StudentProfile, StudyLevel } from '../types';
import {
  getStoredProfile,
  saveStoredProfile,
  DEFAULT_STUDENT_PROFILE,
  getTodayDateString,
} from '../services/storage';
import {
  fetchStudentProfileFromDb,
  saveStudentProfileToDb,
  subscribeToStudentProfile,
  isFirebaseConfigured,
  sanitizeStudentProfile,
} from '../services/firebase';

export type DatabaseStatus = 'firestore' | 'local_fallback' | 'connecting';
export type Profile = StudentProfile;

export interface StudentContextType {
  profile: StudentProfile;
  dbStatus: DatabaseStatus;
  isPremiumModalOpen: boolean;
  setIsPremiumModalOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  checkoutPlanId: string | null;
  openCheckout: (planId?: string) => void;
  closeCheckout: () => void;
  updateName: (name: string) => void;
  updateLevel: (level: StudyLevel) => void;
  updateAvatar: (avatar: string) => void;
  addXp: (amount: number, reason?: string) => void;
  toggleSubtopicCompleted: (subtopicId: string, moduleId?: number) => void;
  recordQuizScore: (moduleId: number, score: number, total: number) => void;
  toggleFlashcardMastered: (cardId: string) => void;
  toggleFavoriteElement: (atomicNumber: number) => void;
  saveNote: (subtopicId: string, note: string) => void;
  resetProgress: () => void;
  // Métodos de créditos y versión Premium
  deductCredit: () => void;
  restoreDailyCredits: (amount?: number) => void;
  upgradeToPremium: (planType?: 'subscription' | 'one_time') => void;
  cancelPremium: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const loaded = getStoredProfile();
    const today = getTodayDateString();

    // Check study streak
    if (loaded.lastActiveDate !== today) {
      const lastDate = new Date(loaded.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = loaded.streakDays;
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      }

      // Check daily credits reset
      const refreshedCredits = loaded.isPremium
        ? 9999
        : (loaded.lastCreditResetDate !== today ? (loaded.dailyCreditLimit || 20) : loaded.credits);

      const updated: StudentProfile = {
        ...loaded,
        streakDays: newStreak,
        lastActiveDate: today,
        lastCreditResetDate: today,
        credits: refreshedCredits,
      };
      saveStoredProfile(updated);
      return updated;
    }

    return sanitizeStudentProfile(loaded);
  });

  const [dbStatus, setDbStatus] = useState<DatabaseStatus>(
    isFirebaseConfigured() ? 'connecting' : 'local_fallback'
  );
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const isInitialSyncRef = useRef<boolean>(true);

  // Escuchar eventos globales de Webhooks de Stripe simulados o reales
  useEffect(() => {
    const handleWebhookEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ updatedProfile: StudentProfile }>;
      if (customEvent.detail?.updatedProfile) {
        setProfile(customEvent.detail.updatedProfile);
      } else {
        const stored = getStoredProfile();
        setProfile(stored);
      }
    };

    window.addEventListener('quimica_stripe_webhook_received', handleWebhookEvent);
    return () => {
      window.removeEventListener('quimica_stripe_webhook_received', handleWebhookEvent);
    };
  }, []);

  const openCheckout = useCallback((planId: string = 'premium_monthly') => {
    setCheckoutPlanId(planId);
    setIsCheckoutOpen(true);
    setIsPremiumModalOpen(false);
  }, []);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setCheckoutPlanId(null);
  }, []);

  // Sync with Firestore on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initDbSync = async () => {
      if (isFirebaseConfigured()) {
        try {
          setDbStatus('connecting');
          const remoteProfile = await fetchStudentProfileFromDb(profile.id);
          setProfile(remoteProfile);
          setDbStatus('firestore');

          // Attach realtime listener
          const unsub = subscribeToStudentProfile(profile.id, (updated) => {
            setProfile(updated);
          });
          if (unsub) {
            unsubscribe = unsub;
          }
        } catch (err) {
          console.warn('[Firestore] Fallback to local storage:', err);
          setDbStatus('local_fallback');
        }
      } else {
        setDbStatus('local_fallback');
      }
    };

    initDbSync();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Save changes to Firestore / LocalStorage whenever profile changes (skip first mount)
  useEffect(() => {
    if (isInitialSyncRef.current) {
      isInitialSyncRef.current = false;
      return;
    }
    saveStudentProfileToDb(profile);
  }, [profile]);

  const updateName = useCallback((name: string) => {
    setProfile((prev) => ({ ...prev, name: name.trim() || 'Estudiante' }));
  }, []);

  const updateLevel = useCallback((level: StudyLevel) => {
    setProfile((prev) => ({ ...prev, level }));
  }, []);

  const updateAvatar = useCallback((avatar: string) => {
    setProfile((prev) => ({ ...prev, avatar }));
  }, []);

  const addXp = useCallback((amount: number, reason?: string) => {
    setProfile((prev) => {
      const newXp = Math.max(0, prev.xp + amount);
      if (reason) {
        console.log(`[XP +${amount}] ${reason} -> Total: ${newXp}`);
      }
      return { ...prev, xp: newXp };
    });
  }, []);

  const toggleSubtopicCompleted = useCallback((subtopicId: string, moduleId?: number) => {
    setProfile((prev) => {
      const isCompleted = prev.completedSubtopics.includes(subtopicId);
      const newCompletedSubtopics = isCompleted
        ? prev.completedSubtopics.filter((id) => id !== subtopicId)
        : [...prev.completedSubtopics, subtopicId];

      const newModules = [...prev.completedModules];
      if (moduleId && !isCompleted && !newModules.includes(moduleId)) {
        // You can conditionally mark module completed
      }

      const xpBonus = !isCompleted ? 25 : 0;

      return {
        ...prev,
        completedSubtopics: newCompletedSubtopics,
        xp: prev.xp + xpBonus,
      };
    });
  }, []);

  const recordQuizScore = useCallback((moduleId: number, score: number, total: number) => {
    setProfile((prev) => {
      const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
      const key = `module-${moduleId}`;
      const existing = prev.quizScores[key];
      const isNewHighScore = !existing || score > existing.score;

      const attempt = {
        moduleId,
        score,
        total,
        percentage,
        timestamp: new Date().toISOString(),
      };

      let xpEarned = score * 15;
      if (percentage === 100) xpEarned += 50;

      const newCompletedModules = [...prev.completedModules];
      if (percentage >= 70 && !newCompletedModules.includes(moduleId)) {
        newCompletedModules.push(moduleId);
      }

      return {
        ...prev,
        completedModules: newCompletedModules,
        quizScores: {
          ...prev.quizScores,
          [key]: isNewHighScore ? attempt : (existing || attempt),
        },
        xp: prev.xp + xpEarned,
      };
    });
  }, []);

  const toggleFlashcardMastered = useCallback((cardId: string) => {
    setProfile((prev) => {
      const isMastered = prev.masteredFlashcards.includes(cardId);
      const newMastered = isMastered
        ? prev.masteredFlashcards.filter((id) => id !== cardId)
        : [...prev.masteredFlashcards, cardId];

      return {
        ...prev,
        masteredFlashcards: newMastered,
        xp: !isMastered ? prev.xp + 10 : prev.xp,
      };
    });
  }, []);

  const toggleFavoriteElement = useCallback((atomicNumber: number) => {
    setProfile((prev) => {
      const isFav = prev.favoriteElements.includes(atomicNumber);
      return {
        ...prev,
        favoriteElements: isFav
          ? prev.favoriteElements.filter((num) => num !== atomicNumber)
          : [...prev.favoriteElements, atomicNumber],
      };
    });
  }, []);

  const saveNote = useCallback((subtopicId: string, note: string) => {
    setProfile((prev) => ({
      ...prev,
      notes: {
        ...prev.notes,
        [subtopicId]: note,
      },
    }));
  }, []);

  const resetProgress = useCallback(() => {
    const today = getTodayDateString();
    const reset = {
      ...DEFAULT_STUDENT_PROFILE,
      lastActiveDate: today,
      lastCreditResetDate: today,
      credits: 20,
    };
    setProfile(reset);
    saveStudentProfileToDb(reset);
  }, []);

  /**
   * Resta 1 a los créditos actuales del estudiante si no es Premium.
   * Si los créditos llegan a 0, abre el modal de Premium para invitar a mejorar el plan.
   */
  const deductCredit = useCallback((): void => {
    setProfile((prev) => {
      if (prev.isPremium) {
        return {
          ...prev,
          totalMessagesSent: (prev.totalMessagesSent || 0) + 1,
        };
      }

      if (prev.credits <= 0) {
        setIsPremiumModalOpen(true);
        return prev;
      }

      const nextCredits = Math.max(0, prev.credits - 1);
      if (nextCredits === 0) {
        setIsPremiumModalOpen(true);
      }

      return {
        ...prev,
        credits: nextCredits,
        totalMessagesSent: (prev.totalMessagesSent || 0) + 1,
      };
    });
  }, []);

  /**
   * Restores daily credits (20 credits by default)
   */
  const restoreDailyCredits = useCallback((amount: number = 20) => {
    const today = getTodayDateString();
    setProfile((prev) => {
      const updated: StudentProfile = {
        ...prev,
        credits: amount,
        dailyCreditLimit: amount,
        lastCreditResetDate: today,
      };
      saveStudentProfileToDb(updated);
      return updated;
    });
  }, []);

  /**
   * Upgrades the student to Premium (unlimited credits)
   */
  const upgradeToPremium = useCallback((planType: 'subscription' | 'one_time' = 'subscription') => {
    setProfile((prev) => {
      const updated: StudentProfile = {
        ...prev,
        isPremium: true,
        premiumPlanType: planType,
        premiumSince: new Date().toISOString(),
        credits: 9999,
      };
      saveStudentProfileToDb(updated);
      return updated;
    });
  }, []);

  /**
   * Reverts student to Free tier with 15 credits
   */
  const cancelPremium = useCallback(() => {
    setProfile((prev) => {
      const updated: StudentProfile = {
        ...prev,
        isPremium: false,
        premiumPlanType: null,
        credits: 15,
      };
      saveStudentProfileToDb(updated);
      return updated;
    });
  }, []);

  const value = {
    profile,
    dbStatus,
    isPremiumModalOpen,
    setIsPremiumModalOpen,
    isCheckoutOpen,
    checkoutPlanId,
    openCheckout,
    closeCheckout,
    updateName,
    updateLevel,
    updateAvatar,
    addXp,
    toggleSubtopicCompleted,
    recordQuizScore,
    toggleFlashcardMastered,
    toggleFavoriteElement,
    saveNote,
    resetProgress,
    deductCredit,
    restoreDailyCredits,
    upgradeToPremium,
    cancelPremium,
  };

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent debe ser utilizado dentro de un StudentProvider');
  }
  return context;
};
