import {one, two} from '@/utils/numbers';

export {cool} from './cool';

export function add(one: number, two: number): number {
      return one + two;
}

export const result: number = add(one, two);
