import { fork } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import socketIoManager from '../socket.io/index.js';
import { log4jsError } from '../utils/lo4js.js';

class WechatyManager {
  constructor() {
    if (WechatyManager.instance) return WechatyManager.instance;

    WechatyManager.instance = this;

    this.robot = null;

    this.qrcode = '';
  }

  /**
   * @method validateToken
   * @param {*} options
   * @param {*} options.puppet
   * @param {*} options.token
   * @returns
   */
  validateToken({ puppet, token }) {
    return new Promise((resolve) => {
      const child = fork(join(dirname(fileURLToPath(import.meta.url)), './bot.js'), [], {
        env: {
          WECHATY_PUPPET: puppet,
          WECHATY_TOKEN: token,
          ...process.env,
        },
      });

      child.send({ type: 'start' });

      child.on('message', async (message) => {
        const { type } = message;

        if (type === 'start') {
          child.kill();

          resolve(true);
        }
        if (type === 'startFail') {
          child.kill();

          resolve(false);
        }
      });
    });
  }

  /**
   * @method start
   * @param {Object} options
   * @param {String} options.puppet
   * @param {String} options.token
   * @returns
   */
  async start({ puppet, token }) {
    return new Promise((resolve) => {
      if (this.robot) {
        this.robot.kill();

        this.robot = null;
      }

      const child = fork(join(dirname(fileURLToPath(import.meta.url)), './bot.js'), [], {
        env: {
          WECHATY_PUPPET: puppet,
          WECHATY_TOKEN: token,
          ...process.env,
        },
      });

      child.send({ type: 'start' });

      child.on('message', async (data) => {
        try {
          const { type, qrcode, botPayload, messageInfo } = data;

          if (botPayload) {
            botPayload.puppet = process.env.WECHATY_PUPPET;
          }

          if (type === 'start') {
            this.robot = child;

            child.on('exit', async () => {
              try {
                if (this.robot) {
                  this.robot = null;
                  socketIoManager.emit('exit');
                }
              } catch (error) {
                log4jsError(error);
              }
            });

            resolve(true);
          }

          if (type === 'startFail') {
            child.kill();

            resolve(false);
          }

          if (type === 'qrcode') {
            this.qrcode = qrcode;

            socketIoManager.emit('qrcode', { qrcode });
          }

          if (type === 'onLogin') {
            socketIoManager.emit('onLogin', { botPayload });
          }

          if (type === 'onLogout') {
            socketIoManager.emit('onLogout', { botPayload });
          }

          if (type === 'onMessage') {
            socketIoManager.emit('onMessage', { messageInfo });
          }

          if (type === 'stopProcess') {
            child.kill();
            socketIoManager.emit('stopProcess');
          }
        } catch (error) {
          log4jsError(error);
        }
      });
    });
  }

  /**
   * @method stop
   * @returns
   */
  async stop() {
    return new Promise(async (resolve) => {
      const child = this.robot;

      child.kill();

      this.robot = null;

      socketIoManager.emit('exit');

      resolve();
    });
  }

  /**
   * @method logout
   * @returns
   */
  async logout() {
    return new Promise((resolve) => {
      const child = this.robot;

      child.send({ type: 'logout' });

      child.on('message', async (message) => {
        const { type } = message;

        if (type === 'onLogout') {
          resolve();
        }
      });
    });
  }

  /**
   * @method isLoggedIn
   * @returns
   */
  async isLoggedIn() {
    return new Promise((resolve) => {
      const child = this.robot;

      child.send({ type: 'isLoggedIn' });

      child.on('message', (message) => {
        const { type, isLoggedIn } = message;

        type === 'isLoggedIn' && resolve(isLoggedIn);
      });
    });
  }

  /**
   * @method authQrcode
   * @returns
   */
  async authQrcode() {
    return new Promise((resolve) => {
      const child = this.robot;

      child.send({ type: 'authQrcode' });

      child.on('message', (message) => {
        const { type, qrcode } = message;

        type === 'authQrcode' && resolve(qrcode);
      });
    });
  }

  /**
   * @method findAllRoom
   * @returns
   */
  async findAllRoom() {
    return new Promise((resolve) => {
      const child = this.robot;

      child.send({ type: 'findAllRoom' });

      child.on('message', (message) => {
        const { type, roomList } = message;

        type === 'findAllRoom' && resolve(roomList);
      });
    });
  }

  /**
   * @method findAllContact
   * @returns
   */
  async findAllContact() {
    return new Promise((resolve) => {
      const child = this.robot;

      child.send({ type: 'findAllContact' });

      child.on('message', (message) => {
        const { type, contactList } = message;

        type === 'findAllContact' && resolve(contactList);
      });
    });
  }

  async say({
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
  }) {
    return new Promise((resolve) => {
      const child = this.robot;

      child.send({
        type: 'say',
        params: {
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
        },
      });

      child.on('message', (message) => {
        const { type, sayStatus } = message;

        type === 'say' && resolve(sayStatus);
      });
    });
  }
}

export default new WechatyManager();
