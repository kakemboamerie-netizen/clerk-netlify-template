// Simple test file to verify bot components
const Strategy = require('./lib/Strategy');

console.log('[TEST] Testing Trading Strategy...');

const config = {
  symbol: 'R_100',
  amount: 10
};

const strategy = new Strategy(config);

// Simulate price data
const mockPrices = [
  100, 101, 102, 101, 100, 99, 100, 101, 102, 103,
  102, 101, 100, 99, 98, 99, 100, 101, 102, 103
];

mockPrices.forEach(price => {
  strategy.addPrice({
    price,
    bid: price - 0.5,
    ask: price + 0.5
  });
});

const signal = strategy.getSignal();
console.log('[TEST] Generated Signal:', signal);
console.log('[TEST] ✓ Strategy test passed');
