import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  BOT_TOKEN: process.env.BOT_TOKEN || '9160907530:AAH4kRLPoqdt13xhJ72DtLRNudVfdRiT-o4',
  BOT_USERNAME: process.env.BOT_USERNAME || 'Aviatoraxalinebot',
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://aviatorax.pages.dev',
  APP_NAME: 'Aviatorax',
  COIN_NAME: 'FN coin',
  COIN_SYMBOL: 'FN',
  AD_REWARD_COINS: 10,
  NOVA_TO_USDT_RATE: 0.001, // 1000 FN = 1.00 USDT
  MIN_WITHDRAW_USDT: 1.0,
  MIN_DEPOSIT_USDT: 0.1,
  NETWORK: 'BEP-20 (BNB Smart Chain)',
  TELEGRAM_API_ROOT: process.env.TELEGRAM_API_ROOT || 'https://tiko-tg-proxy.prc85476.workers.dev',
  BANNER_URL: process.env.BANNER_URL || 'https://foxtask.pages.dev/tiko_banner.jpg',
  OFFICIAL_CHANNEL: process.env.OFFICIAL_CHANNEL || 'https://t.me/+paZKlKGNB2ZmNDk0',
  PROMOTER_CHANNEL: process.env.PROMOTER_CHANNEL || 'https://t.me/picassopayout',
  ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID || '',
  ADMIN_PASSKEY: process.env.ADMIN_PASSKEY || 'admin2050',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_A56QhizSDKkt@ep-wandering-shadow-bdzq7jua-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require',
  RELAY_API_KEY: process.env.RELAY_API_KEY || 'e116e930-b77a-40b2-bcd6-d75315f1129e',
  RELAY_RECIPIENT_ADDRESS: (process.env.RELAY_RECIPIENT_ADDRESS || '0x749675a232725a18fac41925cfac6740d77f4537').toLowerCase()
};
