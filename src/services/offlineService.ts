import { Section, Student, Grade } from '@/types/grading';

interface OfflineData {
  sections: Section[];
  students: Student[];
  grades: Grade[];
  lastSync: string;
}

class OfflineService {
  private readonly STORAGE_KEY = 'educHub_offline_data';
  private readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

  // Save data to localStorage
  saveOfflineData(data: Partial<OfflineData>): void {
    try {
      const existingData = this.getOfflineData();
      const newData = { ...existingData, ...data, lastSync: new Date().toISOString() };
      
      const dataString = JSON.stringify(newData);
      
      // Check storage size limit
      if (dataString.length > this.MAX_STORAGE_SIZE) {
        console.warn('Offline data exceeds storage limit, clearing old data');
        this.clearOfflineData();
        return;
      }
      
      localStorage.setItem(this.STORAGE_KEY, dataString);
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Get data from localStorage
  getOfflineData(): OfflineData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return {
          sections: [],
          students: [],
          grades: [],
          lastSync: new Date().toISOString()
        };
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return {
        sections: [],
        students: [],
        grades: [],
        lastSync: new Date().toISOString()
      };
    }
  }

  // Clear offline data
  clearOfflineData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Check if data is stale (older than 1 hour)
  isDataStale(): boolean {
    const data = this.getOfflineData();
    const lastSync = new Date(data.lastSync);
    const now = new Date();
    const oneHour = 60 * 60 * 1000;
    
    return (now.getTime() - lastSync.getTime()) > oneHour;
  }

  // Get sections from offline data
  getOfflineSections(): Section[] {
    return this.getOfflineData().sections;
  }

  // Get grades from offline data
  getOfflineGrades(userId?: string): Grade[] {
    const grades = this.getOfflineData().grades;
    if (userId) {
      return grades.filter(grade => grade.userId === userId);
    }
    return grades;
  }

  // Check if we're online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Listen for online/offline events
  onConnectionChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}

export const offlineService = new OfflineService();
