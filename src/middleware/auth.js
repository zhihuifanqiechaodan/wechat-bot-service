import jsonwebtoken from 'jsonwebtoken';
import { log4jsError } from '../utils/lo4js.js';

export default {
  /**
   * @method auth
   * @param {*} ctx
   * @param {*} next
   * @returns
   */
  auth: async (ctx, next) => {
    try {
      const { authorization = '' } = ctx.request.header;

      const token = authorization.replace('Bearer ', '');

      try {
        const userInfo = jsonwebtoken.verify(token, process.env.JWT_SECRET);

        ctx.request.body.userInfo = userInfo;
      } catch (error) {
        switch (error.name) {
          case 'TokenExpiredError':
            ctx.body = {
              code: 40101,
              msg: 'Token expired',
            };
            break;
          case 'JsonWebTokenError':
            ctx.body = {
              code: 40102,
              msg: 'Invalid token',
            };
            break;
          default:
            ctx.app.emit('error', ctx);

            log4jsError(error);

            break;
        }
      }
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);

      return;
    }

    await next();
  },
};
