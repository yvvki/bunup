# Contributing to Bunup

Thank you for your interest in contributing to Bunup! This document provides guidelines and instructions to help you contribute effectively.

## Prerequisites

Before you begin, make sure you have:

- [Bun](https://bun.sh/docs/installation) installed (required to run Bunup)
- [pnpm](https://pnpm.io/installation) installed (Bunup uses pnpm as its package manager)
- Node.js (LTS version recommended)

## Getting Started

1. **Fork the repository**

      Start by forking the [Bunup repository](https://github.com/arshad-yaseen/bunup).

2. **Clone your fork**

      ```bash
      git clone https://github.com/arshad-yaseen/bunup.git
      cd bunup
      ```

3. **Install dependencies**

      ```bash
      pnpm install
      ```

4. **Set up the development environment**

      Bunup uses itself to build itself! The development setup is already configured in the `bunup.config.ts` file.

## Development Workflow

### Running in Development Mode

To start the development server with watch mode:

```bash
pnpm dev
```

### Building the Project

To build the project:

```bash
pnpm build
```

### Testing

Run tests to ensure your changes don't break existing functionality:

```bash
pnpm test
```

To test your changes with a real build:

1. First, build bunup with your changes:

      ```bash
      pnpm build
      ```

2. Then run the test build to verify your changes work correctly:

      ```bash
      pnpm test-build
      ```

      This command builds the test project located in the `tests` directory using your local version of bunup, allowing you to verify that your changes work correctly in a real-world scenario.

To validate TypeScript types:

```bash
pnpm tsc
```

### Code Formatting and Linting

Bunup uses Biome for code quality and formatting.

To lint your code:

```bash
pnpm lint
```

To format your code:

```bash
pnpm format:fix
```

## Pull Request Process

1. **Create a new branch**

      ```bash
      git checkout -b feature/your-feature-name
      ```

2. **Make your changes**

      Implement your feature or bug fix.

3. **Commit your changes**

      Bunup uses conventional commit messages. Please follow this format:

      ```
      type(scope): description

      [optional body]

      [optional footer]
      ```

      Types include:

      - `feat`: A new feature
      - `fix`: A bug fix
      - `docs`: Documentation changes
      - `style`: Code style changes (formatting, etc.)
      - `refactor`: Code changes that neither fix bugs nor add features
      - `perf`: Performance improvements
      - `test`: Adding or updating tests
      - `chore`: Changes to the build process or auxiliary tools

4. **Push your changes**

      ```bash
      git push origin feature/your-feature-name
      ```

5. **Create a pull request**

      Open a pull request against the `main` branch of the Bunup repository.

      In your PR description:

      - Clearly describe the changes and their purpose
      - Reference any related issues
      - Include screenshots or examples if applicable

6. **Address review feedback**

      Be responsive to review comments and make necessary changes.

## Documentation

If you're adding new features or making significant changes, please update the documentation accordingly. Bunup's documentation is located in the `docs` directory.

To run the documentation site locally:

```bash
pnpm dev:docs
```

To build the documentation:

```bash
pnpm build:docs
```

## Performance Considerations

Bunup focuses on performance. When contributing:

- Consider the performance impact of your changes
- Include benchmark results for performance-related changes
- Optimize for both speed and memory usage

## Project Structure

Here's a brief overview of the project structure:

- `src/` - Source code
     - `cli.ts` - Command-line interface
     - `build.ts` - Core build functionality
     - `watch.ts` - Watch mode functionality
     - `plugins/` - Bundler plugins
     - `dts/` - TypeScript declaration file generation

## License

By contributing to Bunup, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

## Questions?

If you have any questions or need help, feel free to:

- Open an issue on GitHub
- Reach out to the maintainers:
     - Arshad Yaseen (m@arshadyaseen.com)

Thank you for contributing to make Bunup better!
