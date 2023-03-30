import args from 'args'
import ngrok from 'ngrok'
import toml from '../helper/toml.js'

import { setMyCommands, setWebhook } from '../helper/telegram.js'

const { vars } = await toml()

const apiToken = vars?.TELEGRAM_API_TOKEN
const secretToken = vars?.TELEGRAM_SECRET_TOKEN
const ngrokToken = vars?.NGROK_TOKEN?.length > 0 ? vars.NGROK_TOKEN : undefined

args
  .option('port', 'The port ngrok forward to', 8787)
  .option('region', 'The ngrok server region', 'us') // us, eu, au, ap, sa, jp, in
  .option('authtoken', 'Your ngrok auth token', ngrokToken)
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
  .then(async (baseURL) => {
    console.log('------------------------------------------------------')
    console.log(`${baseURL} => 127.0.0.1:${port}`)
    console.log('------------------------------------------------------')

    if (telegramSetup) {
      if (apiToken?.length > 0) {
        const notOks = await Promise.all([
          setWebhook(apiToken, baseURL, secretToken),
          setMyCommands(apiToken),
        ]).then((ress) => ress.filter((res) => !res.ok))

        if (notOks) {
          notOks.forEach(async (notOk) => {
            const { description, error_code } = await notOk.json()
            console.error(`ERROR: ${description} (${error_code})`)
          })
        }
      } else {
        console.log('WARN: TELEGRAM_API_TOKEN is required to update Telegram Webhook!') // prettier-ignore
      }
    }
    console.log('')
  })
  .catch((error) => {
    console.error(error.message)
  })
