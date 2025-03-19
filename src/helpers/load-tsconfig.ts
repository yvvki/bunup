// @ts-expect-error - load-tsconfig is not typed
import {loadTsConfig as _loadTsConfig} from 'load-tsconfig';

import {parseErrorMessage} from '../errors';
import {logger} from '../logger';

export type TsConfig = {
    path?: string;
    data?: {
        compilerOptions?: Record<string, any>;
        [key: string]: any;
    };
    files?: string[];
};

export function loadTsconfig(filePath: string | undefined): TsConfig {
    try {
        const tsconfig = _loadTsConfig('.', filePath);
        return tsconfig;
    } catch (error) {
        logger.warn(`Failed to load tsconfig: ${parseErrorMessage(error)}`);
        return {
            path: filePath,
            data: {},
            files: [],
        };
    }
}
