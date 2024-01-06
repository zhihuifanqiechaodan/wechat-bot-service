import { types } from 'wechaty';
import { botPayload } from './onLogin.js';
import { log4jsError } from '../utils/lo4js.js';
import { DelayQueueExecutor } from 'rx-queue';
import dayjs from 'dayjs';
import bot from './bot.js';
import common from './common.js';

const delay = new DelayQueueExecutor(2 * 1000);

/**
 * @method onMessage
 * @param {Object} message
 */
const onMessage = async (message) => {
  try {
    if (message.payload?.type === 0) return;

    const isSelf = message.self();

    const talker = message.talker();

    const room = message.room();

    const contact = room ? room : isSelf ? await bot.Contact.find({ id: message.payload?.listenerId }) : talker;

    const age = message.age();

    const isMentionSelf = await message.mentionSelf();

    const messageTimestamp = dayjs().valueOf() - age * 1000;

    const messageContent = await messageProcessing(message);

    keywordIdentify({ room, contact, text: messageContent });

    delay.execute(async () => {
      try {
        const messageInfo = {
          botId: botPayload.id,
          talkerId: message.payload?.talkerId,
          talkerName: talker.payload?.name,
          talkerAvatar: talker.payload?.avatar,
          messageId: message.payload?.id,
          messageType: message.payload?.type,
          messageContent,
          messageTimestamp,
          contactId: contact.payload?.id,
          contactName: contact.payload?.alias || contact.payload?.name || contact.payload?.topic,
          contactAvatar: contact.payload?.avatar,
          contactType: room ? 1 : 0,
        };

        process.send({
          type: 'onMessage',
          messageInfo,
        });
      } catch (error) {
        log4jsError(error);
      }
    });
  } catch (error) {
    log4jsError(error);
  }
};

/**
 * @method messageProcessing
 * @param {Object} message
 */
const messageProcessing = async (message) => {
  try {
    return new Promise(async (resolve) => {
      const contentType = message.type();

      let text;

      switch (contentType) {
        case types.Message.Unknown:
          text = '[未知消息，请在手机上查看]';

          break;
        case types.Message.Attachment: {
          text = '[文件消息，请在手机上查看]';

          break;
        }
        case types.Message.Audio:
          text = '[语音消息，请在手机上查看]';

          break;
        case types.Message.Contact: {
          text = '[名片消息，请在手机上查看]';

          break;
        }
        case types.Message.ChatHistory:
          text = '[聊天记录，请在手机上查看]';

          break;
        case types.Message.Emoticon: {
          const fileBox = await message.toFileBox();

          // 处理兼容 wechaty-puppet-wechat4u 协议中携带多余的字段
          text = fileBox.remoteUrl.replace(/amp;/g, '');

          break;
        }
        case types.Message.Image: {
          const supportPuppetList = ['wechaty-puppet-service'];

          const fileBox = await message.toFileBox();

          const suffix = fileBox._mediaType.split('/')[1];

          const stream = await fileBox.toStream();

          if (supportPuppetList.includes(process.env.WECHATY_PUPPET)) {
            text = fileBox.remoteUrl;
          } else {
            text = '[图片消息，请在手机上查看]';
            // if (userConfig.ossType === 0) {
            //   text = '[图片消息，请在手机上查看]';
            // } else {
            //   switch (userConfig.ossType) {
            //     case 1:
            //       text = await qiniuOssUploadFile({
            //         readableStream: stream,
            //         suffix,
            //         defaultText: '[图片消息，请在手机上查看]',
            //       });

            //       break;

            //     default:
            //       break;
            //   }
            // }
          }

          break;
        }
        case types.Message.Text:
          text = message.text().replace(/\s+/g, '');

          break;
        case types.Message.Location:
          text = '[位置信息，请在手机上查看]';

          break;
        case types.Message.MiniProgram: {
          const miniProgram = await message.toMiniProgram();

          text = JSON.stringify(miniProgram.payload);
          break;
        }
        case types.Message.GroupNote:
          text = '[群聊邀请，请在手机上查看]';

          break;
        case types.Message.Transfer:
          text = '[转账信息，请在手机上查看]';

          break;
        case types.Message.RedEnvelope:
          text = '[红包信息，请在手机上查看]';

          break;
        case types.Message.Recalled:
          text = '[服务通知，请在手机上查看]';

          break;
        case types.Message.Url: {
          const url = await message.toUrlLink();

          // 处理兼容 wechaty-puppet-wechat4u 协议中携带多余的字段
          url.payload.url = url.payload.url.replace(/amp;/g, '');

          text = JSON.stringify(url.payload);

          break;
        }
        case types.Message.Video: {
          text = '[视频消息，请在手机上查看]';
          break;
        }
        case types.Message.Post:
          text = '[Post信息，请在手机上查看]';

          break;
        default:
          text = message.text();

          break;
      }
      resolve(text);
    });
  } catch (error) {
    log4jsError(error);
  }
};

/**
 * @method keywordIdentify
 * @param {Object} room
 * @param {Object} contact
 * @param {String} text
 */
const keywordIdentify = async ({ room, contact, text }) => {
  const sender = room || contact;

  const downPayment = 197245.0;

  const repayMonthPrice = 3859.05;

  const repayMonthAmount = dayjs().diff(dayjs('2018-04-05'), 'month');

  const repayMonthAmountPrice = (repayMonthAmount * repayMonthPrice).toFixed(2);

  const totalPrice = (downPayment + Number(repayMonthAmountPrice)).toFixed(2);

  if (text === '房贷') {
    const text = `住房贷款信息：\n内蒙古包头市悠活小镇2栋2401\n房屋总价：627245.00\n贷款利率：5.39%\n提款日期：2018-03-03\n首次还贷：2018-04-05\n到期日期：2031-02-21\n每月还款：${repayMonthPrice}\n房屋首付：${downPayment}\n累计还贷：${repayMonthAmountPrice}\n累计支出：${totalPrice}`;

    common.say({
      messageType: 7,
      sender,
      messageInfo: {
        text,
      },
    });
  }
};

export default onMessage;
