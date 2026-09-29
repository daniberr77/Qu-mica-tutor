import React from 'react';
import { StudentProvider, useStudent } from './StudentContext';
import { ChatProvider, useChatHistory } from './ChatContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <StudentProvider>
      <ChatProvider>{children}</ChatProvider>
    </StudentProvider>
  );
};

export { useStudent, useChatHistory };
export * from './StudentContext';
export * from './ChatContext';
