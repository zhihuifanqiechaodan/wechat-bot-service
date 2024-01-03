export default (ctx) => {
  ctx.status = 500;

  ctx.body = { code: 50000, message: '服务器错误', data: {} };
};
