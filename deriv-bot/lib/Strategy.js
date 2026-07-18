class Strategy {
  constructor(config) {
    this.config = config;
    this.prices = [];
    this.maxPrices = 100;
  }

  addPrice(tick) {
    this.prices.push({
      price: tick.price,
      bid: tick.bid,
      ask: tick.ask,
      timestamp: new Date()
    });
    
    // Keep only last 100 prices
    if (this.prices.length > this.maxPrices) {
      this.prices.shift();
    }
  }

  getSignal() {
    if (this.prices.length < 10) {
      return { action: 'HOLD', confidence: 0 };
    }
    
    // Calculate moving averages
    const sma5 = this.calculateSMA(5);
    const sma20 = this.calculateSMA(20);
    
    // Calculate RSI
    const rsi = this.calculateRSI(14);
    
    // Simple strategy: SMA crossover + RSI confirmation
    const signal = {
      action: 'HOLD',
      confidence: 0,
      sma5,
      sma20,
      rsi,
      contractType: 'CALL'
    };
    
    if (sma5 > sma20 && rsi < 70) {
      signal.action = 'BUY';
      signal.confidence = (rsi / 100) * 100;
      signal.contractType = 'CALL';
    } else if (sma5 < sma20 && rsi > 30) {
      signal.action = 'SELL';
      signal.confidence = ((100 - rsi) / 100) * 100;
      signal.contractType = 'PUT';
    }
    
    return signal;
  }

  calculateSMA(period) {
    if (this.prices.length < period) return 0;
    
    const recent = this.prices.slice(-period);
    const sum = recent.reduce((acc, p) => acc + p.price, 0);
    return sum / period;
  }

  calculateRSI(period) {
    if (this.prices.length < period + 1) return 50;
    
    const recent = this.prices.slice(-period - 1);
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < recent.length; i++) {
      const change = recent[i].price - recent[i - 1].price;
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
}

module.exports = Strategy;
