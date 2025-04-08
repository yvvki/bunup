import { defineConfig } from "vitepress";
import {
    groupIconMdPlugin,
    groupIconVitePlugin,
} from "vitepress-plugin-group-icons";

import { version } from "../../package.json";

export default defineConfig({
    title: "Bunup",
    description:
        "An extremely fast, zero-config bundler for TypeScript & JavaScript, powered by Bun.",
    themeConfig: {
        logo: "/logo.png",
        nav: [
            {
                text: "Typescript Library Starter",
                link: "/typescript-library-starter",
            },
            {
                text: `v${version}`,
                items: [
                    {
                        text: "Release Notes",
                        link: "https://github.com/arshad-yaseen/bunup/releases",
                    },
                    {
                        text: "Contributing",
                        link: "https://github.com/arshad-yaseen/bunup/blob/main/CONTRIBUTING.md",
                    },
                ],
            },
        ],
        // sidebar: [
        //       {
        //             text: 'Bunup',
        //             link: '/',
        //       },
        //       {
        //             text: 'Typescript Library Starter',
        //             link: '/typescript-library-starter',
        //       },
        // ],
        editLink: {
            pattern:
                "https://github.com/arshad-yaseen/bunup/edit/main/docs/:path",
            text: "Suggest changes to this page",
        },
        search: {
            provider: "local",
        },
        footer: {
            message: "Released under the MIT License.",
        },
        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/arshad-yaseen/bunup",
            },
        ],
    },
    head: [
        ["meta", { name: "theme-color", content: "#ffffff" }],
        ["link", { rel: "icon", href: "/favicon.ico" }],
        ["meta", { name: "author", content: "Arshad Yaseen" }],
        ["meta", { property: "og:title", content: "Bunup" }],
        [
            "meta",
            {
                property: "og:image",
                content: "https://bunup.arshadyaseen.com/og.png",
            },
        ],
        [
            "meta",
            {
                property: "og:description",
                content:
                    "An extremely fast, zero-config bundler for TypeScript & JavaScript, powered by Bun.",
            },
        ],
        ["meta", { name: "twitter:card", content: "summary_large_image" }],
        [
            "meta",
            {
                name: "twitter:image",
                content: "https://bunup.arshadyaseen.com/og.png",
            },
        ],
        [
            "meta",
            {
                name: "viewport",
                content:
                    "width=device-width, initial-scale=1.0, viewport-fit=cover",
            },
        ],
    ],
    markdown: {
        config(md) {
            md.use(groupIconMdPlugin);
        },
    },
    vite: {
        plugins: [groupIconVitePlugin()],
    },
    sitemap: {
        hostname: "https://bunup.arshadyaseen.com",
    },
});
