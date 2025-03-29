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
      MAX_LABEL_LENGTH: 3,
      MAX_MESSAGE_LENGTH: 25,

      colors: {
            cli: '147',
            info: '245',
            warn: '179',
            error: '174',
            progress: {
                  ESM: '172',
                  CJS: '108',
                  IIFE: '146',
                  DTS: '110',
            },
            default: '252',
            size: '65',
      } as LogColors,

      labels: {
            cli: 'CLI',
            info: 'INFO',
            warn: 'WARN',
            error: 'ERROR',
      },

      formatMessage(
            colorCode: string,
            label: string,
            message: string,
            size?: string,
            identifier?: string,
      ): string {
            const padding = ' '.repeat(
                  Math.max(0, this.MAX_LABEL_LENGTH - label.length),
            );
            if (size) {
                  const [path, ...rest] = message.split(' ');
                  const messagePadding = ' '.repeat(
                        Math.max(0, this.MAX_MESSAGE_LENGTH - path.length),
                  );
                  const identifierPart = identifier
                        ? ` \x1b[48;5;${colorCode};38;5;0m ${identifier} \x1b[0m`
                        : '';
                  return `\x1b[38;5;${colorCode}m${label}\x1b[0m ${padding}${path}${messagePadding} \x1b[38;5;${this.colors.size}m${size}\x1b[0m ${rest.join(' ')}${identifierPart}`;
            }
            const identifierPart = identifier
                  ? `   \x1b[48;5;${colorCode};38;5;0m ${identifier} \x1b[0m`
                  : '';
            return `\x1b[38;5;${colorCode}m${label}\x1b[0m ${padding}${message}${identifierPart}`;
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
            console.error(
                  this.formatMessage(this.colors.error, label, message),
            );
      },

      progress(
            label: FormatType,
            message: string,
            size?: string,
            identifier?: string,
      ): void {
            const labelStr = String(label);
            let colorCode = this.colors.default;

            for (const [key, value] of Object.entries(this.colors.progress)) {
                  if (labelStr.includes(key)) {
                        colorCode = value;
                        break;
                  }
            }
            console.log(
                  this.formatMessage(
                        colorCode,
                        labelStr,
                        message,
                        size,
                        identifier,
                  ),
            );
      },
};
