import { db } from './firebase';
import { collection, query, limit, orderBy, where, getDocs, writeBatch } from 'firebase/firestore';
import { cacheService } from '@/services/cacheService';
import { offlineService } from '@/services/offlineService';

export class FirebaseOptimizer {
  // Optimized query with caching and offline support
  static async optimizedQuery<T>(
    collectionName: string,
    constraints: any[] = [],
    cacheKey: string,
    cacheTTL: number = 5 * 60 * 1000, // 5 minutes default
    maxResults: number = 100
  ): Promise<T[]> {
    // Check cache first
    const cachedData = cacheService.get<T[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Check offline data if online query fails
    try {
      const collectionRef = collection(db, collectionName);
      let q = query(collectionRef, ...constraints, limit(maxResults));
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      
      // Cache the results
      cacheService.set(cacheKey, data, cacheTTL);
      
      // Save to offline storage
      offlineService.saveOfflineData({ [collectionName]: data });
      
      return data;
    } catch (error) {
      console.warn(`Firebase query failed for ${collectionName}, trying offline data:`, error);
      
      // Try offline data as fallback
      const offlineData = offlineService.getOfflineData();
      return (offlineData as any)[collectionName] || [];
    }
  }

  // Batch operations for multiple writes
  static async batchWrite(operations: Array<{
    type: 'set' | 'update' | 'delete';
    collection: string;
    docId: string;
    data?: any;
  }>): Promise<void> {
    const batch = writeBatch(db);
    
    operations.forEach(op => {
      const docRef = doc(db, op.collection, op.docId);
      
      switch (op.type) {
        case 'set':
          batch.set(docRef, op.data);
          break;
        case 'update':
          batch.update(docRef, op.data);
          break;
        case 'delete':
          batch.delete(docRef);
          break;
      }
    });
    
    await batch.commit();
    
    // Invalidate relevant caches
    operations.forEach(op => {
      if (op.collection === 'sections') {
        cacheService.invalidateSectionData(op.docId);
      } else if (op.collection === 'users') {
        cacheService.invalidateUserData(op.docId);
      }
    });
  }

  // Paginated queries to reduce data transfer
  static async paginatedQuery<T>(
    collectionName: string,
    constraints: any[] = [],
    pageSize: number = 20,
    lastDoc?: any
  ): Promise<{ data: T[]; lastDoc: any; hasMore: boolean }> {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef, ...constraints, limit(pageSize + 1));
    
    if (lastDoc) {
      q = query(collectionRef, ...constraints, orderBy('createdAt'), startAfter(lastDoc), limit(pageSize + 1));
    }
    
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const data = docs.slice(0, pageSize).map(doc => ({ id: doc.id, ...doc.data() } as T));
    
    return {
      data,
      lastDoc: hasMore ? docs[pageSize - 1] : null,
      hasMore
    };
  }

  // Connection pooling for real-time listeners
  private static listeners = new Map<string, () => void>();

  static addListener(key: string, unsubscribe: () => void): void {
    // Remove existing listener if any
    if (this.listeners.has(key)) {
      this.listeners.get(key)?.();
    }
    
    this.listeners.set(key, unsubscribe);
  }

  static removeListener(key: string): void {
    const unsubscribe = this.listeners.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(key);
    }
  }

  static removeAllListeners(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  // Memory usage monitoring
  static getMemoryUsage(): { cacheSize: number; listenersCount: number } {
    return {
      cacheSize: cacheService['cache'].size,
      listenersCount: this.listeners.size
    };
  }

  // Cleanup method for app shutdown
  static cleanup(): void {
    this.removeAllListeners();
    cacheService.clear();
    offlineService.clearOfflineData();
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    FirebaseOptimizer.cleanup();
  });
}
