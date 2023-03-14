import fs from 'fs'
import toml from 'toml'
import concat from 'concat-stream'

/**
 * @param {String} filePath
 * @param {String} type
 * @returns {Promise}
 */
export default function (filePath = 'wrangler.toml', type = 'utf8') {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, type)

    stream.pipe(concat((data) => resolve(toml.parse(data))))
    stream.on('error', (error) => reject(error))
  })
}
