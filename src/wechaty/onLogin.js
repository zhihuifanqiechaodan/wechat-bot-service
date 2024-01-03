import { log4jsError } from '../utils/lo4js.js';

export let botPayload;

/**
 * @method onLogin 成功登陆后，会触发事件，并会在事件中传递当前登陆用户信息
 * @param {Contact} user
 */
const onLogin = async (user) => {
  try {
    botPayload = user.payload;

    process.send({ type: 'onLogin', botPayload });
  } catch (error) {
    log4jsError(error);
  }
};
export default onLogin;
