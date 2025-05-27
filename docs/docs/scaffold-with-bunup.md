# Scaffold with Bunup

Quickly scaffold modern TypeScript and React libraries in just 10 seconds with Bun. Powered by Bunup - the fastest bundler available ⚡️.

- 🚀 **Ready to Code**: Just run the command and start coding - no renaming or setup needed
- 📦 **Modern Stack**: ESM/CJS formats, TypeScript declarations, and optional monorepo support
- ⚡️ **Complete Tooling**: Bun-powered development with testing, linting, and formatting
- 🚢 **Automated Releases**: Built-in GitHub Actions for testing and publishing to npm
- 🔥 **Ultra-Fast Builds**: Instant builds that feel instantaneous

## Getting Started

You can create a new project by using:

```sh [bun]
bunx bunup@latest --new
```

That's it! You can now start coding.

## Setup for Releases

1. Generate an npm token:
   - Visit [npmjs.com](https://www.npmjs.com/), sign in
   - Go to profile → Access Tokens → Generate New Token (Classic)
   - Name it (e.g. "my-ts-lib publishing"), select "Automation"
   - Generate and copy token

2. Add token to GitHub:
   - Go to repo Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Set name as `NPM_TOKEN` and paste token value

## Development Workflow

After completing the setup, here's how to use your project:

### TypeScript Library Commands

```sh
bun run dev        # Start development mode with hot reloading
bun run test       # Run test suite
bun run lint       # Check code style and find problems
bun run lint:fix   # Fix linting issues automatically
bun run format:fix # Fix code formatting issues
bun run tsc        # Type check TypeScript code
bun run build      # Build production bundle
```

### React Library Development

React libraries have a special development workflow optimized for component development:

```sh
bun run dev        # Watch source files and rebuild library instantly
bun run dev:test   # Start Next.js preview app at http://localhost:3000
bun run lint       # Check code style and find problems
bun run lint:fix   # Fix linting issues automatically
bun run format:fix # Fix code formatting issues
bun run tsc        # Type check TypeScript code
bun run build      # Build production bundle
```

#### 🚀 Full Development Mode (React Libraries)

For the ultimate development experience with React libraries:

1. **Terminal 1**: Run `bun run dev` - Watches your source files and rebuilds the library instantly on any change
2. **Terminal 2**: Run `bun run dev:test` - Starts a Next.js preview app at http://localhost:3000

**Why This is Amazing:**
- ⚡️ **Ultra-Fast Builds**: Changes build instantly, no waiting
- 🔥 **Blazing HMR**: Instant reflection of changes in the live preview app
- 💫 **Seamless Experience**: Code, save, see - that's it!

## CI/CD Workflows

The project comes with three GitHub Actions workflows:

1. **CI**: Runs on pull requests and pushes to main, validating types, linting, and tests
2. **Release**: Triggered by tags, builds and publishes the package to npm with provenance
3. **Issue Management**: Automatically marks issues as stale after 30 days of inactivity

## Releasing Your Package

When you're ready to release your package, simply run:

```sh
bun run release
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
