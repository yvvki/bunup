export type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

export type Without<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};
