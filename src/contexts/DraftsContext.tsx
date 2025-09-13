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
    if (user && user.id) {
      const loaded = listDrafts<Section>(user.id, 'section').map(d => d.data);
      console.log('Refreshing drafts for user:', user.id, 'loaded:', loaded);
      setDrafts(loaded);
      window.dispatchEvent(new Event('drafts-updated'));
    } else {
      console.log('No user or user.id available for drafts refresh');
      setDrafts([]);
    }
  };

  const saveDraft = (section: Section) => {
    if (user && user.id) {
      console.log('Saving draft for user:', user.id, 'section:', section.id);
      saveDraftToStorage(user.id, 'section', section.id, section);
      refreshDrafts();
    } else {
      console.error('Cannot save draft: no user or user.id available');
    }
  };

  const deleteDraft = (sectionId: string) => {
    if (user && user.id) {
      console.log('Deleting draft for user:', user.id, 'section:', sectionId);
      deleteDraftFromStorage(user.id, 'section', sectionId);
      refreshDrafts();
    } else {
      console.error('Cannot delete draft: no user or user.id available');
    }
  };

  useEffect(() => {
    console.log('DraftsContext: user changed, refreshing drafts. User:', user);
    refreshDrafts();
    // eslint-disable-next-line
  }, [user?.id]);

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