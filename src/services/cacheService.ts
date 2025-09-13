import { Section, Student, Grade } from '@/types/grading';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache keys
  static KEYS = {
    SECTIONS: 'sections',
    TEACHER_SECTIONS: (userId: string) => `teacher_sections_${userId}`,
    STUDENT_GRADES: (userId: string) => `student_grades_${userId}`,
    USER_PROFILE: (userId: string) => `user_profile_${userId}`,
    STUDENT_CONNECTIONS: (userLRN: string) => `student_connections_${userLRN}`,
    SECTION_CONNECTIONS: (sectionId: string) => `section_connections_${sectionId}`,
  };

  // Invalidate related cache entries
  invalidateUserData(userId: string): void {
    this.delete(CacheService.KEYS.TEACHER_SECTIONS(userId));
    this.delete(CacheService.KEYS.STUDENT_GRADES(userId));
    this.delete(CacheService.KEYS.USER_PROFILE(userId));
  }

  invalidateSectionData(sectionId: string): void {
    this.delete(CacheService.KEYS.SECTIONS);
    this.delete(CacheService.KEYS.SECTION_CONNECTIONS(sectionId));
    // Clear all teacher sections cache as sections might be affected
    this.cache.forEach((_, key) => {
      if (key.startsWith('teacher_sections_')) {
        this.delete(key);
      }
    });
  }
}

export const cacheService = new CacheService();
