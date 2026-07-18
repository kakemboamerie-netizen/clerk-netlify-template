const WebSocket = require('ws');

class DerivAPI {
  constructor(config) {
    this.config = config;
    this.ws = null;
    this.requestId = 0;
    this.subscriptions = {};
    this.callbacks = {};
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        const url = this.config.demoMode 
          ? 'wss://ws.derivws.com/websockets/v3' 
          : 'wss://ws.deriv.com/websockets/v3';
        
        this.ws = new WebSocket(`${url}?app_id=${this.config.appId}`);
        
        this.ws.onopen = () => {
          console.log('[API] WebSocket connected');
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.ws.onerror = (error) => {
          console.error('[API] WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('[API] WebSocket disconnected');
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  authorize() {
    return this.send({
      authorize: this.config.apiToken
    });
  }

  async getBalance() {
    const response = await this.send({
      balance: 1,
      subscribe: 1
    });
    return response.balance ? response.balance.balance : 0;
  }

  subscribeTick(symbol) {
    return this.send({
      tick: symbol,
      subscribe: 1
    });
  }

  onTick(callback) {
    this.callbacks.tick = callback;
  }

  async buyContract(contract) {
    return this.send({
      buy: 1,
      ...contract
    });
  }

  async sellContract(contractId) {
    return this.send({
      sell: contractId
    });
  }

  send(request) {
    return new Promise((resolve, reject) => {
      const requestId = ++this.requestId;
      request.req_id = requestId;
      
      this.subscriptions[requestId] = {
        resolve,
        reject,
        timeout: setTimeout(() => {
          delete this.subscriptions[requestId];
          reject(new Error('Request timeout'));
        }, 30000)
      };
      
      this.ws.send(JSON.stringify(request));
    });
  }

  handleMessage(message) {
    // Handle subscription updates
    if (message.tick) {
      if (this.callbacks.tick) {
        this.callbacks.tick({
          symbol: message.tick.symbol,
          price: message.tick.quote,
          bid: message.tick.bid,
          ask: message.tick.ask
        });
      }
    }
    
    // Handle responses
    if (message.req_id && this.subscriptions[message.req_id]) {
      const subscription = this.subscriptions[message.req_id];
      clearTimeout(subscription.timeout);
      
      if (message.error) {
        subscription.reject(new Error(message.error.message));
      } else {
        subscription.resolve(message);
      }
      
      delete this.subscriptions[message.req_id];
    }
  }

  disconnect() {
    return new Promise((resolve) => {
      if (this.ws) {
        this.ws.onclose = () => resolve();
        this.ws.close();
      } else {
        resolve();
      }
    });
  }
}

module.exports = DerivAPI;
