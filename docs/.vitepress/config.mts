import {defineConfig} from 'vitepress';

import {version} from '../../package.json';

export default defineConfig({
    title: 'Bunup',
    description:
        'A extremely fast, zero-config bundler for TypeScript & JavaScript, powered by Bun.',
    themeConfig: {
        nav: [
            {
                text: `v${version}`,
                items: [
                    {
                        text: `Release Notes`,
                        link: 'https://github.com/arshad-yaseen/bunup/releases',
                    },
                    {
                        text: `Contributing`,
                        link: 'https://github.com/arshad-yaseen/bunup/blob/main/CONTRIBUTING.md',
                    },
                ],
            },
        ],
        editLink: {
            pattern:
                'https://github.com/arshad-yaseen/bunup/edit/main/docs/:path',
            text: 'Suggest changes to this page',
        },
        search: {
            provider: 'local',
        },
        footer: {
            message: 'Released under the MIT License.',
        },
        sidebar: [
            {
                text: 'Getting Started',
                items: [{text: 'Quick Start', link: '/'}],
            },
        ],

        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/arshad-yaseen/bunup',
            },
        ],
    },
    head: [
        ['meta', {name: 'theme-color', content: '#ffffff'}],
        ['link', {rel: 'icon', href: '/logo.svg', type: 'image/svg+xml'}],
        ['meta', {name: 'author', content: 'Arshad Yaseen'}],
        ['meta', {property: 'og:title', content: 'Bunup'}],
        [
            'meta',
            {
                property: 'og:image',
                content: 'https://bunup.arshadyaseen.com/og.png',
            },
        ],
        [
            'meta',
            {
                property: 'og:description',
                content:
                    'A extremely fast, zero-config bundler for TypeScript & JavaScript, powered by Bun.',
            },
        ],
        ['meta', {name: 'twitter:card', content: 'summary_large_image'}],
        [
            'meta',
            {
                name: 'twitter:image',
                content: 'https://bunup.arshadyaseen.com/og.png',
            },
        ],
        [
            'meta',
            {
                name: 'viewport',
                content:
                    'width=device-width, initial-scale=1.0, viewport-fit=cover',
            },
        ],
    ],
});
