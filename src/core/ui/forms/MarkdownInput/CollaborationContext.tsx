import React, { createContext, useContext, ReactNode } from 'react';

export interface CollaborationConfig {
  serverUrl: string;
  enabled: boolean;
  userInfo: {
    name: string;
    color: string;
    userId: string;
  };
  getToken?: () => Promise<string>;
}

interface CollaborationContextType {
  config: CollaborationConfig;
  generateDocumentId: (entityType: string, entityId: string, fieldName: string) => string;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
  config: CollaborationConfig;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children, config }) => {
  const generateDocumentId = (entityType: string, entityId: string, fieldName: string) => {
    return `${entityType}-${entityId}-${fieldName}`;
  };

  return (
    <CollaborationContext.Provider value={{ config, generateDocumentId }}>{children}</CollaborationContext.Provider>
  );
};
