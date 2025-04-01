import {one, two} from '../utils/numbers';

declare const PACKAGE_NAME: string;
declare const PACKAGE_VERSION: string;

export * from './cool';

export function add(one: number, two: number): number {
      return one + two;
}

const something = PACKAGE_NAME + ' ' + PACKAGE_VERSION;

export const result: number = add(one, two);

export const somethingElse: string = something;
