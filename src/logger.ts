type ColorCode = string;
type FormatType = 'ESM' | 'CJS' | 'IIFE' | 'DTS' | string;

interface LogOptions {
      muted?: boolean;
      verticalSpace?: boolean;
      identifier?: string;
}

interface ProgressOptions extends LogOptions {
      size?: string;
}

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

      formatMessage({
            colorCode,
            label,
            message,
            size,
            identifier,
            muted,
      }: {
            colorCode: string;
            label: string;
            message: string;
            size?: string;
            identifier?: string;
            muted?: boolean;
      }): string {
            const padding = ' '.repeat(
                  Math.max(0, this.MAX_LABEL_LENGTH - label.length),
            );

            const formattedMessage = muted
                  ? `\x1b[38;5;${this.colors.info}m${message}\x1b[0m`
                  : message;

            if (size) {
                  const [path, ...rest] = formattedMessage.split(' ');
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

            return `\x1b[38;5;${colorCode}m${label}\x1b[0m ${padding}${formattedMessage}${identifierPart}`;
      },

      output(
            message: string,
            options: LogOptions = {},
            logFn = console.log,
      ): void {
            if (options.verticalSpace) console.log('');
            logFn(message);
            if (options.verticalSpace) console.log('');
      },

      cli(message: string, options: LogOptions = {}): void {
            const formattedMessage = this.formatMessage({
                  colorCode: this.colors.cli,
                  label: this.labels.cli,
                  message,
                  identifier: options.identifier,
                  muted: options.muted,
            });
            this.output(formattedMessage, options);
      },

      info(message: string, options: LogOptions = {}): void {
            const formattedMessage = this.formatMessage({
                  colorCode: this.colors.info,
                  label: this.labels.info,
                  message,
                  identifier: options.identifier,
                  muted: options.muted,
            });
            this.output(formattedMessage, options);
      },

      warn(message: string, options: LogOptions = {}): void {
            const formattedMessage = this.formatMessage({
                  colorCode: this.colors.warn,
                  label: this.labels.warn,
                  message,
                  identifier: options.identifier,
                  muted: options.muted,
            });
            this.output(formattedMessage, options, console.warn);
      },

      error(message: string, options: LogOptions = {}): void {
            const formattedMessage = this.formatMessage({
                  colorCode: this.colors.error,
                  label: this.labels.error,
                  message,
                  identifier: options.identifier,
                  muted: options.muted,
            });
            this.output(formattedMessage, options, console.error);
      },

      progress(
            label: FormatType,
            message: string,
            sizeOrOptions?: string | ProgressOptions,
            identifier?: string,
      ): void {
            const labelStr = String(label);
            let colorCode = this.colors.default;
            let size: string | undefined;
            let actualIdentifier: string | undefined;
            let options: LogOptions = {};

            if (typeof sizeOrOptions === 'string') {
                  size = sizeOrOptions;
                  actualIdentifier = identifier;
            } else if (sizeOrOptions) {
                  size = sizeOrOptions.size;
                  actualIdentifier = sizeOrOptions.identifier;
                  options = sizeOrOptions;
            }

            for (const [key, value] of Object.entries(this.colors.progress)) {
                  if (labelStr.includes(key)) {
                        colorCode = value;
                        break;
                  }
            }

            const formattedMessage = this.formatMessage({
                  colorCode,
                  label: labelStr,
                  message,
                  size,
                  identifier: actualIdentifier,
                  muted: options.muted,
            });

            this.output(formattedMessage, options);
      },
};
