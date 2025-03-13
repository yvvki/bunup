export function logInfo(message: string) {
    console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
}

export function logWarn(message: string) {
    console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`);
}

export function logError(message: string) {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`);
}
