import { types } from 'wechaty';
import { log4jsError } from '../utils/lo4js.js';

/**
 * @method onFriendship 当有人给机器人发好友请求的时候会触发这个事件。
 * @param {*} friendship
 */
const onFriendship = async (friendship) => {
  try {
    const hello = friendship.hello();

    const contact = friendship.contact();

    const { keywordList = [], greetingContent = '' } = {};

    switch (friendship.type()) {
      case types.Friendship.Confirm:
        greetingContent && contact.say(greetingContent);
        break;
      case types.Friendship.Receive:
        for (let i = 0; i < keywordList.length; i++) {
          const keyword = keywordList[i];
          if (hello.indexOf(keyword) !== -1) {
            await friendship.accept();

            greetingContent && contact.say(greetingContent);
            break;
          }
        }

        break;

      default:
        break;
    }
  } catch (error) {
    log4jsError(error);
  }
};
export default onFriendship;
