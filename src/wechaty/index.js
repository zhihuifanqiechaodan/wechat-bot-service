import { fork } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import socketIoManager from '../socket.io/index.js';
import { log4jsError } from '../utils/lo4js.js';
import { notSupportPuppets } from '../config/bot.config.js';
import dayjs from 'dayjs';
class WechatyManager {
  constructor() {
    if (WechatyManager.instance) return WechatyManager.instance;

    WechatyManager.instance = this;

    this.robotProcess = null;

    this.qrcode = '';

    this.botPayload = null;
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
          START_TIME: dayjs().valueOf(),
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
      if (this.robotProcess) {
        this.robotProcess.kill();

        this.robotProcess = null;
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
          const { type, qrcode, botPayload, messageInfo, editRoomTopicInfo } = data;

          if (botPayload) {
            botPayload.puppet = process.env.WECHATY_PUPPET;
          }

          switch (type) {
            case 'start':
              this.robotProcess = child;

              child.on('exit', async () => {
                try {
                  if (this.robotProcess) {
                    this.robotProcess = null;
                    socketIoManager.emit('exit');
                  }
                } catch (error) {
                  log4jsError(error);
                }
              });

              resolve(true);

              break;

            case 'startFail':
              child.kill();

              resolve(false);

              break;

            case 'qrcode':
              this.qrcode = qrcode;

              socketIoManager.emit('qrcode', { qrcode });

              break;

            case 'onLogin':
              this.botPayload = botPayload;

              socketIoManager.emit('onLogin', { botPayload });

              break;

            case 'onLogout':
              socketIoManager.emit('onLogout', { botPayload });

              break;

            case 'onMessage':
              socketIoManager.emit('onMessage', { messageInfo });

              break;

            case 'stopProcess':
              child.kill();

              socketIoManager.emit('stopProcess');

              break;

            case 'onRoomTopic':
              socketIoManager.emit('onRoomTopic', { editRoomTopicInfo });

              break;

            default:
              break;
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
      const child = this.robotProcess;

      child.kill();

      this.robotProcess = null;

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
      const child = this.robotProcess;

      child.send({ type: 'logout' });

      child.on('message', async (message) => {
        const { type } = message;

        if (type === 'logout') {
          if (notSupportPuppets.includes(process.env.WECHATY_PUPPET)) {
            child.kill();
          }
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
      const child = this.robotProcess;

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
      const child = this.robotProcess;

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
      const child = this.robotProcess;

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
      const child = this.robotProcess;

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
      const child = this.robotProcess;

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

  /**
   * @method editRoomTopic
   * @param {Object} options
   * @param {String} options.topic
   * @param {String} options.contactId
   */
  async editRoomTopic({ topic, contactId }) {
    return new Promise((resolve) => {
      this.robotProcess.send({ type: 'editRoomTopic', params: { topic, contactId } });

      this.robotProcess.on('message', (message) => {
        const { type } = message;

        type === 'editRoomTopic' && resolve();
      });
    });
  }
}

export default new WechatyManager();
