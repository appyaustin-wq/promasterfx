/**
 * Firestore Sync Logger & Performance Profiler
 * Logs lifecycle events, synchronization states, network performance, and bottlenecks.
 */

export interface LogDetails {
  path?: string;
  queryConstraints?: string[];
  recordsCount?: number;
  userId?: string;
  email?: string;
  metadata?: Record<string, any>;
}

export class SyncLogger {
  private static SLOW_THRESHOLD_MS = 300; // Warn if operation exceeds 300ms

  /**
   * Generates a styled tag for console logs.
   */
  private static getStyle(level: 'info' | 'warn' | 'error' | 'success'): string {
    const base = 'padding: 2px 5px; border-radius: 3px; font-weight: bold; color: #fff;';
    switch (level) {
      case 'info':
        return `${base} background-color: #3b82f6;`; // Blue
      case 'warn':
        return `${base} background-color: #f59e0b; color: #000;`; // Amber
      case 'error':
        return `${base} background-color: #ef4444;`; // Red
      case 'success':
        return `${base} background-color: #10b981;`; // Emerald
    }
  }

  /**
   * Profile a Promise-based Firestore operation.
   */
  public static async profile<T>(
    operationName: string,
    action: () => Promise<T>,
    details: LogDetails = {}
  ): Promise<T> {
    const startTime = performance.now();
    const timestamp = new Date().toISOString();

    console.groupCollapsed(
      `%c[Firebase Sync]%c ⏳ ${operationName} initiated at ${timestamp}`,
      this.getStyle('info'),
      'color: inherit; font-weight: normal;'
    );
    if (details.path) console.log(`%cPath:%c ${details.path}`, 'font-weight: bold; color: #888;', 'color: inherit;');
    if (details.userId) console.log(`%cUser ID:%c ${details.userId} (${details.email || 'N/A'})`, 'font-weight: bold; color: #888;', 'color: inherit;');
    if (details.queryConstraints) console.log(`%cConstraints:%c`, 'font-weight: bold; color: #888;', details.queryConstraints);
    console.groupEnd();

    try {
      const result = await action();
      const endTime = performance.now();
      const duration = parseFloat((endTime - startTime).toFixed(2));
      const count = Array.isArray(result) ? result.length : (result ? 1 : 0);

      const isSlow = duration > this.SLOW_THRESHOLD_MS;
      const level = isSlow ? 'warn' : 'success';

      console.groupCollapsed(
        `%c[Firebase Sync]%c %c${operationName} completed in ${duration}ms%c${isSlow ? ' ⚠️ [SLOW BOTTLENECK]' : ''}`,
        this.getStyle(level),
        'color: inherit; font-weight: normal;',
        'font-weight: bold; color: inherit;',
        'color: #f59e0b; font-weight: bold;'
      );
      console.log(`%cDuration:%c ${duration}ms`, 'font-weight: bold; color: #888;', 'color: inherit;');
      console.log(`%cCount:%c ${count} record(s)`, 'font-weight: bold; color: #888;', 'color: inherit;');
      if (details.metadata) console.log(`%cMeta:%c`, 'font-weight: bold; color: #888;', details.metadata);
      console.groupEnd();

      return result;
    } catch (err: any) {
      const endTime = performance.now();
      const duration = parseFloat((endTime - startTime).toFixed(2));

      console.group(
        `%c[Firebase Sync]%c ❌ %c${operationName} failed after ${duration}ms`,
        this.getStyle('error'),
        'color: inherit; font-weight: normal;',
        'font-weight: bold; color: #ef4444;'
      );
      console.error(`Error details:`, err);
      if (err?.code) console.error(`Firebase Code: ${err.code}`);
      if (details.path) console.log(`Failed Path: ${details.path}`);
      console.groupEnd();

      throw err;
    }
  }

  /**
   * Log real-time onSnapshot synchronization events.
   */
  public static logSnapshotEvent(
    subscriptionName: string,
    recordsCount: number,
    userId?: string
  ): void {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[Firebase Sync]%c 📡 %c${subscriptionName}%c synced %c${recordsCount} records%c for %c${userId || 'Guest'}%c at ${timestamp}`,
      this.getStyle('success'),
      'color: inherit;',
      'font-weight: bold; color: #10b981;',
      'color: inherit;',
      'font-weight: bold; color: inherit;',
      'color: inherit;',
      'font-weight: bold; color: #a855f7;',
      'color: inherit;'
    );
  }

  /**
   * Log Auth state modifications.
   */
  public static logAuthStateChange(
    state: 'SIGNED_IN' | 'SIGNED_OUT' | 'LOCAL_GUEST_SESSION',
    userEmail?: string | null,
    userId?: string
  ): void {
    const timestamp = new Date().toISOString();
    console.log(
      `%c[Firebase Auth]%c 🔑 State change: %c${state}%c for user: %c${userEmail || 'N/A'}%c (ID: ${userId || 'N/A'}) at ${timestamp}`,
      this.getStyle(state === 'SIGNED_OUT' ? 'warn' : 'success'),
      'color: inherit;',
      'font-weight: bold; color: inherit;',
      'color: inherit;',
      'font-weight: bold; color: #3b82f6;',
      'color: inherit;'
    );
  }
}
