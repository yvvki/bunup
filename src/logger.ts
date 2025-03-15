type ColorCode = string;
type FormatType = 'ESM' | 'CJS' | 'DTS' | string;

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
        const label = this.labels.info;
        console.log(this.formatMessage(this.colors.info, label, message));
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
        const colorCode =
            this.colors.progress[label as keyof typeof this.colors.progress] ||
            this.colors.default;
        console.log(this.formatMessage(colorCode, labelStr, message));
    },
};
