import { types } from 'wechaty';
import { botPayload } from './onLogin.js';
import { log4jsError } from '../utils/lo4js.js';
import { DelayQueueExecutor } from 'rx-queue';
import dayjs from 'dayjs';
import bot from './bot.js';
import { pick as _pick } from 'lodash-es';
import qiniuOssUploadFile from '../utils/qiniuOss.js';

const delay = new DelayQueueExecutor(2 * 1000);

/**
 * @method onMessage 当机器人收到消息的时候会触发这个事件。
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

    const messageTimestamp = dayjs().valueOf() - age * 1000;

    const messageContent = await messageProcessing(message);

    delay.execute(async () => {
      try {
        const messageInfo = {
          userId: process.env.USER_ID,
          wechatyId: process.env.WECHATY_ID,
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
      const userConfig = {};

      const contentType = message.type();

      let text;

      switch (userConfig.ossType) {
        case 1:
          process.env.QINIUYUN_OSS_ACCESSKEY = userConfig.qiniuyunOssAccesskey;

          process.env.QINIUYUN_OSS_SECRETKEY = userConfig.qiniuyunOssSecretkey;

          process.env.QINIUYUN_OSS_BUCKET = userConfig.qiniuyunOssBucket;

          process.env.QINIUYUN_OSS_CUSTOM_DOMAIN = userConfig.qiniuyunOssCustomDomain;

          break;

        default:
          break;
      }

      switch (contentType) {
        case types.Message.Unknown:
          text = '[未知消息，请在手机上查看]';

          break;
        case types.Message.Attachment: {
          const supportPuppetList = ['wechaty-puppet-service'];

          const fileBox = await message.toFileBox();

          const propsToCompare = ['_mediaType', '_name', 'remoteUrl'];

          const messageInfo = _pick(fileBox, propsToCompare);

          const suffix = messageInfo._mediaType.split('/')[1];

          const stream = await fileBox.toStream();

          if (supportPuppetList.includes(process.env.WECHATY_PUPPET)) {
            text = JSON.stringify(messageInfo);
          } else {
            if (userConfig.ossType === 0) {
              text = '[文件消息，请在手机上查看]';
            } else {
              switch (userConfig.ossType) {
                case 1:
                  messageInfo.remoteUrl = await qiniuOssUploadFile({
                    readableStream: stream,
                    suffix,
                    defaultText: '[文件消息，请在手机上查看]',
                  });

                  text = JSON.stringify(messageInfo);

                  break;

                default:
                  break;
              }
            }
          }

          break;
        }
        case types.Message.Audio:
          text = '[语音消息，请在手机上查看]';

          break;
        case types.Message.Contact: {
          const supportPuppetList = ['wechaty-puppet-service'];

          if (supportPuppetList.includes(process.env.WECHATY_PUPPET)) {
            const contact = await message.toContact();

            const propsToCompare = ['avatar', 'name', 'id'];

            const contactInfo = _pick(contact.payload, propsToCompare);

            text = JSON.stringify(contactInfo);
          } else {
            text = '[名片消息，请在手机上查看]';
          }

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
            if (userConfig.ossType === 0) {
              text = '[图片消息，请在手机上查看]';
            } else {
              switch (userConfig.ossType) {
                case 1:
                  text = await qiniuOssUploadFile({
                    readableStream: stream,
                    suffix,
                    defaultText: '[图片消息，请在手机上查看]',
                  });

                  break;

                default:
                  break;
              }
            }
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
          const supportPuppetList = ['wechaty-puppet-service'];

          const fileBox = await message.toFileBox();

          const suffix = fileBox._mediaType.split('/')[1];

          const stream = await fileBox.toStream();

          if (supportPuppetList.includes(process.env.WECHATY_PUPPET)) {
            text = fileBox.remoteUrl;
          } else {
            if (userConfig.ossType === 0) {
              text = '[视频消息，请在手机上查看]';
            } else {
              switch (userConfig.ossType) {
                case 1:
                  text = await qiniuOssUploadFile({
                    readableStream: stream,
                    suffix,
                    defaultText: '[视频消息，请在手机上查看]',
                  });

                  break;

                default:
                  break;
              }
            }
          }
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
export default onMessage;
