/**
 * @method onRoomTopic 当有人修改群名称的时候会触发这个事件。
 * @param {*} room 群聊房间信息
 * @param {*} topic 当前群聊名称
 * @param {*} oldTopic 更改之前的群聊名称
 * @param {*} changer 更改群聊名称的操作人信息
 */
const onRoomTopic = async (room, topic, oldTopic, changer) => {
  const roomPayload = room.payload;

  const changerPayload = changer.payload;

  process.send({ type: 'onRoomTopic', editRoomTopicInfo: { roomPayload, topic, oldTopic, changerPayload } });
};

export default onRoomTopic;
