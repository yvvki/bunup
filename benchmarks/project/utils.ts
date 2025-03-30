export function formatString(str: string, options?: FormatOptions): string {
      let result = str;

      if (options?.uppercase) {
            result = result.toUpperCase();
      }

      if (options?.trim) {
            result = result.trim();
      }

      if (options?.truncate && result.length > options.truncate) {
            result = result.substring(0, options.truncate) + '...';
      }

      return result;
}

export interface FormatOptions {
      uppercase?: boolean;
      trim?: boolean;
      truncate?: number;
}

export function delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
}

export function isEmpty(value: unknown): boolean {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim().length === 0;
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === 'object') return Object.keys(value).length === 0;
      return false;
}

export const generateId = (): string => {
      return Math.random().toString(36).substring(2, 15);
};

export class SafeStorage {
      static get<T>(key: string, defaultValue: T): T {
            try {
                  const item = localStorage.getItem(key);
                  return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                  return defaultValue;
            }
      }

      static set<T>(key: string, value: T): void {
            try {
                  localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                  console.error('Failed to save to localStorage', e);
            }
      }
}
