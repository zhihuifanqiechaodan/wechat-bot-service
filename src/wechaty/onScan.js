import { ScanStatus } from 'wechaty';
import qrcodeTerminal from 'qrcode-terminal';
import { log4jsError } from '../utils/lo4js.js';

/**
 * @method onScan 当机器人需要扫码登陆的时候会触发这个事件。 建议你安装 qrcode-terminal(运行 npm install qrcode-terminal) 这个包，这样你可以在命令行中直接看到二维码。
 * @param {string} qrcode
 * @param {ScanStatus} status
 */
const onScan = (qrcode, status) => {
  try {
    if (status === ScanStatus.Waiting) {
      qrcodeTerminal.generate(qrcode, { small: true });

      process.send({ type: 'qrcode', qrcode });
    }
  } catch (error) {
    log4jsError(error);
  }
};

export default onScan;
