import { log4jsError } from '../utils/lo4js.js';

/**
 * @method onRoomInvite 当收到群邀请的时候，会触发这个事件。
 * @param {*} roomInvitation
 */
const onRoomInvite = async (roomInvitation) => {
  try {
    await roomInvitation.accept();
  } catch (error) {
    log4jsError(error);
  }
};

export default onRoomInvite;
