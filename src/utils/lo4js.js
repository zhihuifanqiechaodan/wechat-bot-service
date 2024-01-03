import log4js from 'log4js';
import path from 'path';

const basePath = path.join(process.cwd(), 'src/logs');

log4js.addLayout('api', function () {
  return function (logEvent) {
    if (logEvent.level.isGreaterThanOrEqualTo(log4js.levels.ERROR)) {
      (async () => {
        // send error message
      })();
    }

    return '';
  };
});

log4js.configure({
  appenders: {
    console: { type: 'console' },
    error: {
      type: 'dateFile',
      filename: `${basePath}/errors/error`,
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %c - %m',
      },
      compress: true,
    },
    info: {
      type: 'dateFile',
      filename: `${basePath}/infos/info`,
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %c - %m',
      },
      compress: true,
    },
    // custom layout
    api: { type: 'console', layout: { type: 'api' } },
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    error: { appenders: ['error', 'api'], level: 'error' },
    info: { appenders: ['info'], level: 'info' },
  },
});

/**
 * @method log4jsInfo
 * @param {string} message
 * @returns
 */
const log4jsInfo = (message) => log4js.getLogger('info').info(message);

/**
 * @method log4jsError
 * @param {string} message
 * @returns
 */
const log4jsError = (message) => log4js.getLogger('error').error(message);

export { log4jsError, log4jsInfo };
