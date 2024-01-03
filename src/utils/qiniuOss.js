import qiniu from 'qiniu';
import { v4 as uuidv4 } from 'uuid';
import { log4jsError } from './lo4js.js';

const config = new qiniu.conf.Config();

config.zone = qiniu.zone.Zone_z2;

const formUploader = new qiniu.form_up.FormUploader(config);

// const putExtra = new qiniu.form_up.PutExtra();

/**
 * @method uploadFile
 * @param {object} options
 * @param {string} options.readableStream
 * @param {string} options.suffix
 * @param {string} options.defaultText
 * @returns
 */
const uploadFile = ({ readableStream, suffix, defaultText }) => {
  try {
    return new Promise((reslove) => {
      const putPolicy = new qiniu.rs.PutPolicy({
        scope: process.env.QINIUYUN_OSS_BUCKET,
      });

      const uploadToken = putPolicy.uploadToken(
        new qiniu.auth.digest.Mac(process.env.QINIUYUN_OSS_ACCESSKEY, process.env.QINIUYUN_OSS_SECRETKEY)
      );

      const key = `${uuidv4()}.${suffix}`;

      formUploader.putStream(uploadToken, key, readableStream, null, async (respErr, respBody, respInfo) => {
        if (respErr) {
          reslove(defaultText || respErr);
        }
        if (respInfo.statusCode == 200) {
          reslove(`${process.env.QINIUYUN_OSS_CUSTOM_DOMAIN}/${key}`);
        } else {
          reslove(defaultText || respInfo.data.error);
        }
      });
    });
  } catch (error) {
    log4jsError(error);
  }
};

export default uploadFile;
