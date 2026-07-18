# Deriv Automated Trading Bot

This is an automated trading bot for the Deriv platform using their WebSocket API.

## Features

- ✅ Real-time market data streaming
- ✅ Automated trading signals based on SMA + RSI strategy
- ✅ Risk management (stop-loss, take-profit, max daily loss)
- ✅ Demo mode support for testing
- ✅ Graceful shutdown handling
- ✅ Configurable trading parameters

## Prerequisites

- Node.js (v14 or higher)
- npm
- Deriv account (https://www.deriv.com/)
- Deriv API credentials

## Setup

### 1. Get Deriv API Credentials

1. Sign up at https://www.deriv.com/
2. Go to Settings > API Tokens
3. Create a new API token (select "Trade" scope)
4. Copy your App ID (available on the same page)

### 2. Install Dependencies

```bash
cd deriv-bot
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
DERIV_APP_ID=YOUR_APP_ID_HERE
DERIV_API_TOKEN=YOUR_API_TOKEN_HERE
DERIV_ACCOUNT_ID=YOUR_ACCOUNT_ID

# Trading parameters
TRADING_SYMBOL=R_100
TRADING_AMOUNT=10
TRADING_DURATION=5

# Risk management
STOP_LOSS_PERCENTAGE=5
TAKE_PROFIT_PERCENTAGE=10
MAX_DAILY_LOSS=100

# Settings
DEMO_MODE=true
LOG_LEVEL=info
```

## Usage

### Start the Bot

```bash
npm start
```

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Stop the Bot

Press `Ctrl+C` to gracefully shut down the bot.

## Configuration Options

| Parameter | Description | Default |
|-----------|-------------|----------|
| `DEMO_MODE` | Use demo account (true/false) | true |
| `TRADING_SYMBOL` | Market symbol (R_100, EUR/USD, etc.) | R_100 |
| `TRADING_AMOUNT` | Trade amount in USD | 10 |
| `TRADING_DURATION` | Contract duration in minutes | 5 |
| `STOP_LOSS_PERCENTAGE` | Stop loss percentage | 5 |
| `TAKE_PROFIT_PERCENTAGE` | Take profit percentage | 10 |
| `MAX_DAILY_LOSS` | Max loss per day before stopping | 100 |
| `LOG_LEVEL` | Logging level (info/debug) | info |

## Trading Strategy

The bot uses a simple **SMA Crossover + RSI** strategy:

- **SMA (Simple Moving Average)**: Uses 5-period and 20-period moving averages
- **RSI (Relative Strength Index)**: 14-period RSI for confirmation
- **BUY Signal**: SMA5 > SMA20 AND RSI < 70
- **SELL Signal**: SMA5 < SMA20 AND RSI > 30

### Customize Strategy

Edit `lib/Strategy.js` to implement your own trading logic:

```javascript
getSignal() {
  // Your custom logic here
  return {
    action: 'BUY' | 'SELL' | 'HOLD',
    confidence: 0-100,
    contractType: 'CALL' | 'PUT'
  };
}
```

## Risk Management

The bot includes built-in risk management:

1. **Max Daily Loss**: Stops trading when daily loss exceeds limit
2. **Position Tracking**: Monitors all open positions
3. **Account Balance**: Checks available balance before trades
4. **Configurable Stop Loss & Take Profit**: Via environment variables

## Important Warnings ⚠️

⚠️ **ALWAYS TEST IN DEMO MODE FIRST**

- This bot uses real trading logic. Start with `DEMO_MODE=true`
- Use small amounts when trading live (`TRADING_AMOUNT`)
- Monitor the bot regularly, especially with new strategies
- Financial markets are risky. Only trade what you can afford to lose
- Past performance does not guarantee future results

## Troubleshooting

### Bot won't connect

- Check your API credentials in `.env`
- Ensure your Deriv account is active
- Verify network connectivity

### No trading signals

- Check `LOG_LEVEL=debug` for detailed output
- Ensure market is open
- Verify trading symbol exists (e.g., `R_100`)

### API errors

- Check Deriv API docs: https://developers.deriv.com/
- Verify API token has "Trade" scope
- Check account restrictions or limits

## API References

- [Deriv API Documentation](https://developers.deriv.com/)
- [Deriv Bot Help](https://deriv.com/help-centre/deriv-bot/)
- [WebSocket Playground](https://developers.deriv.com/playground/)

## License

MIT

## Disclaimer

This bot is provided for educational purposes. Trading involves risk of loss. Past performance does not guarantee future results. Use at your own risk and always test thoroughly in demo mode first.
