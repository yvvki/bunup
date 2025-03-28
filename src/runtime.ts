import {BUN_INSTALLATION_URL} from './constants';
import {BunupCLIError} from './errors';

(() => {
      if (typeof Bun === 'undefined') {
            throw new BunupCLIError(
                  'Bunup requires Bun to run.\nTo install Bun, visit ' +
                        BUN_INSTALLATION_URL,
            );
      }
})();
