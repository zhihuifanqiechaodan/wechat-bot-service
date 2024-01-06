import koaRouter from 'koa-router';

import botControllers from '../controllers/bot.js';

const router = new koaRouter({ prefix: '/bot' });

router
  .get('/authQrcode', botControllers.authQrcode)
  .get('/status', botControllers.status)
  .post('/start', botControllers.start)
  .post('/say', botControllers.say);

export default router;
