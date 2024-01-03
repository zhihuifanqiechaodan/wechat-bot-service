import './env.js';

import path from 'path';
import Koa from 'koa';
import { koaBody } from 'koa-body';
import koa2Cors from 'koa2-cors';
import koaStatic from 'koa-static';
import koaHelmet from 'koa-helmet';

import errHandler from './middleware/err-handler.js';
import requestLog from './middleware/request-log.js';
import router from './router/index.js';
import { log4jsInfo, log4jsError } from './utils/lo4js.js';

import socketIoManager from './socket.io/index.js';
import { createServer } from 'http';
import log4js from 'log4js';

import wechatyManager from './wechaty/index.js';

const app = new Koa();

app
  .use(koaHelmet())
  .use(koa2Cors())
  .use(koaBody({ multipart: true }))
  .use(koaStatic(path.resolve(process.cwd(), 'src/assets')))
  .use(requestLog)
  .use(router.routes())
  .use(router.allowedMethods())
  .on('error', errHandler);

const server = createServer(app.callback());

socketIoManager.init(server);

server.listen(process.env.APP_PORT, async () => {
  try {
    wechatyManager.start({ token: process.env.WECHATY_TOKEN, puppet: process.env.WECHATY_PUPPET });
    log4jsInfo(
      `========================👉 server is running on http://localhost:${process.env.APP_PORT} 👈========================\n\n`
    );
  } catch (error) {
    log4jsError(error);
  }
});

process.on('uncaughtException', async (error) => {
  log4jsError(error);

  log4js.shutdown(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', async (error) => {
  log4jsError(error);

  log4js.shutdown(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', async () => {
  log4js.shutdown(() => {
    process.exit(0);
  });
});
