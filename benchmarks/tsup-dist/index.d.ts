declare function formatString(str: string, options?: FormatOptions): string;
interface FormatOptions {
    uppercase?: boolean;
    trim?: boolean;
    truncate?: number;
}
declare function delay(ms: number): Promise<void>;
declare function isEmpty(value: unknown): boolean;
declare const generateId: () => string;
declare class SafeStorage {
    static get<T>(key: string, defaultValue: T): T;
    static set<T>(key: string, value: T): void;
}

declare function add(a: number, b: number): number;
declare function subtract(a: number, b: number): number;
declare function multiply(a: number, b: number): number;
declare function divide(a: number, b: number): number;
declare function square(n: number): number;
declare function sqrt(n: number): number;
declare class Vector2D {
    x: number;
    y: number;
    constructor(x: number, y: number);
    add(other: Vector2D): Vector2D;
    subtract(other: Vector2D): Vector2D;
    scale(factor: number): Vector2D;
    dotProduct(other: Vector2D): number;
    magnitude(): number;
    normalize(): Vector2D;
}

type ID = string | number;
interface User {
    id: ID;
    name: string;
    email: string;
    age?: number;
    isActive: boolean;
    role: UserRole;
    metadata?: Record<string, unknown>;
}
declare enum UserRole {
    Admin = "ADMIN",
    User = "USER",
    Guest = "GUEST"
}
type Nullable<T> = T | null;
type Optional<T> = T | undefined;
type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
interface Pagination {
    page: number;
    limit: number;
    total?: number;
}
type SortDirection = 'asc' | 'desc';
interface SortOptions {
    field: string;
    direction: SortDirection;
}
interface QueryOptions {
    pagination?: Pagination;
    sort?: SortOptions;
    filters?: Record<string, unknown>;
}
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

declare function main(name: string, options?: MainOptions): string;
interface MainOptions {
    greeting?: string;
    excited?: boolean;
}

export { type DeepPartial, type FormatOptions, type ID, type MainOptions, type Nullable, type Optional, type Pagination, type QueryOptions, type Result, SafeStorage, type SortDirection, type SortOptions, type User, UserRole, Vector2D, add, delay, divide, formatString, generateId, isEmpty, main, multiply, sqrt, square, subtract };
