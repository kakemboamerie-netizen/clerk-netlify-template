const WebSocket = require('ws');
const DerivAPI = require('./DerivAPI');
const Strategy = require('./Strategy');

class TradingBot {
  constructor(config) {
    this.config = config;
    this.api = new DerivAPI(config);
    this.strategy = new Strategy(config);
    this.isRunning = false;
    this.positions = [];
    this.accountBalance = 0;
    this.dailyLoss = 0;
  }

  async start() {
    console.log('[BOT] Starting Deriv Trading Bot...');
    console.log(`[BOT] Mode: ${this.config.demoMode ? 'DEMO' : 'LIVE'}`);
    
    try {
      await this.api.connect();
      this.isRunning = true;
      
      // Authenticate
      await this.api.authorize();
      console.log('[BOT] ✓ Authenticated with Deriv API');
      
      // Get account info
      await this.getAccountInfo();
      
      // Start trading loop
      this.startTradingLoop();
    } catch (err) {
      console.error('[BOT] Failed to start:', err);
      throw err;
    }
  }

  async getAccountInfo() {
    try {
      const balance = await this.api.getBalance();
      this.accountBalance = balance;
      console.log(`[BOT] Account balance: $${balance}`);
    } catch (err) {
      console.error('[BOT] Error getting account info:', err);
    }
  }

  startTradingLoop() {
    console.log('[BOT] ✓ Trading loop started');
    
    // Subscribe to market data
    this.api.onTick((tick) => {
      this.processTick(tick);
    });
    
    // Check for trading signals periodically
    setInterval(() => {
      this.checkTradingSignals();
    }, 60000); // Check every minute
  }

  processTick(tick) {
    if (this.config.logLevel === 'debug') {
      console.log(`[TICK] ${tick.symbol}: ${tick.price}`);
    }
    
    this.strategy.addPrice(tick);
  }

  async checkTradingSignals() {
    try {
      if (!this.isRunning) return;
      
      // Check if we've hit max daily loss
      if (this.dailyLoss >= this.config.maxDailyLoss) {
        console.log('[BOT] ⚠ Max daily loss reached. Stopping trades.');
        return;
      }
      
      // Get trading signal
      const signal = this.strategy.getSignal();
      
      if (signal && signal.action !== 'HOLD') {
        console.log(`[SIGNAL] ${signal.action} - Confidence: ${signal.confidence}`);
        
        if (signal.action === 'BUY') {
          await this.executeBuy(signal);
        } else if (signal.action === 'SELL') {
          await this.executeSell(signal);
        }
      }
    } catch (err) {
      console.error('[BOT] Error checking signals:', err);
    }
  }

  async executeBuy(signal) {
    try {
      console.log(`[TRADE] Buying ${this.config.amount} on ${this.config.symbol}`);
      
      const contract = {
        buy: 1,
        symbol: this.config.symbol,
        amount: this.config.amount,
        duration: this.config.duration || 5,
        duration_unit: 'm',
        basis: 'stake',
        contract_type: signal.contractType || 'CALL',
        currency: 'USD'
      };
      
      const result = await this.api.buyContract(contract);
      
      if (result.buy) {
        this.positions.push({
          id: result.buy.id,
          type: 'BUY',
          amount: this.config.amount,
          timestamp: new Date(),
          contractId: result.buy.contract_id
        });
        console.log(`[TRADE] ✓ Buy order placed: ${result.buy.contract_id}`);
      }
    } catch (err) {
      console.error('[TRADE] Buy failed:', err);
    }
  }

  async executeSell(signal) {
    try {
      if (this.positions.length === 0) {
        console.log('[TRADE] No open positions to sell');
        return;
      }
      
      const position = this.positions[0];
      console.log(`[TRADE] Selling position ${position.contractId}`);
      
      const result = await this.api.sellContract(position.contractId);
      
      if (result.sell) {
        this.positions.shift();
        const profit = result.sell.payout - this.config.amount;
        this.dailyLoss += profit < 0 ? Math.abs(profit) : 0;
        console.log(`[TRADE] ✓ Sell executed. Profit/Loss: $${profit}`);
      }
    } catch (err) {
      console.error('[TRADE] Sell failed:', err);
    }
  }

  async stop() {
    console.log('[BOT] Stopping bot...');
    this.isRunning = false;
    await this.api.disconnect();
    console.log('[BOT] ✓ Bot stopped');
  }
}

module.exports = TradingBot;
