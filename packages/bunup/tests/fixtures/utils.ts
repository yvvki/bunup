export function createFixture(name: string) {
    return {
        name,
        path: `./${name}`,
        content: `export const ${name} = "foo";`,
    };
}
