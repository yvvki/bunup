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

interface KnownErrorSolution {
      pattern: RegExp;
      errorType: string;
      link?: string;
}

const KNOWN_ERRORS: KnownErrorSolution[] = [
      {
            pattern: /Could not resolve: "bun"/i,
            errorType: 'BUILD ERROR',
            link: 'https://bunup.arshadyaseen.com/#could-not-resolve-bun-error',
      },
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

      const knownError = KNOWN_ERRORS.find(
            error =>
                  error.pattern.test(errorMessage) &&
                  (error.errorType === errorType || !error.errorType),
      );

      if (knownError) {
            console.error(
                  `\n\x1B[33mA solution for this error is available at: \x1B[36m${knownError.link}\x1B[0m\n`,
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
