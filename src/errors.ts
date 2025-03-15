export const parseErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
};

export const handleError = (error: unknown, context?: string): void => {
    const errorMessage = parseErrorMessage(error);
    const contextPrefix = context ? `[${context}] ` : '';

    console.error(`\x1B[31m[ERROR]\x1B[0m ${contextPrefix}${errorMessage}`);

    if (
        process.env.NODE_ENV !== 'production' &&
        error instanceof Error &&
        error.stack
    ) {
        console.error(
            '\x1B[2m' + error.stack.split('\n').slice(1).join('\n') + '\x1B[0m',
        );
    }
};
