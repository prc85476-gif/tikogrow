import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  BOT_TOKEN: process.env.BOT_TOKEN || '9211084608:AAFtJkrHERxke3k2lAjcJZcWjVgPDegiciM',
  BOT_USERNAME: process.env.BOT_USERNAME || 'TikoGrowbot',
  WEBAPP_URL: process.env.WEBAPP_URL || 'https://qz4gige81pt4u0yx81c5obvc.179.197.255.88.sslip.io',
  APP_NAME: 'Tiko Grow',
  COIN_NAME: 'FN coin',
  COIN_SYMBOL: 'FN',
  AD_REWARD_COINS: 10,
  NOVA_TO_USDT_RATE: 0.001, // 1000 FN = 1.00 USDT
  MIN_WITHDRAW_USDT: 1.0,
  MIN_DEPOSIT_USDT: 0.1,
  NETWORK: 'BEP-20 (BNB Smart Chain)',
  TELEGRAM_API_ROOT: process.env.TELEGRAM_API_ROOT || 'https://api.telegram.org',
  BANNER_URL: process.env.BANNER_URL || 'https://qz4gige81pt4u0yx81c5obvc.179.197.255.88.sslip.io/tiko_banner.jpg',
  OFFICIAL_CHANNEL: process.env.OFFICIAL_CHANNEL || 'https://t.me/AirdropIdentifyOfficial',
  PROMOTER_CHANNEL: process.env.PROMOTER_CHANNEL || 'https://t.me/picassopayout',
  ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID || '',
  ADMIN_PASSKEY: process.env.ADMIN_PASSKEY || 'admin2050',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_ult1ocJR5psX@ep-jolly-star-bdzeidm5-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require',
  RELAY_API_KEY: process.env.RELAY_API_KEY || 'e116e930-b77a-40b2-bcd6-d75315f1129e',
  RELAY_RECIPIENT_ADDRESS: (process.env.RELAY_RECIPIENT_ADDRESS || '0x749675a232725a18fac41925cfac6740d77f4537').toLowerCase()
};
