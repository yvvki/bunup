export * from './utils';
export * from './math';
export * from './types';

export function main(name: string, options?: MainOptions): string {
      const greeting = options?.greeting ?? 'Hello';
      const exclamation = options?.excited ? '!' : '.';
      return `${greeting}, ${name}${exclamation}`;
}

export interface MainOptions {
      greeting?: string;
      excited?: boolean;
}
