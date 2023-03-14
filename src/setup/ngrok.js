import args from 'args'
import ngrok from 'ngrok'
import toml from '../helper/toml.js'
import log from '../helper/logger.js'

import { setWebhook } from '../helper/telegram.js'

args
  .option('port', 'The port ngrok forward to', 8080)
  .option('region', 'The ngrok server region', 'us') // us, eu, au, ap, sa, jp, in
  .option('authtoken', 'Your ngrok auth token')
  .option('subdomain', 'Reserved tunnel sub domain name (Paid features)')
  .option('configPath', 'Custom path for ngrok config file')
  .option('telegramSetup', 'Setup Telegram Webhook URL')
  .option('eventLog', 'Show event logs')

const {
  port,
  region,
  authtoken,
  subdomain,
  telegramSetup,
  configPath,
  eventLog,
} = args.parse(process.argv)

ngrok
  .connect({
    proto: 'http',
    addr: port,
    region,
    authtoken,
    subdomain,
    configPath,
    onStatusChange: (status) => {
      console.log(`ngrok: ${status}`)
    },
    onLogEvent: (logEvent) => {
      eventLog && console.debug(logEvent)
    },
  })
  .then(async (tunnelBaseUrl) => {
    console.log('------------------------------------------------')
    console.log(`Tunnel URL: ${tunnelBaseUrl}`)
    console.log('------------------------------------------------')

    if (telegramSetup) {
      const { vars } = await toml()

      const apiToken = vars?.TELEGRAM_API_TOKEN
      const secretToken = vars?.TELEGRAM_SECRET_TOKEN

      if (apiToken?.length > 0) {
        log.verbose(`set telegram webhook base url (${tunnelBaseUrl})`)
        await setWebhook(apiToken, tunnelBaseUrl, secretToken)
      } else {
        console.warn('TELEGRAM_API_TOKEN is required to update Telegram Webhook!') // prettier-ignore
      }
    }
    console.log('')
  })
  .catch((error) => {
    console.error(error.message)
  })
