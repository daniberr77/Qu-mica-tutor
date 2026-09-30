import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { StudentProvider, useStudent } from './StudentContext';
import { ChatProvider, useChatHistory } from './ChatContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <StudentProvider>
        <ChatProvider>{children}</ChatProvider>
      </StudentProvider>
    </AuthProvider>
  );
};

export { useAuth, useStudent, useChatHistory };
export * from './AuthContext';
export * from './StudentContext';
export * from './ChatContext';
