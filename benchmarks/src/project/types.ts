export type ID = string | number;

export interface User {
      id: ID;
      name: string;
      email: string;
      age?: number;
      isActive: boolean;
      role: UserRole;
      metadata?: Record<string, unknown>;
}

export enum UserRole {
      Admin = 'ADMIN',
      User = 'USER',
      Guest = 'GUEST',
}

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Result<T, E = Error> =
      | {
              success: true;
              data: T;
        }
      | {
              success: false;
              error: E;
        };

export interface Pagination {
      page: number;
      limit: number;
      total?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortOptions {
      field: string;
      direction: SortDirection;
}

export interface QueryOptions {
      pagination?: Pagination;
      sort?: SortOptions;
      filters?: Record<string, unknown>;
}

export type DeepPartial<T> = {
      [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
