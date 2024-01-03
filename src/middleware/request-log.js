import { log4jsInfo } from '../utils/lo4js.js';

export default async (ctx, next) => {
  const start = Date.now();

  await next();

  const ms = Date.now() - start;

  log4jsInfo(
    `${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms,Request Headers:${JSON.stringify(
      ctx.request.headers
    )},Response Data:${JSON.stringify(ctx.body)}`
  );
};
