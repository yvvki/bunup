# Typescript Library Starter

Quickly scaffold modern TypeScript library with zero configuration. Powered by [Bunup](https://bunup.arshadyaseen.com/) - the fastest TypeScript bundler available ⚡️.

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

```bash
# Using bun
bunx create-bunup@latest

# Using npm
npx create-bunup@latest

# Using pnpm
pnpx create-bunup@latest
```

### Creating a New Project

Once you run the command, you'll be guided through an interactive process:

1. **Project Location**: Enter the directory name for your new project (or use `.` for current directory)
2. **Package Manager**: Choose between `bun` (faster) or `pnpm` (more widely used)
3. **Project Type**: Select whether to create a standalone project or a monorepo
4. **Package Names**: If creating a monorepo, enter the name for your first package

That's it! The tool will:

- Create the project directory structure
- Generate all configuration files
- Install dependencies
- Initialize Git repository with hooks
- Format the initial code

## Project Structure

### Standalone Project

```
my-ts-lib/
├── .github/               # GitHub workflows and templates
├── .husky/                # Git hooks
├── dist/                  # Build output (generated)
├── src/                   # Source code
│   └── index.ts           # Main entry point
├── test/                  # Test files
│   └── index.test.ts      # Tests for index.ts
├── .gitignore             # Git ignore file
├── README.md              # Project README
├── CONTRIBUTING.md        # Contribution guidelines
├── biome.json             # Biome configuration
├── bunup.config.ts        # Bunup build configuration
├── commitlint.config.js   # Commit message linting rules
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Vitest test configuration
```

### Monorepo Structure

```
my-ts-lib/
├── .github/               # GitHub workflows and templates
├── .husky/                # Git hooks
├── packages/              # Packages directory
│   └── my-package/        # Package directory
│       ├── src/           # Package source code
│       ├── test/          # Package tests
│       ├── package.json   # Package-specific configuration
│       └── tsconfig.json  # Package-specific TypeScript config
├── .gitignore             # Git ignore file
├── README.md              # Project README
├── CONTRIBUTING.md        # Contribution guidelines
├── biome.json             # Biome configuration
├── bunup.config.ts        # Bunup build configuration
├── commitlint.config.js   # Commit message linting rules
├── package.json           # Root package.json with workspaces
├── pnpm-workspace.yaml    # PNPM workspace config (if using pnpm)
├── tsconfig.json          # Base TypeScript configuration
└── vitest.config.ts       # Vitest test configuration
```

## Development Workflow

After creating your project, here's how to use it:

### Common Commands

```bash
# Start development with watch mode
bun run dev
# or
pnpm dev

# Run tests
bun run test
# or
pnpm test

# Lint code
bun run lint
# or
pnpm lint

# Format code
bun run format:fix
# or
pnpm format:fix

# Type check
bun run tsc
# or
pnpm tsc

# Build for production
bun run build
# or
pnpm build
```

### Committing Code

The project is set up with [Conventional Commits](https://www.conventionalcommits.org/) for standardized commit messages:

```bash
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

```bash
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
2. Generate a GitHub release
3. Publish to npm with provenance

Happy coding!
