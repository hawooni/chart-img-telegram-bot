import inquirer from 'inquirer'
import toml from '../helper/toml.js'

import { setMyCommands, setWebhook } from '../helper/telegram.js'

const BASE_URL_EXAMPLE = 'https://example.com'

const { vars } = await toml()
const { TELEGRAM_API_TOKEN, TELEGRAM_SECRET_TOKEN } = vars // wrangler.toml

const prompts = [
  {
    type: 'input',
    name: 'baseURL',
    message: `Enter the server https base URL :`,
    validate(value) {
      if (
        /^(https:\/\/)([a-zA-Z0-9\-\.]+)(:[0-9]+)?$/.test(value) &&
        value !== BASE_URL_EXAMPLE
      ) {
        return true
      }
      return 'Must be a valid https base URL'
    },
    default() {
      return BASE_URL_EXAMPLE
    },
  },
]

if (!TELEGRAM_API_TOKEN) {
  prompts.push({
    type: 'password',
    name: 'apiToken',
    message: 'Enter Telegram API Token :',
    validate(value) {
      if (value.length > 0) {
        return true
      }
      return 'Telegram API Token is required to set webhook URL'
    },
  })
}

inquirer
  .prompt(prompts)
  .then(({ baseURL, apiToken }) => {
    const tApiToken = apiToken || TELEGRAM_API_TOKEN
    return Promise.all([
      setWebhook(tApiToken, baseURL, TELEGRAM_SECRET_TOKEN),
      setMyCommands(tApiToken),
    ])
  })
  .then(async (ress) => {
    const notOKs = ress.filter((res) => !res.ok)

    if (notOKs?.length === 0) {
      console.info('\nSuccessfully setup Telegram Webhook!')
    } else {
      const { description, error_code } = await notOKs[0].json() // show first error only
      console.error(`\n${description} (${error_code})`)
    }
  })
  .catch((error) => {
    console.error(error.message)
  })
