export async function some(a: number, b: number) {
        return import('./index').then(m => m.add(a, b));
}
