# CHART-IMG TELEGRAM BOT

It is a simple Telegram Bot based on the [CHART-IMG](https://doc.chart-img.com) API `version 1` & `2`, with support for Local Server and Serverless Setup. The main focus of this project is simplicity with fully customizable preset indicators for TradingView exchange symbols.

The step by step [tutorial](https://chart-img.medium.com/tradingview-chart-telegram-bot-part1-328f1f4fcaac) on how to run your customized server.

> In the upcoming website update, you will be able to run a fully managed Telegram Bot Service with customized configuration.

## Live Telegram Bot

[https://t.me/chartImgBot](https://t.me/chartImgBot)

It is running on Serverless Cloudflare Workers with version 2 configuration. You can use this bot if you don't want to customize your own. It will always run with the latest version.

## Requirement

All the requirements are available for free.

- Telegram API Token
- CHART-IMG API Access Key
- NGROK Token (HTTPS Tunnel) - Deploy with Docker / Local Server
- Cloudflare Account - Deploy with Serverless Workers

## Clone the repo

```
$ git clone https://github.com/hawooni/chart-img-telegram-bot.git
```

```
$ cd chart-img-telegram-bot
```

## Configuration

You can preset the exchange symbol with indicators using CHART-IMG API version 1 or 2.

### config.json

> Refer to the version 1 & 2 examples in the folder `/examples`.

```json
{
  "version": 1,
  "/chart": {
    "intervals": ["5m", "15m", "1h", "4h", "1D", "1W"],
    "default": {
      "symbol": "CAPITALCOM:US100",
      "interval": "1D",
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
  }
}
```

| Parameter                             | Type      | Required | Default | Description                                                                                                                                                                                                           |
| ------------------------------------- | --------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| version                               | Integer   | Yes      | -       | Set API version. [`1`, `2`]                                                                                                                                                                                           |
| \</cmd\>                              | Object    | No       | -       | -                                                                                                                                                                                                                     |
| \</cmd\>.intervals                    | String[]  | Yes      | -       | Set interval preset buttons.                                                                                                                                                                                          |
| \</cmd\>.default                      | Object    | Yes      | -       | -                                                                                                                                                                                                                     |
| \</cmd\>.default.symbol               | String    | Yes      | -       | Set `command` default symbol when not provided.                                                                                                                                                                       |
| \</cmd\>.default.interval             | String    | Yes      | -       | Set `command` default interval when not provided.                                                                                                                                                                     |
| \</cmd\>.default.\*                   | \*        | No       | -       | Set `command` default optional parameters. Refer to the API Documentation for [version 1](https://doc.chart-img.com/#advanced-chart) or [version 2](https://doc.chart-img.com/#advanced-chart-nbsp).                  |
| \</cmd\>.inputs                       | Object[]  | No       | -       | -                                                                                                                                                                                                                     |
| \</cmd\>.inputs.\*row.\*column.text   | String    | Yes      | -       | Set preset button exchange symbol disply text.                                                                                                                                                                        |
| \</cmd\>.inputs.\*row.\*column.symbol | String    | Yes      | -       | Set preset button exchange symbol. Must be a valid TradingView `EXCHANGE:SYMBOL`.                                                                                                                                     |
| \</cmd\>.inputs.\*row.\*column.\*     | \*        | No       | -       | Set preset button exchange symbol with optional parameters. Refer to the API Documentation for [version 1](https://doc.chart-img.com/#advanced-chart) or [version 2](https://doc.chart-img.com/#advanced-chart-nbsp). |
| commands                              | Object[]  | Yes      | -       | Set Telegram Menu commands.                                                                                                                                                                                           |
| commands.\*.command                   | String    | Yes      | -       | Set Telegram Menu command key. eg. `/start`                                                                                                                                                                           |
| commands.\*.description               | String    | Yes      | -       | Set Telegram Menu command description. eg. `Introduction`                                                                                                                                                             |
| messages                              | Object[]  | Yes      | -       | Set `command` messages.                                                                                                                                                                                               |
| messages.\*.name                      | String    | Yes      | -       | Set `command` message name. eg. `/start`, `/example`                                                                                                                                                                  |
| messages.\*.text                      | String    | Yes      | -       | Set `command` message text. eg. `Hello, I am CHART-IMG Bot...`                                                                                                                                                        |
| messages.\*.parseMode                 | String    | No       | -       | Set `command` message text parse mode. `MarkdownV2`, `HTML`                                                                                                                                                           |
| private                               | Object    | No       | -       | -                                                                                                                                                                                                                     |
| private.enabled                       | Boolean   | No       | `true`  | Enable private message response. If `false`, the bot will not send any reply to private messages.                                                                                                                     |
| private.allowFromIds                  | Integer[] | No       | -       | Whitelist Private Ids. If not empty, the bot will send a reply to the from id included in the array.                                                                                                                  |
| group                                 | Object    | No       | -       | -                                                                                                                                                                                                                     |
| group.enabled                         | Boolean   | No       | `true`  | Enable group message response. If `false`, the bot will not send any reply to group messages.                                                                                                                         |
| group.allowFromIds                    | Integer[] | No       | -       | Whitelist Group Ids. If not empty, the bot will send a reply to the group id included in the array.                                                                                                                   |
| logLevel                              | String    | No       | `info`  | Console output level. [`error`, `warn`, `info`, `verbose`, `debug`]                                                                                                                                                   |
| override                              | Object    | No       | -       | Override the app settings.                                                                                                                                                                                            |
| override.chartImgApiURL               | String    | No       | -       | Override CHART-IMG API Base URL. eg. `https://beta-api.chart-img.com`                                                                                                                                                 |

### wrangler.toml

Include your credentials in the file `wrangler.toml`.

```toml
name = "chart-img-telegram-bot"

main = "src/index.js"
compatibility_date = "2022-11-30"


[vars]
NGROK_TOKEN = "YOUR_NGROK_TOKEN_IF_NEEDED"
CHART_IMG_API_KEY = "YOUR_CHART_IMG_API_KEY"
TELEGRAM_API_TOKEN = "YOUR_TELEGRAM_API_TOKEN"
TELEGRAM_SECRET_TOKEN = "somethingRandomHere"
```

| Variable              | Type   | Required | Descripton                                                                                                                                 |
| --------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| CHART_IMG_API_KEY     | String | Yes      | CHART-IMG API Access Key. To obtain your key, log-in to [chart-img.com](https://chart-img.com) using your Google account and generate key. |
| TELEGRAM_API_TOKEN    | String | Yes      | To obtain your API token, you can message [@BotFather](https://t.me/BotFather) on Telegram to setup your bot and receive the token.        |
| TELEGRAM_SECRET_TOKEN | String | Yes      | To verify the Telegram Webhook payload, replace the value with a randomly generated unique string.                                         |

#### Docker / Local Server

If you are not using the serverless deploy option, you need a secured proxy tunnel to forward the webhook payload to your local server. I recommend using NGROK. You can create an account at [ngrok.com](https://ngrok.com) and get a free auth token.

| Variable    | Type   | Required | Descripton                                                      |
| ----------- | ------ | -------- | --------------------------------------------------------------- |
| NGROK_TOKEN | String | No       | Without the auth token the session will expire after `2` hours. |

## Deploy

Make sure to have two files `wrangler.toml` and `config.json` ready with the necessary credentials and configurations.

### Deploy with Docker Image

This is the simplest way to run the server with only two files `wrangler.toml` and `config.json`.

Replace \<PATH\> with the file path.

```
$ docker run --restart=always --name telegram-bot -v <PATH>/wrangler.toml:/chart-img-telegram-bot/wrangler.toml -v <PATH>/config.json:chart-img-telegram-bot/config.json -d hawooni/chart-img-telegram-bot:latest
```

Linux:

```
$ docker run --restart=always --name telegram-bot \
  -v $(pwd)/wrangler.toml:/chart-img-telegram-bot/wrangler.toml \
  -v $(pwd)/config.json:/chart-img-telegram-bot/config.json \
  -d hawooni/chart-img-telegram-bot:latest
```

### Deploy with NodeJS & NPM

To deploy, ensure you have the latest [NPM](https://docs.npmjs.com/getting-started) installed, preferably using a Node version manager like [Volta](https://volta.sh) or [NVM](https://github.com/nvm-sh/nvm) to avoid permission issues or to easily change `NodeJS` versions, then run:

```
$ npm install
```

#### Deploy Option #1 (Local Server)

Run NGROK as a proxy tunnel to forward the webhook payload to your local port `8080` after updating the Telegram webhook URL.

```
$ npm run ngrok -- --port 8080 -t
```

```
> chart-img-telegram-bot@1.0.3 ngrok
> node --no-warnings src/setup/ngrok --port 8080 -t

ngrok: connected
------------------------------------------------------
https://2360-104-255-13-171.ngrok-free.app => 127.0.0.1:8080
------------------------------------------------------
```

Run Telegram bot server locally with the port `8080`.

```
$ npm run server-local -- --ip 127.0.0.1 --port 8080
```

```
> chart-img-telegram-bot@1.0.3 server-local
> npx wrangler dev --ip 127.0.0.1 --port 8080

 ⛅️ wrangler 3.3.0
------------------
wrangler dev now uses local mode by default, powered by 🔥 Miniflare and 👷 workerd.
To run an edge preview session for your Worker, use wrangler dev --remote
Your worker has access to the following bindings:
- Vars:
  - NGROK_TOKEN: "HIDDEN..."
  - CHART_IMG_API_KEY: "HIDDEN..."
  - TELEGRAM_API_TOKEN: "HIDDEN..."
  - TELEGRAM_SECRET_TOKEN: "HIDDEN..."
⎔ Starting a local server...
[mf:inf] Ready on http://127.0.0.1:8080/
╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│ [b] open a browser, [d] open Devtools, [l] turn off local mode, [c] clear console, [x] to exit                     │
╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
```

#### Deploy Option #2 (Serverless)

If you haven't already, please log in to Cloudflare and create a name for your worker.

```
$ npx wrangler login
```

```
$ npm run publish-server-cf
```

```
> chart-img-telegram-bot@1.0.3 publish-server-cf
> npx wrangler deploy

 ⛅️ wrangler 3.3.0
------------------
Your worker has access to the following bindings:
- Vars:
  - NGROK_TOKEN: "HIDDEN..."
  - CHART_IMG_API_KEY: "HIDDEN..."
  - TELEGRAM_API_TOKEN: "HIDDEN..."
  - TELEGRAM_SECRET_TOKEN: "HIDDEN..."
Total Upload: 92.42 KiB / gzip: 15.80 KiB
Uploaded chart-img-telegram-bot (0.81 sec)
Published chart-img-telegram-bot (0.20 sec)
  https://chart-img-telegram-bot.<WORKER_NAME>.workers.dev
Current Deployment ID: 8faf02f1-2219-474b-aa15-eaeaacf662dc
```

After you publish your Cloudflare worker, you have to set up Telegram webhook URL by running the command `npm run setup-telegram`, then enter the published URL.

```
$ npm run setup-telegram
```

```
> chart-img-telegram-bot@1.0.3 setup-telegram
> node --no-warnings src/setup/telegram

? Enter the server https base URL : https://chart-img-telegram-bot.<WORKER_NAME>.workers.dev

Successfully setup Telegram Webhook!
```

##### Encrypt Variables (Optional)

You should encrypt the variables in the Cloudflare Worker Settings or use the command `npx wrangler secret put <KEY> [OPTIONS]`.

```
$ npx wrangler secret put CHART_IMG_API_KEY
```

```
 ⛅️ wrangler 3.3.0
------------------
✔ Enter a secret value: … *************************************************
🌀 Creating the secret for the Worker "chart-img-telegram-bot"
✨ Success! Uploaded secret CHART_IMG_API_KEY
```

![cf-env-variable](doc/cf-env-var.png?raw=true)

## Screenshots

![/start](doc/start.jpg?raw=true)

![/chart](doc/chart.jpg?raw=true)

![/crypto](doc/crypto.jpg?raw=true)

![/nasdaq](doc/nasdaq.jpg?raw=true)

![/nyse](doc/nyse.jpg?raw=true)

![/forex](doc/forex.jpg?raw=true)

![/cfd](doc/cfd.jpg?raw=true)

![/example](doc/example.jpg?raw=true)
