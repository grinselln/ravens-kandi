import SftpClient from 'ssh2-sftp-client';
import 'dotenv/config';
import fs from 'node:fs';
import { loadEnv } from 'vite';

const env = loadEnv('', import.meta.dirname, 'DEPLOY_');
const sftp = new SftpClient();

async function main() {
  try {
    await sftp.connect({
      host: env.DEPLOY_SSH_HOST,
      port: parseInt(env.DEPLOY_SSH_PORT) || 22,
      username: env.DEPLOY_SSH_USER,
      privateKey: fs.readFileSync(env.DEPLOY_SSH_KEY_PATH),
      passphrase: env.DEPLOY_SSH_KEY_PASSPHRASE,
    });
    console.log('Connected. Uploading dist folder...');
    await sftp.uploadDir('dist', env.DEPLOY_SSH_UPLOAD_DIRECTORY);
    console.log('Deployment successful!');
  } catch (err) {
    console.error('Deployment failed:', err.message);
  } finally {
    await sftp.end();
  }
}

main();
