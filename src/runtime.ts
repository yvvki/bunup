import {logger} from './logger';

(() => {
    if (typeof Bun === 'undefined') {
        logger.error(
            'Bunup requires Bun to run.\nTo install Bun, visit https://bun.sh/docs/installation',
        );
        process.exit(1);
    }
})();
