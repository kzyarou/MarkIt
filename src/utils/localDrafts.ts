// Utility for managing local drafts (sections, attendance) in localStorage

export type DraftType = 'section' | 'attendance';

const DRAFT_PREFIX = 'educhub_draft_';

// Save a draft for a specific user
export function saveDraft<T>(userId: string, type: DraftType, id: string, data: T) {
  localStorage.setItem(`${DRAFT_PREFIX}${userId}_${type}_${id}`, JSON.stringify(data));
}

// Load a draft for a specific user
export function loadDraft<T>(userId: string, type: DraftType, id: string): T | null {
  const raw = localStorage.getItem(`${DRAFT_PREFIX}${userId}_${type}_${id}`);
  return raw ? JSON.parse(raw) : null;
}

// Delete a draft for a specific user
export function deleteDraft(userId: string, type: DraftType, id: string) {
  localStorage.removeItem(`${DRAFT_PREFIX}${userId}_${type}_${id}`);
}

// List all drafts for a specific user and type
export function listDrafts<T>(userId: string, type: DraftType): { id: string, data: T }[] {
  const drafts: { id: string, data: T }[] = [];
  const prefix = `${DRAFT_PREFIX}${userId}_${type}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const id = key.replace(prefix, '');
      const data = JSON.parse(localStorage.getItem(key)!);
      drafts.push({ id, data });
    }
  }
  return drafts;
} 