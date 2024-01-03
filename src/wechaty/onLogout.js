import { log4jsError } from '../utils/lo4js.js';
import { timedTaskTimer, messageQueueTimer } from './onReady.js';

/**
 * @method onLogout
 * @param {Contact} user
 */
const onLogout = async (user) => {
  try {
    const botPayload = user.payload;

    timedTaskTimer && clearInterval(timedTaskTimer);

    messageQueueTimer && clearInterval(messageQueueTimer);

    process.send({ type: 'onLogout', botPayload });
  } catch (error) {
    log4jsError(error);
  }
};

export default onLogout;
