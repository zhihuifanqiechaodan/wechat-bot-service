import koaRouter from 'koa-router';

import botControllers from '../controllers/bot.js';

const router = new koaRouter({ prefix: '/bot' });

router
  .get('/authQrcode', botControllers.authQrcode)
  .get('/status', botControllers.status)
  .post('/start', botControllers.start)
  .post('/say', botControllers.say)
  .post('/logout', botControllers.logout)
  .get('/roomConfig', botControllers.getRoomConfig)
  .post('/editTopic', botControllers.editTopic);

export default router;
