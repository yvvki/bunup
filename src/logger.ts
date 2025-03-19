type ColorCode = string;
type FormatType = 'ESM' | 'CJS' | 'IIFE' | 'DTS' | string;

interface LogColors {
    cli: ColorCode;
    info: ColorCode;
    warn: ColorCode;
    error: ColorCode;
    progress: Record<FormatType, ColorCode>;
    default: ColorCode;
}

export const logger = {
    MAX_LABEL_LENGTH: 5,

    colors: {
        cli: '183',
        info: '240',
        warn: '221',
        error: '203',
        progress: {
            ESM: '214',
            CJS: '114',
            IIFE: '105',
            DTS: '75',
        },
        default: '255',
    } as LogColors,

    labels: {
        cli: 'BUNUP',
        info: 'INFO',
        warn: 'WARN',
        error: 'ERROR',
    },

    formatMessage(colorCode: string, label: string, message: string): string {
        const padding = ' '.repeat(
            Math.max(0, this.MAX_LABEL_LENGTH - label.length),
        );
        return `\x1b[38;5;${colorCode}m[${label}]\x1b[0m ${padding}${message}`;
    },

    cli(message: string): void {
        const label = this.labels.cli;
        console.log(this.formatMessage(this.colors.cli, label, message));
    },

    info(message: string): void {
        console.log(`\x1b[38;5;${this.colors.info}m${message}\x1b[0m`);
    },

    warn(message: string): void {
        const label = this.labels.warn;
        console.warn(this.formatMessage(this.colors.warn, label, message));
    },

    error(message: string): void {
        const label = this.labels.error;
        console.error(this.formatMessage(this.colors.error, label, message));
    },

    progress(label: FormatType, message: string): void {
        const labelStr = String(label);
        let colorCode = this.colors.default;

        for (const [key, value] of Object.entries(this.colors.progress)) {
            if (labelStr.includes(key)) {
                colorCode = value;
                break;
            }
        }
        console.log(this.formatMessage(colorCode, labelStr, message));
    },
};

export function getLoggerProgressLabel(
    label: string,
    name: string | undefined,
): string {
    return `${name ? `${name.replace(/-/g, '_')}_` : ''}${label}`.toUpperCase();
}
