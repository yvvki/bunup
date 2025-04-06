interface KnownErrorSolution {
      pattern: RegExp;
      errorType: string;
      solution: string;
}

export class BunupError extends Error {
      constructor(message: string) {
            super(message);
            this.name = 'BunupError';
      }
}

export class BunupBuildError extends BunupError {
      constructor(message: string) {
            super(message);
            this.name = 'BunupBuildError';
      }
}

export class BunupDTSBuildError extends BunupError {
      constructor(message: string) {
            super(message);
            this.name = 'BunupDTSBuildError';
      }
}

export class BunupCLIError extends BunupError {
      constructor(message: string) {
            super(message);
            this.name = 'BunupCLIError';
      }
}

export class BunupWatchError extends BunupError {
      constructor(message: string) {
            super(message);
            this.name = 'BunupWatchError';
      }
}

export const parseErrorMessage = (error: unknown): string => {
      if (error instanceof Error) {
            return error.message;
      }
      return String(error);
};

const knownErrorSolutions: KnownErrorSolution[] = [
      {
            pattern: /Could not resolve: "bun"/i,
            errorType: 'BUILD ERROR',
            solution:
                  'By default, bunup targets the node environment. To use Bun-specific features, set the target to bun:\n\n' +
                  '1. In your config file:\n' +
                  '   ```\n' +
                  "   import {defineConfig} from 'bunup';\n\n" +
                  '   export default defineConfig({\n' +
                  "     entry: ['src/index.ts'],\n" +
                  "     target: 'bun',  // Add this line\n" +
                  '   });\n' +
                  '   ```\n\n' +
                  '2. Or via CLI: `bunup src/index.ts --target bun`',
      },
      // Add more known errors and solutions here as they are identified
];

export const handleError = (error: unknown, context?: string): void => {
      const errorMessage = parseErrorMessage(error);
      const contextPrefix = context ? `[${context}] ` : '';

      let errorType = 'ERROR';
      if (error instanceof BunupBuildError) {
            errorType = 'BUILD ERROR';
      } else if (error instanceof BunupDTSBuildError) {
            errorType = 'DTS ERROR';
      } else if (error instanceof BunupCLIError) {
            errorType = 'CLI ERROR';
      } else if (error instanceof BunupWatchError) {
            errorType = 'WATCH ERROR';
      } else if (error instanceof BunupError) {
            errorType = 'BUNUP ERROR';
      }

      console.error(
            `\x1B[31m${errorType}\x1B[0m ${contextPrefix}${errorMessage}`,
      );

      const knownError = knownErrorSolutions.find(
            solution =>
                  solution.pattern.test(errorMessage) &&
                  (solution.errorType === errorType || !solution.errorType),
      );

      if (knownError) {
            console.error(
                  `\n\x1B[33mSolution:\x1B[0m\n\n\x1B[90m${knownError.solution}\x1B[0m\n`,
            );
      } else {
            console.error(
                  `\x1B[33mThis error might be addressed in the troubleshooting section: \x1B[0m\x1B[36mhttps://bunup.arshadyaseen.com/#troubleshooting\x1B[0m`,
            );

            console.error(
                  `\x1B[33mIf not, please open an issue at: \x1B[0m\x1B[36mhttps://github.com/arshadyaseen/bunup/issues/new\x1B[0m`,
            );
      }
};

export const handleErrorAndExit = (error: unknown, context?: string): void => {
      handleError(error, context);
      process.exit(1);
};
