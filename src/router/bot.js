import koaRouter from 'koa-router';

import botControllers from '../controllers/bot.js';

const router = new koaRouter({ prefix: '/bot' });

router
  .get('/status', botControllers.status)
  .get('/authQrcode', botControllers.authQrcode)
  .get('/roomConfig', botControllers.getRoomConfig)
  .get('/info', botControllers.info)
  .post('/start', botControllers.start)
  .post('/say', botControllers.say)
  .post('/logout', botControllers.logout)
  .post('/editTopic', botControllers.editTopic);

export default router;
