# Typescript Library Starter

Quickly scaffold modern TypeScript library in 5 seconds. Powered by [Bunup](https://bunup.arshadyaseen.com/) - the fastest TypeScript bundler available ⚡️.

<video src="/ts-lib-starter-demo.mov" alt="Bunup typescript library starter demo video" controls style="border-radius: 8px; border: 1px solid rgba(128, 128, 128, 0.2); box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);"></video>

## Features

- 🚀 **Zero Config**: Get started in seconds with sensible defaults
- 📦 **Modern Setup**: ESM and CJS output formats, TypeScript declarations
- 🧩 **Monorepo Support**: Create workspace-based projects with ease
- 🔧 **Complete Tooling**: Testing, linting, formatting, and CI workflows included
- 🚦 **Git Hooks**: Enforced code quality with Husky pre-commit hooks
- 📝 **Conventional Commits**: Standardized commit messages with commitlint
- 🚢 **Release Automation**: GitHub Actions for testing and publishing

## Getting Started

### Installation

You can create a new project without installing the package by using:

::: code-group

```sh [bun]
bunx create-bunup@latest
```

```sh [npm]
npx create-bunup@latest
```

```sh [pnpm]
pnpx create-bunup@latest
```

:::

Once you run the command, you'll be guided through an interactive process:

```plaintext
$ bunx create-bunup@latest

ℹ TypeScript Library Starter

? Where would you like to create your project? › my-ts-lib

? Select a package manager:
❯ bun - Fast all-in-one JavaScript runtime
  pnpm - Fast, disk space efficient package manager

? Set up as a monorepo? › (y/N)

# If you chose "yes" to monorepo:

? Name for first package: › my-package
```

That's it! 🔥

## Development Workflow

After creating your project, here's how to use it:

### Common Commands

::: code-group

```sh [Dev]
bun run dev
# or
pnpm dev
```

```sh [Test]
bun run test
# or
pnpm test
```

```sh [Lint]
bun run lint
# or
pnpm lint
```

```sh [Format]
bun run format:fix
# or
pnpm format:fix
```

```sh [Type Check]
bun run tsc
# or
pnpm tsc
```

```sh [Build]
bun run build
# or
pnpm build
```

:::

### Committing Code

The project is set up with [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages:

```sh
# Example commit messages:
git commit -m "feat: add user authentication"
git commit -m "fix: resolve issue with data loading"
git commit -m "docs: update API documentation"
git commit -m "chore: update dependencies"
```

Pre-commit hooks will run automatically to check your code quality before each commit.

## 🚀 Releasing Your Package

The project includes GitHub Actions workflows for continuous integration and releasing packages to npm.

### Setup for Releases

1. **Generate an npm token**:

      - Go to [npmjs.com](https://www.npmjs.com/) and sign in to your account
      - Navigate to your profile → Access Tokens → Generate New Token (Granular token)
      - Give it a descriptive name (e.g., "Bunup Publishing")
      - Choose "Read and write" permission for "all packages" to allow publishing
      - Click "Generate Token"
      - Copy the generated token immediately (you won't be able to see it again)

2. **Add npm token to GitHub repository**:
      - Go to your GitHub repository
      - Navigate to Settings → Secrets and variables → Actions
      - Click "New repository secret"
      - Name: `NPM_TOKEN`
      - Value: Paste your npm token
      - Click "Add secret"

### Creating a Release

After completing the release setup, simply run the release command. It handles everything automatically - from versioning to publishing - even elegantly managing all packages in a monorepo with a single command.

```sh
bun run release
# or
pnpm release
```

This will:

1. Prompt you for a new version (patch, minor, or major)
2. Update package.json version
3. Create a Git tag
4. Push changes and tag to GitHub

The GitHub Actions workflow will automatically:

1. Build the package
2. Generate a GitHub release with beautiful, comprehensive release notes (changelog) based on your commit history
3. Publish to npm with provenance

Happy coding!
