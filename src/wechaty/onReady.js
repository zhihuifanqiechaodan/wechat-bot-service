import bot from './bot.js';
import common from './common.js';
import { log4jsError } from '../utils/lo4js.js';
import dayjs from 'dayjs';

let timedTaskTimer = null;

let messageQueueTimer = null;

/**
 * @method onReady
 */
const onReady = async () => {
  try {
    timedTaskTimer && clearInterval(timedTaskTimer);

    messageQueueTimer && clearInterval(messageQueueTimer);

    setInterval(timedTask, 1000);

    setInterval(messageQueue, 1000);
  } catch (error) {
    log4jsError(error);
  }
};

/**
 * @method timedTask
 */
const timedTask = async () => {
  try {
    const { timedTasks = [] } = {};
    for (let i = 0; i < timedTasks.length; i++) {
      const { status, timestamp, sendTimeType, messageType, senderType, ids, messageInfo } = timedTasks[i];

      let isTheSameTime;

      let sender;

      switch (sendTimeType) {
        // 定时发送
        case 0:
          isTheSameTime =
            dayjs().format('YYYY-MM-DD HH:mm:ss') === dayjs(Number(timestamp)).format('YYYY-MM-DD HH:mm:ss');
          break;
        // 每天发送
        case 1:
          isTheSameTime = dayjs().format('HH:mm:ss') === dayjs(Number(timestamp)).format('HH:mm:ss');
          break;
        default:
          isTheSameTime = false;
          break;
      }

      if (status && isTheSameTime) {
        for (let j = 0; j < ids.length; j++) {
          switch (senderType) {
            // 私聊
            case 0:
              sender = await bot.Contact.find({ id: ids[j] });
              break;
            // 群聊
            case 1:
              sender = await bot.Room.find({ id: ids[j] });
              break;
            default:
              break;
          }

          if (!sender) break;

          await bot.sleep((Math.floor(Math.random() * 5) + 1) * 1000);
          common.say({
            messageType,
            sender,
            messageInfo,
          });
        }
      }
    }
  } catch (error) {
    log4jsError(error);
  }
};

/**
 * @method messageQueue
 * @returns
 */
const messageQueue = async () => {
  try {
    const { messageQueue = [] } = {};

    const messageItem = messageQueue.pop();

    if (!messageItem) return;

    const { messageType, senderType, ids, messageInfo } = messageItem;

    let sender;

    for (let j = 0; j < ids.length; j++) {
      switch (senderType) {
        // 私聊
        case 0:
          sender = await bot.Contact.find({ id: ids[j] });

          break;
        // 群聊
        case 1:
          sender = await bot.Room.find({ id: ids[j] });

          break;
        default:
          break;
      }

      if (!sender) break;

      await bot.sleep((Math.floor(Math.random() * 5) + 1) * 1000);

      common.say({
        messageType,
        sender,
        messageInfo,
      });
    }
  } catch (error) {
    log4jsError(error);
  }
};

export { timedTaskTimer, messageQueueTimer };

export default onReady;
