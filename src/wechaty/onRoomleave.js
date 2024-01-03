import common from "./common.js";

/**
 * @method onRoomleave 当机器人把群里某个用户移出群聊的时候会触发这个时间。用户主动退群是无法检测到的。
 * @param {*} room 群聊信息
 * @param {*} leaver 离开者
 */
const onRoomleave = async (room, leaver) => {
  const roomLeavePayload = room.payload;

  const contactPayload = leaver[0].payload;
};

export default onRoomleave;
