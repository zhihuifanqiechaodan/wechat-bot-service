import { WechatyBuilder } from 'wechaty';
import onScan from './onScan.js';
import onLogin from './onLogin.js';
import onReady from './onReady.js';
import onMessage from './onMessage.js';
import onRoomJoin from './onRoomJoin.js';
import onRoomInvite from './onRoomInvite.js';
import onRoomTopic from './onRoomTopic.js';
import onRoomleave from './onRoomleave.js';
import onFriendship from './onFriendship.js';
import onHeartbeat from './onHeartbeat.js';
import onLogout from './onLogout.js';
import { log4jsError } from '../utils/lo4js.js';
import { FileBox } from 'file-box';

const bot = WechatyBuilder.build({
  puppet: process.env.WECHATY_PUPPET,
  puppetOptions: { token: process.env.WECHATY_TOKEN },
  name: process.env.WECHATY_PUPPET, // 增加该字段可以缓存登录信息，但如果更换登录的微信需要删除生成的用户信息文件
});

/**
 * @method start
 */
const start = () => {
  bot
    .on('scan', onScan)
    .on('login', onLogin)
    .on('ready', onReady)
    .on('message', onMessage)
    .on('room-invite', onRoomInvite)
    .on('room-join', onRoomJoin)
    .on('room-topic', onRoomTopic)
    .on('room-leave', onRoomleave)
    .on('friendship', onFriendship)
    .on('heartbeat', onHeartbeat)
    .on('logout', onLogout)
    .on('error', (error) => {
      log4jsError(error);
      // wechaty-puppet-wechat4u
      //  logout error name: AssertionError, message: '1101 == 0'
      if (error.details.indexOf('1101 == 0') !== -1) {
        process.send({ type: 'stopProcess' });
      }
    })
    .start()
    .then(() => {
      process.send({ type: 'start' });
    })
    .catch(async (error) => {
      log4jsError(error);
      process.send({ type: 'stopProcess' });
    });
};

/**
 * @method stop
 */
const stop = async () => {
  process.exit();
};

/**
 * @method logout
 */
const logout = async () => {
  await bot.logout();

  process.send({ type: 'logout' });
};

/**
 * @method isLoggedIn
 */
const isLoggedIn = async () => {
  const isLoggedIn = bot.isLoggedIn;

  process.send({ type: 'isLoggedIn', isLoggedIn });
};

/**
 * @method authQrcode
 */
const authQrcode = async () => {
  const qrcode = bot.authQrCode;

  process.send({ type: 'authQrcode', qrcode });
};

/**
 * @method findAllRoom
 */
const findAllRoom = async () => {
  const roomList = await bot.Room.findAll();

  process.send({ type: 'findAllRoom', roomList });
};

/**
 * @method findAllContact
 */
const findAllContact = async () => {
  const contactList = await bot.Contact.findAll();

  process.send({ type: 'findAllContact', contactList });
};

/**
 * @method say
 * @param {Object} options
 */
const say = async ({
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
}) => {
  const sender = contactType ? await bot.Room.find({ id: contactId }) : await bot.Contact.find({ id: contactId });

  let content;

  switch (Number(messageType)) {
    case 1:
      content = FileBox.fromUrl(fileUrl);

      break;

    case 3:
      content = await bot.Contact.find({ id: businessCardId });

      break;
    case 6:
      content = FileBox.fromUrl(fileUrl);

      break;
    case 7:
      content = messageContent;

      break;
    case 9:
      content = new bot.MiniProgram({
        appid,
        title,
        pagePath,
        description,
        thumbUrl,
        thumbKey,
      });

      break;
    case 14:
      content = new bot.UrlLink({
        description,
        thumbnailUrl,
        title,
        url,
      });

      break;
    default:
      break;
  }

  sender
    .say(content)
    .then(() => {
      process.send({ type: 'say', sayStatus: true });
    })
    .catch((error) => {
      process.send({ type: 'say', sayStatus: false });

      log4jsError(error);
    });
};

process.on('message', ({ type, params }) => {
  const method = {
    start,
    stop,
    logout,
    isLoggedIn,
    findAllRoom,
    findAllContact,
    say,
    authQrcode,
  };
  method[type](params);
});

process.on('uncaughtException', async (error) => {
  log4jsError(error);
});

process.on('unhandledRejection', async (error) => {
  log4jsError(error);

  // wechaty-puppet-wechat4u
  //  logout error name: AssertionError, message: '1101 == 0'
  if (error.details.indexOf('1101 == 0') !== -1) {
    process.send({ type: 'stopProcess' });
  }
});

export default bot;
