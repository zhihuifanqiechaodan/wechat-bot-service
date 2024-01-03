/**
 * @method onRoomJoin 当有人进入微信群的时候会触发这个事件。机器人主动进入某个微信群，那个样会触发这个事件。
 * @param {*} room 群聊
 * @param {*} inviteeList 进群人员
 * @param {*} inviter 邀请人
 */
const onRoomJoin = async (room, inviteeList, inviter) => {
  const { botPayload } = {};

  const currentBotRooms = [];

  const roomPayload = room.payload;

  const curremtRoomInfo = currentBotRooms.find(
    (currentBotRoomsItem) => currentBotRoomsItem.id === roomPayload.id
  );
};

export default onRoomJoin;
