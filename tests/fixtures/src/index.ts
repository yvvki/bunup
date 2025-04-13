import Bun, { type BunPlugin } from "bun";

console.log("url:", import.meta.url);
export const url: string = import.meta.url;

const someFile = Bun.file("some-file.txt");

console.log("process.env:", process.env.SOME_ENV_VAR);
console.log("process.env:", process.env.API_URL);

export const plugin: BunPlugin = {
    name: "some-plugin",
    setup(build) {
        build.onLoad({ filter: /\.txt$/ }, () => {
            return { contents: "some-content", loader: "text" };
        });
    },
};

export const someFileContent: Promise<string> = someFile.text();
