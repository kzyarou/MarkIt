import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Section } from '@/types/grading';
import { listDrafts, saveDraft as saveDraftToStorage, deleteDraft as deleteDraftFromStorage } from '@/utils/localDrafts';
import { useAuth } from './AuthContext';

interface DraftsContextType {
  drafts: Section[];
  refreshDrafts: () => void;
  saveDraft: (section: Section) => void;
  deleteDraft: (sectionId: string) => void;
}

const DraftsContext = createContext<DraftsContextType | undefined>(undefined);

export const DraftsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState<Section[]>([]);

  const refreshDrafts = () => {
    if (user) {
      const loaded = listDrafts<Section>(user.id, 'section').map(d => d.data);
      console.log('Refreshing drafts:', loaded);
      setDrafts(loaded);
      window.dispatchEvent(new Event('drafts-updated'));
    }
  };

  const saveDraft = (section: Section) => {
    if (user) {
      saveDraftToStorage(user.id, 'section', section.id, section);
      refreshDrafts();
    }
  };

  const deleteDraft = (sectionId: string) => {
    if (user) {
      deleteDraftFromStorage(user.id, 'section', sectionId);
      refreshDrafts();
    }
  };

  useEffect(() => {
    refreshDrafts();
    // eslint-disable-next-line
  }, [user]);

  console.log('DraftsProvider render, drafts:', drafts);
  return (
    <DraftsContext.Provider value={{ drafts, refreshDrafts, saveDraft, deleteDraft }}>
      {children}
    </DraftsContext.Provider>
  );
};

export const useDrafts = () => {
  const context = useContext(DraftsContext);
  if (!context) {
    throw new Error('useDrafts must be used within a DraftsProvider');
  }
  return context;
}; 