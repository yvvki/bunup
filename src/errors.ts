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

const handleError = (error: unknown, context?: string): void => {
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
            `\x1B[31m[${errorType}]\x1B[0m ${contextPrefix}${errorMessage}`,
      );

      if (error instanceof Error && error.stack) {
            console.error(
                  '\x1B[2m' +
                        error.stack.split('\n').slice(1).join('\n') +
                        '\x1B[0m',
            );
      }
};

export const handleErrorAndExit = (error: unknown, context?: string): void => {
      handleError(error, context);
      process.exit(1);
};
