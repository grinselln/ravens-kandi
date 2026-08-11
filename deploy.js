import SftpClient from 'ssh2-sftp-client';
import 'dotenv/config';
import { loadEnv } from 'vite';

const env = loadEnv('', import.meta.dirname, 'VITE_');

const sftp = new SftpClient();

async function main() {
  try {
    await sftp.connect({
      host: env.VITE_SSH_HOST,
      port: parseInt(env.VITE_SSH_PORT) || 22,
      username: env.VITE_SSH_USER,
      password: env.VITE_SSH_PASSWORD,
    });
    console.log('Connected. Uploading dist folder...');
    await sftp.uploadDir('dist', env.VITE_SSH_UPLOAD_DIRECTORY);
    console.log('Deployment successful!');
  } catch (err) {
    console.error('Deployment failed:', err.message);
  } finally {
    await sftp.end();
  }
}

main();
