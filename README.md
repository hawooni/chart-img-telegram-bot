# CHART-IMG TELEGRAM BOT

It is a simple Telegram bot based on the [CHART-IMG](https://doc.chart-img.com) API version 1 & 2, with support for Local Server and Serverless Setup. The main focus of this project is simplicity with fully customizable preset indicators for TradingView exchange symbols.

> In the upcoming CHART-IMG website update, users can run a customized Telegram Bot by uploading a `config.json`.

## Live Telegram Bot

[https://t.me/chartImgBot](https://t.me/chartImgBot)

It is running on Serverless Cloudflare Workers with version 2 configuration. You can use this bot if you don't want to customize your own. It will always run with the latest version.

## Requirement

All the requirements are available for free.

- CHART-IMG API Key
- Telegram API Token
- NGROK Token (HTTPS Tunnel) - Setup Option #1
- Cloudflare Account (Serverless) - Setup Option #2

## Configuration

You can preset the exchange symbol with indicators using CHART-IMG API version 1 or 2. However, version 2 is currently in BETA and not available to the public, so you might have to request the key to access it.

### config.json

Example:

```json
{
  "version": 1,
  "/chart": {
    "intervals": ["5m", "15m", "1h", "4h", "1D", "1W"],
    "default": {
      "symbol": "CAPITALCOM:US100",
      "interval": "1W",
      "theme": "dark"
    }
  },
  "commands": [
    {
      "command": "/start",
      "description": "Introduction"
    },
    {
      "command": "/chart",
      "description": "TradingView <exchange:symbol> <interval>"
    },
    {
      "command": "/example",
      "description": "Command Examples"
    }
  ],
  "messages": [
    {
      "name": "/start",
      "text": "Hello, Welcome message..."
    },
    {
      "name": "/example",
      "text": "List of examples..."
    }
  ],
  "private": {
    "enabled": true,
    "allowFromIds": [12345678, 12345679]
  },
  "group": {
    "enabled": false
  },
  "logLevel": "verbose"
}
```

| Parameter                                         | Type      | Required | Default | Description                                                                                                                                                                                                           |
| ------------------------------------------------- | --------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version                                           | Integer   | Yes      | -       | Set API version. [`1`, `2`]                                                                                                                                                                                           |
| \</command\>                                      | Object    | No       | -       | -                                                                                                                                                                                                                     |
| \</command\>.intervals                            | String[]  | Yes      | -       | Set interval preset buttons.                                                                                                                                                                                          |
| \</command\>.default                              | Object    | Yes      | -       | -                                                                                                                                                                                                                     |
| \</command\>.default.symbol                       | String    | Yes      | -       | Set `command` default symbol when not provided.                                                                                                                                                                       |
| \</command\>.default.interval                     | String    | Yes      | -       | Set `command` default interval when not provided.                                                                                                                                                                     |
| \</command\>.default.\*                           | \*        | No       | -       | Set `command` default optional parameters. Refer to the API Documentation for [version 1](https://doc.chart-img.com/#advanced-chart) or [version 2](https://doc.chart-img.com/#advanced-chart-nbsp).                  |
| \</command\>.default.inputs                       | Object[]  | No       | -       | -                                                                                                                                                                                                                     |
| \</command\>.default.inputs.\*row.\*column.text   | String    | Yes      | -       | Set preset button exchange symbol disply text.                                                                                                                                                                        |
| \</command\>.default.inputs.\*row.\*column.symbol | String    | Yes      | -       | Set preset button exchange symbol. Must be a valid TradingView `EXCHANGE:SYMBOL`.                                                                                                                                     |
| \</command\>.default.inputs.\*row.\*column.\*     | \*        | No       | -       | Set preset button exchange symbol with optional parameters. Refer to the API Documentation for [version 1](https://doc.chart-img.com/#advanced-chart) or [version 2](https://doc.chart-img.com/#advanced-chart-nbsp). |
| commands                                          | Object[]  | Yes      | -       | Set Telegram Menu commands.                                                                                                                                                                                           |
| commands.\*.command                               | String    | Yes      | -       | Set Telegram Menu command key. eg. `/start`                                                                                                                                                                           |
| commands.\*.description                           | String    | Yes      | -       | Set Telegram Menu command description. eg. `Introduction`                                                                                                                                                             |
| messages                                          | Object[]  | Yes      | -       | Set `command` messages.                                                                                                                                                                                               |
| messages.\*.name                                  | String    | Yes      | -       | Set `command` message name. eg. `/start`, `/example`                                                                                                                                                                  |
| messages.\*.text                                  | String    | Yes      | -       | Set `command` message text. eg. `Hello, I am CHART-IMG Bot...`                                                                                                                                                        |
| messages.\*.parseMode                             | String    | No       | -       | Set `command` message text parse mode. `MarkdownV2`, `HTML`                                                                                                                                                           |
| private                                           | Object    | No       | -       | -                                                                                                                                                                                                                     |
| private.enabled                                   | Boolean   | No       | `true`  | Enable private message response. If `false`, the bot will not send any reply.                                                                                                                                         |
| private.allowFromIds                              | Integer[] | No       | -       | White List Private Ids. If not empty, the bot will send a reply to the from id included in the array.                                                                                                                 |
| group                                             | Object    | No       | -       | -                                                                                                                                                                                                                     |
| group.enabled                                     | Boolean   | No       | `true`  | Enable group message response. If `false`, the bot will not send any reply.                                                                                                                                           |
| group.allowFromIds                                | Integer[] | No       | -       | White List Group Ids. If not empty, the bot will send a reply to the group id included in the array.                                                                                                                  |
| logLevel                                          | String    | No       | `info`  | Console output level. [`error`, `warn`, `info`, `verbose`, `debug`]                                                                                                                                                   |

#### Example Version 1

```json
{
  "version": 1,
  "/crypto": {
    "intervals": ["5m", "15m", "1h", "4h", "1D", "1W"],
    "default": {
      "symbol": "CAPITALCOM:CIX",
      "interval": "1W",
      "theme": "dark"
    },
    "inputs": [
      [
        {
          "text": "BTCUSDT",
          "symbol": "BINANCE:BTCUSDT",
          "studies": ["RSI"]
        },
        {
          "text": "ETHUSDT",
          "symbol": "BINANCE:ETHUSDT",
          "studies": ["RSI"]
        },
        {
          "text": "BNBUSDT",
          "symbol": "BINANCE:BNBUSDT",
          "studies": ["RSI"]
        },
        {
          "text": "XRPUSDT",
          "symbol": "BINANCE:XRPUSDT",
          "studies": ["RSI"]
        }
      ]
    ]
  },
  ...
}
```

#### Example Version 2

```json
{
  "version": 2,
  "/crypto": {
    "intervals": ["5m", "15m", "1h", "4h", "1D", "1W"],
    "default": {
      "symbol": "CAPITALCOM:CIX",
      "interval": "1W",
      "theme": "dark",
      "studies": [
        {
          "name": "Volume",
          "forceOverlay": true
        }
      ]
    },
    "inputs": [
      [
        {
          "text": "BTCUSDT",
          "symbol": "BINANCE:BTCUSDT",
          "studies": [
            {
              "name": "Volume",
              "forceOverlay": true
            },
            {
              "name": "Relative Strength Index"
            }
          ]
        },
        {
          "text": "ETHUSDT",
          "symbol": "BINANCE:ETHUSDT",
          "studies": [
            {
              "name": "Volume",
              "forceOverlay": true
            },
            {
              "name": "Relative Strength Index"
            }
          ]
        },
        {
          "text": "BNBUSDT",
          "symbol": "BINANCE:BNBUSDT",
          "studies": [
            {
              "name": "Volume",
              "forceOverlay": true
            },
            {
              "name": "Relative Strength Index"
            }
          ]
        },
        {
          "text": "XRPUSDT",
          "symbol": "BINANCE:XRPUSDT",
          "studies": [
            {
              "name": "Volume",
              "forceOverlay": true
            },
            {
              "name": "Relative Strength Index"
            }
          ]
        }
      ]
    ]
  },
  ...
}
```

### wrangler.toml

## Setup Option #1 (Local Server)

## Setup Option #2 (Serverless)
