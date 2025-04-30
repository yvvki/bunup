# Typescript Library Starter

Quickly scaffold modern TypeScript library in 10 seconds. Powered by [Bunup](https://bunup.dev/) - the fastest TypeScript bundler available ⚡️.

<video src="/typescript-lib-starter-demo.mov" alt="Bunup typescript library starter demo" controls style="border-radius: 8px; border: 1px solid rgba(128, 128, 128, 0.2); box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);"></video>

## Features

- 🚀 **Zero Config**: Get started in seconds with sensible defaults
- 📦 **Modern Setup**: ESM and CJS output formats, TypeScript declarations
- 🧩 **Monorepo Support**: Create workspace-based projects with ease
- 🔧 **Complete Tooling**: Testing, linting, formatting, and CI workflows included
- 🚦 **Git Hooks**: Enforced code quality with Husky pre-commit hooks
- 📝 **Conventional Commits**: Standardized commit messages with commitlint
- 🚢 **Release Automation**: GitHub Actions for testing and publishing
- 🧹 **Modern Tooling**: Biome for linting and formatting

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

? GitHub username and repo name (username/repo): › username/my-ts-lib

? Package description: › A TypeScript library

? Select a package manager:
❯ bun - Fast all-in-one JavaScript runtime
  pnpm - Fast, disk space efficient package manager

? Set up as a monorepo? › (y/N)

# If you chose "yes" to monorepo:

? Name for first package: › my-package
```

### Step-by-Step Setup

1. **Change into the created project directory**:

   ```sh
   cd my-ts-lib
   ```

2. **Install dependencies**:

   ```sh
   bun install
   # or
   pnpm install
   ```

3. **Create a GitHub repository**:

   - Go to [GitHub](https://github.com/new)
   - Create a new repository with the same name as your project

4. **Initialize Git repository**:

   ```sh
   git init
   git add .
   git commit -m "chore: initial commit"
   git branch -M main
   git remote add origin https://github.com/username/my-ts-lib.git
   git push -u origin main
   ```

5. **Setup for Releases**:

   - Generate an npm token:

     1. Go to [npmjs.com](https://www.npmjs.com/) and sign in
     2. Navigate to your profile → Access Tokens → Generate New Token (Classic)
     3. Give it a descriptive name (e.g., "Bunup Publishing")
     4. Select "Automation" as the token type
     5. Click "Generate Token" and copy it immediately

   - Add npm token to GitHub repository:
     1. Go to your GitHub repository
     2. Navigate to Settings → Secrets and variables → Actions
     3. Click "New repository secret"
     4. Name: `NPM_TOKEN`
     5. Value: Paste your npm token
     6. Click "Add secret"

## Development Workflow

After completing the setup, here's how to use your project:

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

The project uses [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages:

```sh
# Example commit messages:
git commit -m "feat: add user authentication"
git commit -m "fix: resolve issue with data loading"
git commit -m "docs: update API documentation"
git commit -m "chore: update dependencies"
```

Pre-commit hooks will run automatically to check your code quality before each commit. The hooks run type checking, linting, and formatting validation.

## CI/CD Workflows

The project comes with three GitHub Actions workflows:

1. **CI**: Runs on pull requests and pushes to main, validating types, linting, and tests
2. **Release**: Triggered by tags, builds and publishes the package to npm with provenance
3. **Issue Management**: Automatically marks issues as stale after 30 days of inactivity

## 🚀 Releasing Your Package

When you're ready to release your package, simply run:

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
2. Generate a GitHub release with changelog
3. Publish to npm with provenance

Happy coding!
