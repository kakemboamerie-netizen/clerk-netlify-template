require('dotenv').config();
const WebSocket = require('ws');
const TradingBot = require('./lib/TradingBot');

const config = {
  appId: process.env.DERIV_APP_ID,
  apiToken: process.env.DERIV_API_TOKEN,
  accountId: process.env.DERIV_ACCOUNT_ID,
  demoMode: process.env.DEMO_MODE === 'true',
  symbol: process.env.TRADING_SYMBOL || 'R_100',
  amount: parseFloat(process.env.TRADING_AMOUNT) || 10,
  stopLossPercentage: parseFloat(process.env.STOP_LOSS_PERCENTAGE) || 5,
  takeProfitPercentage: parseFloat(process.env.TAKE_PROFIT_PERCENTAGE) || 10,
  maxDailyLoss: parseFloat(process.env.MAX_DAILY_LOSS) || 100,
  logLevel: process.env.LOG_LEVEL || 'info'
};

const bot = new TradingBot(config);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n[BOT] Shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[BOT] Shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

// Start the bot
bot.start().catch(err => {
  console.error('[BOT] Fatal error:', err);
  process.exit(1);
});
