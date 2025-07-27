
import { useAuth } from '@/contexts/AuthContext';

export function useLRN(): string | null {
  const { userLRN } = useAuth();
  return userLRN;
}

export function useHasLRN(): boolean {
  const { userLRN } = useAuth();
  return userLRN !== null && userLRN !== undefined && userLRN.trim() !== '';
}
