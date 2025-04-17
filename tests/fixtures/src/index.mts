console.log("url:", import.meta.url);
export const url: string = import.meta.url;

console.log("process.env:", process.env.SOME_ENV_VAR);
console.log("process.env:", process.env.API_URL);

type Bun = typeof import("bun");

export type { Bun };

export * from "./another";
