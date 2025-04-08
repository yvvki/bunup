import Bun from "bun";
import { one, two } from "utils";

console.log(Bun.version);

declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;

export { FSWatcher } from "chokidar";

export * from "cool";

export function add(one: number, two: number): number {
    return one + two;
}

export { numbers } from "utils";

const something = `${PACKAGE_NAME} ${PACKAGE_VERSION}`;

export const result: number = add(one, two);

export const somethingElse: string = something;

// import { something } from 'utils/kaka/something';
// const x = require('./not-a-file');
