type ColorCode = string;
type FormatType = 'ESM' | 'CJS' | 'IIFE' | 'DTS' | string;

interface LogColors {
    cli: ColorCode;
    info: ColorCode;
    warn: ColorCode;
    error: ColorCode;
    progress: Record<FormatType, ColorCode>;
    default: ColorCode;
    size: ColorCode;
}

export const logger = {
    MAX_LABEL_LENGTH: 5,

    colors: {
        cli: '147', // Reduced from 183 (bright cyan) to 147 (softer cyan)
        info: '245', // Increased from 240 (dark gray) to 245 (lighter gray)
        warn: '179', // Reduced from 221 (bright yellow) to 179 (softer yellow)
        error: '174', // Reduced from 203 (bright red) to 174 (softer red)
        progress: {
            ESM: '172', // Reduced from 214 (bright orange) to 172 (softer orange)
            CJS: '108', // Reduced from 114 (bright green) to 108 (softer green)
            IIFE: '146', // Reduced from 105 (bright purple) to 146 (softer purple)
            DTS: '110', // Changed from 75 (teal) to 110 (softer blue-green)
        },
        default: '252', // Reduced from 255 (bright white) to 252 (softer white)
        size: '65', // Reduced from 72 (bright green) to 65 (softer green)
    } as LogColors,

    labels: {
        cli: 'BUNUP',
        info: 'INFO',
        warn: 'WARN',
        error: 'ERROR',
    },

    formatMessage(
        colorCode: string,
        label: string,
        message: string,
        size?: string,
    ): string {
        const padding = ' '.repeat(
            Math.max(0, this.MAX_LABEL_LENGTH - label.length),
        );
        if (size) {
            const [path, ...rest] = message.split(' ');
            return `\x1b[38;5;${colorCode}m[${label}]\x1b[0m ${padding}${path} \x1b[38;5;${this.colors.size}m${size}\x1b[0m ${rest.join(' ')}`;
        }
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

    progress(label: FormatType, message: string, size?: string): void {
        const labelStr = String(label);
        let colorCode = this.colors.default;

        for (const [key, value] of Object.entries(this.colors.progress)) {
            if (labelStr.includes(key)) {
                colorCode = value;
                break;
            }
        }
        console.log(this.formatMessage(colorCode, labelStr, message, size));
    },
};

export function getLoggerProgressLabel(
    label: string,
    name: string | undefined,
): string {
    return `${name ? `${name.replace(/-/g, '_')}_` : ''}${label}`.toUpperCase();
}
