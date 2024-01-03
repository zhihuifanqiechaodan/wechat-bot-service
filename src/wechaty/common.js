import { DelayQueueExecutor } from 'rx-queue';
import { FileBox } from 'file-box';
import { types } from 'wechaty';
import bot from './bot.js';
import { log4jsError } from '../utils/lo4js.js';

const delay = new DelayQueueExecutor(10000);

export default {
  /**
   * @method say 机器人发送消息
   * @param {object} options
   * @param {types.Message} options.messageType
   * @param {Contact | Room} options.sender
   * @param {{ miniProgram: Sayable; urlLink: Sayable; id: string; text: string; utl: string;}} options.messageInfo
   * @param {Contact[]} options.mentionList
   */

  say: async ({ messageType, sender, messageInfo, mentionList = [] }) => {
    try {
      /**
    * messageInfo 数据结构
   *      fileUrl: string     文件消息必传 1
   *      contactCard: string      个人名片消息必传 3
   *      text: string        文本消息必传 7
   *      fromUrl: string     图片消息必传 6
   *      miniProgram: object 小程序 9
   *          appid: 'wx60090841b63b6250',
              title: '我正在使用Authing认证身份，你也来试试吧',
              pagePath: 'pages/home/home.html',
              description: '身份管家',
              thumbUrl: '30590201000452305002010002041092541302033d0af802040b30feb602045df0c2c5042b777875706c6f61645f31373533353339353230344063686174726f6f6d3131355f313537363035393538390204010400030201000400',
              thumbKey: '42f8609e62817ae45cf7d8fefb532e83',
   *      urlLink: object    卡片消息必传 14
   *          description: string     描述 
   *          thumbnailUrl: string    缩略图地址
   *          title: string           标题
   *          url: string             跳转地址
   */
      if (!messageInfo) return;

      let content;

      const { miniProgram, urlLink } = messageInfo;

      switch (messageType) {
        // 文件 1
        case types.Message.Attachment:
          content = FileBox.fromFile(messageInfo.fromFile);
          break;
        // 个人名片 3
        case types.Message.Contact:
          content = await bot.Contact.find(messageInfo.id);
          break;
        // 图片 6
        case types.Message.Image:
          content = FileBox.fromUrl(messageInfo.fromUrl);
          break;
        // 文本 7
        case types.Message.Text:
          content = messageInfo.text;
          break;
        // 小程序 9
        case types.Message.MiniProgram:
          content = new bot.MiniProgram({
            appid: miniProgram.appid,
            title: miniProgram.title,
            pagePath: miniProgram.pagePath,
            description: miniProgram.description,
            thumbUrl: miniProgram.thumbUrl,
            thumbKey: miniProgram.thumbKey,
          });
          break;
        // 链接 14
        case types.Message.Url:
          content = new bot.UrlLink({
            description: urlLink.description,
            thumbnailUrl: urlLink.thumbnailUrl,
            title: urlLink.title,
            url: urlLink.url,
          });
          break;
        default:
          break;
      }
      delay.execute(async () => {
        sender.say(content, ...mentionList).catch((error) => {
          log4jsError(error);
        });
      });
    } catch (error) {
      log4jsError(error);
    }
  },
};
