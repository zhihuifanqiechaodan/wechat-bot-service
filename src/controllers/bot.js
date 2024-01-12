import { defaultContactConfig } from '../config/bot.config.js';
import { log4jsError } from '../utils/lo4js.js';
import { lowdb } from '../utils/lowdb.js';
import wechatyManager from '../wechaty/index.js';
import { merge as _merge } from 'lodash-es';

export default {
  /**
   * @method status
   * @param {*} ctx
   * @param {*} next
   */
  status: async (ctx) => {
    try {
      if (!wechatyManager.robotProcess) {
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
  /**
   * @method say
   * @param {*} ctx
   */
  say: async (ctx) => {
    try {
      const { body } = ctx.request;

      const {
        contactId,
        contactType,
        messageType,
        messageContent,
        businessCardId,
        fileUrl,
        appid,
        title,
        pagePath,
        description,
        thumbUrl,
        thumbKey,
        thumbnailUrl,
        url,
      } = body;

      const sayStatus = await wechatyManager.say({
        contactId,
        contactType,
        messageType,
        messageContent,
        businessCardId,
        fileUrl,
        appid,
        title,
        pagePath,
        description,
        thumbUrl,
        thumbKey,
        thumbnailUrl,
        url,
      });

      if (sayStatus) {
        ctx.body = { code: 2000 };
      } else {
        ctx.body = { code: 4509, msg: '消息发送失败' };
      }
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError.error(`\n\n======================== 错误日志 ========================\n\n`, error, `\n\n`);
    }
  },
  /**
   * @method logout
   * @param {*} ctx
   * @param {*} next
   */
  logout: async (ctx) => {
    try {
      await wechatyManager.logout();

      ctx.body = { code: 2000 };
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
  /**
   * @method contactConfig
   * @param {*} ctx
   * @param {*} next
   */
  contactConfig: async (ctx) => {
    try {
      const { contactId } = ctx.request.query;

      const contactConfig = lowdb.data[wechatyManager.botPayload.id].contactConfig[contactId];

      if (contactConfig) {
        const newContactConfig = _merge(defaultContactConfig, contactConfig);

        lowdb.data[wechatyManager.botPayload.id].contactConfig[contactId] = newContactConfig;

        lowdb.write();

        ctx.body = { code: 2000, data: { contactConfig: newContactConfig } };
      } else {
        lowdb.data[wechatyManager.botPayload.id].contactConfig[contactId] = defaultContactConfig;

        lowdb.write();

        ctx.body = { code: 2000, data: { contactConfig: defaultContactConfig } };
      }
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
  /**
   * @method editTopic
   * @param {*} ctx
   * @param {*} next
   */
  editTopic: async (ctx) => {
    try {
      const { contactId, topic } = ctx.request.body;

      await wechatyManager.editRoomTopic({ contactId, topic });

      ctx.body = { code: 2000 };
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
  /**
   * @method info
   * @param {*} ctx
   * @param {*} next
   */
  info: async (ctx) => {
    try {
      const botPayload = wechatyManager.botPayload;

      ctx.body = { code: 2000, data: { botPayload } };
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
  /**
   * @method contactConfigUpdate
   * @param {*} ctx
   * @param {*} next
   */
  contactConfigUpdate: async (ctx) => {
    try {
      const { contactConfig, contactId } = ctx.request.body;

      lowdb.data[wechatyManager.botPayload.id].contactConfig[contactId] = contactConfig;

      await lowdb.write();

      ctx.body = { code: 2000 };
    } catch (error) {
      ctx.app.emit('error', ctx);

      log4jsError(error);
    }
  },
};
