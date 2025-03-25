import {BunupCLIError} from './errors';

(() => {
      if (typeof Bun === 'undefined') {
            throw new BunupCLIError(
                  'Bunup requires Bun to run.\nTo install Bun, visit https://bun.sh/docs/installation',
            );
      }
})();
