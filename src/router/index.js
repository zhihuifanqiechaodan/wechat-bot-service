import fs from 'fs';
import koaRouter from 'koa-router';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import koaSend from 'koa-send';

const router = new koaRouter();

const __dirname = dirname(fileURLToPath(import.meta.url));

const publicPath = process.cwd();

router.get('/', async (ctx) => {
  await koaSend(ctx, 'index.html', { root: publicPath });
});

fs.readdirSync(__dirname).forEach((file) => {
  if (file === 'index.js') return;
  import(`${__dirname}/${file}`).then((module) => {
    router.use(module.default.routes());
  });
});

export default router;
