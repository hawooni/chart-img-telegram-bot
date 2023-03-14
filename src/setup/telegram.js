import inquirer from 'inquirer'
import toml from '../helper/toml.js'

import { setWebhook } from '../helper/telegram.js'

const BASE_URL_EXAMPLE = 'https://example.com'

const { vars } = await toml()

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

if (!vars.TELEGRAM_API_TOKEN) {
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
    return setWebhook(apiToken, baseURL, vars.TELEGRAM_SECRET_TOKEN)
  })
  .then(() => {
    console.info('\nSuccessfully setup Telegram Webhook!')
  })
