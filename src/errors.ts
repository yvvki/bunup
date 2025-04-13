import { logger } from "./logger";

export class BunupError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BunupError";
    }
}

export class BunupBuildError extends BunupError {
    constructor(message: string) {
        super(message);
        this.name = "BunupBuildError";
    }
}

export class BunupDTSBuildError extends BunupError {
    constructor(message: string) {
        super(message);
        this.name = "BunupDTSBuildError";
    }
}

export class BunupCLIError extends BunupError {
    constructor(message: string) {
        super(message);
        this.name = "BunupCLIError";
    }
}

export class BunupWatchError extends BunupError {
    constructor(message: string) {
        super(message);
        this.name = "BunupWatchError";
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
    logSolution: (errorMessage: string) => void;
}

const KNOWN_ERRORS: KnownErrorSolution[] = [
    {
        pattern: /Could not resolve: "bun"/i,
        errorType: "BUILD ERROR",
        logSolution: () => {
            logger.error(
                "\x1B[0mYou're trying to build a project that uses Bun. " +
                    "Please set the target option to \x1B[36m`bun`\x1B[0m.\n" +
                    "Example: \x1B[32m`bunup --target bun`\x1B[0m or in config: \x1B[32m{ target: 'bun' }\x1B[0m",
            );
        },
    },
];

export const handleError = (error: unknown, context?: string): void => {
    const errorMessage = parseErrorMessage(error);
    const contextPrefix = context ? `[${context}] ` : "";

    let errorType = "ERROR";
    if (error instanceof BunupBuildError) {
        errorType = "BUILD ERROR";
    } else if (error instanceof BunupDTSBuildError) {
        errorType = "DTS ERROR";
    } else if (error instanceof BunupCLIError) {
        errorType = "CLI ERROR";
    } else if (error instanceof BunupWatchError) {
        errorType = "WATCH ERROR";
    } else if (error instanceof BunupError) {
        errorType = "BUNUP ERROR";
    }

    const knownError = KNOWN_ERRORS.find(
        (error) =>
            error.pattern.test(errorMessage) &&
            (error.errorType === errorType || !error.errorType),
    );

    if (!knownError) {
        console.error(
            `\x1B[31m${errorType}\x1B[0m ${contextPrefix}${errorMessage}`,
        );
    }

    if (knownError) {
        console.log("\n");
        knownError.logSolution(errorMessage);
        console.log("\n");
    } else {
        console.error(
            "\x1B[90mIf you think this is a bug, please open an issue at: \x1B[36mhttps://github.com/arshadyaseen/bunup/issues/new\x1B[0m",
        );
    }
};

export const handleErrorAndExit = (error: unknown, context?: string): void => {
    handleError(error, context);
    process.exit(1);
};
