import {one, two} from '@/utils/numbers';

export {cool} from './cool';

export function add(one: number, two: number) {
    return one + two;
}

export const result = add(one, two);
