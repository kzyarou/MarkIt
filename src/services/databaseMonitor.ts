interface DatabaseMetrics {
  reads: number;
  writes: number;
  deletes: number;
  cacheHits: number;
  cacheMisses: number;
  offlineFallbacks: number;
  startTime: number;
}

class DatabaseMonitor {
  private metrics: DatabaseMetrics = {
    reads: 0,
    writes: 0,
    deletes: 0,
    cacheHits: 0,
    cacheMisses: 0,
    offlineFallbacks: 0,
    startTime: Date.now()
  };

  // Track read operations
  trackRead(cached: boolean = false): void {
    this.metrics.reads++;
    if (cached) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  // Track write operations
  trackWrite(): void {
    this.metrics.writes++;
  }

  // Track delete operations
  trackDelete(): void {
    this.metrics.deletes++;
  }

  // Track offline fallback
  trackOfflineFallback(): void {
    this.metrics.offlineFallbacks++;
  }

  // Get current metrics
  getMetrics(): DatabaseMetrics & { 
    uptime: number; 
    readEfficiency: number; 
    estimatedCost: number;
  } {
    const uptime = Date.now() - this.metrics.startTime;
    const readEfficiency = this.metrics.reads > 0 
      ? (this.metrics.cacheHits / this.metrics.reads) * 100 
      : 0;
    
    // Rough cost estimation (Firestore pricing)
    const estimatedCost = {
      reads: this.metrics.reads * 0.00006, // $0.06 per 100K reads
      writes: this.metrics.writes * 0.00018, // $0.18 per 100K writes
      deletes: this.metrics.deletes * 0.00002, // $0.02 per 100K deletes
    };

    return {
      ...this.metrics,
      uptime,
      readEfficiency: Math.round(readEfficiency * 100) / 100,
      estimatedCost: Object.values(estimatedCost).reduce((sum, cost) => sum + cost, 0)
    };
  }

  // Reset metrics
  reset(): void {
    this.metrics = {
      reads: 0,
      writes: 0,
      deletes: 0,
      cacheHits: 0,
      cacheMisses: 0,
      offlineFallbacks: 0,
      startTime: Date.now()
    };
  }

  // Log metrics to console (development only)
  logMetrics(): void {
    if (import.meta.env.MODE === 'development') {
      const metrics = this.getMetrics();
      console.group('📊 Database Performance Metrics');
      console.log(`📖 Reads: ${metrics.reads} (${metrics.cacheHits} cached, ${metrics.cacheMisses} misses)`);
      console.log(`✍️ Writes: ${metrics.writes}`);
      console.log(`🗑️ Deletes: ${metrics.deletes}`);
      console.log(`📱 Offline Fallbacks: ${metrics.offlineFallbacks}`);
      console.log(`⚡ Cache Efficiency: ${metrics.readEfficiency}%`);
      console.log(`💰 Estimated Cost: $${metrics.estimatedCost.toFixed(4)}`);
      console.log(`⏱️ Uptime: ${Math.round(metrics.uptime / 1000)}s`);
      console.groupEnd();
    }
  }

  // Auto-log metrics every 5 minutes in development
  startAutoLogging(): void {
    if (import.meta.env.MODE === 'development') {
      setInterval(() => {
        this.logMetrics();
      }, 5 * 60 * 1000); // 5 minutes
    }
  }
}

export const databaseMonitor = new DatabaseMonitor();

// Start auto-logging in development
if (import.meta.env.MODE === 'development') {
  databaseMonitor.startAutoLogging();
}
