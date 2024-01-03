import { log4jsError } from '../utils/lo4js.js';
import wechatyManager from '../wechaty/index.js';

export default {
  /**
   * @method status
   * @param {*} ctx
   * @param {*} next
   */
  status: async (ctx) => {
    try {
      if (!wechatyManager.robot) {
        ctx.body = {
          code: 5003,
          msg: 'bot服务未启动',
        };
        return;
      }

      const isLoggedIn = await wechatyManager.isLoggedIn();

      if (!isLoggedIn) {
        ctx.body = {
          code: 4001,
          msg: 'bot未登录',
        };
        return;
      }

      ctx.body = { code: 2000 };
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
  /**
   * @method start
   * @param {*} ctx
   * @param {*} next
   */
  start: async (ctx) => {
    try {
      await wechatyManager.start({ puppet: process.env.WECHATY_PUPPET, token: process.env.WECHATY_TOKEN });

      ctx.body = { code: 2000 };
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
  /**
   * @method authQrcode
   * @param {*} ctx
   * @param {*} next
   */
  authQrcode: async (ctx) => {
    try {
      const qrcode = (await wechatyManager.authQrcode()) || wechatyManager.qrcode;

      ctx.body = { code: 2000, data: { qrcode } };
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
};