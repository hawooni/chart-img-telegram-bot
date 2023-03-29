import log from './logger'
import get from 'lodash.get'
import omit from 'lodash.omit'

import config from '../../config.json' assert { type: 'json' }

import {
  intervals,
  getTradingViewAdvancedChartRESTv1,
  postTradingViewAdvancedChartRESTv2,
} from '../helper/chartimg'

import {
  InvalidSymbolError,
  InvalidIntervalError,
  InvalidConfigError,
  InvalidRequestError,
  UnauthorizedRequestError,
  UnprocessableRequestError,
  TooManyRequestError,
  RequestError,
} from '../error'

/**
 * @param {String} text eg. /chart binance:btcusdt 4h, /crypto, /nasdaq
 * @param {String} splitBy
 * @returns {Object} eg. { symbol: 'BINANCE:BTCUSDT', interval: '4h' }
 */
export function getQueryByCmdText(text, splitBy = ' ') {
  const [cmdKey, symbol, interval] = text.split(splitBy)
  const query = {}

  if (symbol) {
    if (config.version === 2 && !symbol.includes(':')) {
      throw new InvalidSymbolError(symbol)
    }

    query.symbol = symbol.toUpperCase()
  }

  if (interval) {
    if (intervals.includes(interval)) {
      query.interval = interval
    } else {
      throw new InvalidIntervalError(interval)
    }
  }

  // if cmdKey does not have input symbols, assign default symbol
  if (!symbol && !config[cmdKey].inputs) {
    query.symbol = config[cmdKey].default.symbol
  }

  return query
}

/**
 * supported data query keys => 'interval=', 'symbol=', 'inputs[row][column]'
 *
 * @param {String} data
 * @param {String} splitBy
 * @returns {Object}
 */
export function getQueryByCallbackData(data, splitBy = '|') {
  const splits = data.split(splitBy) // version|/cmdKey|cmdParam|...
  const cmdKey = splits[1]
  const query = {}

  splits.slice(3).forEach((dValue) => {
    if (dValue.startsWith('interval=')) {
      query.interval = dValue.split('=')[1]
    } else if (dValue.startsWith('symbol=')) {
      query.symbol = dValue.split('=')[1]
    } else if (
      dValue.startsWith('inputs[') &&
      dValue.includes('][') &&
      dValue.endsWith(']')
    ) {
      Object.assign(query, get(config, `${cmdKey}.${dValue}`)) // eg. config.chart.inputs[0][1]
      query.inputs = getInLineKeyInputIndex(dValue)
    } else {
      log.warn(`${dValue} is not supported callback data`)
    }
  })

  return query
}

/**
 * get chart-img advanced chart
 *
 * @param {String} apiKey
 * @param {Object} chartQuery
 * @returns {Promise} Blob
 */
export async function getChartImgPhoto(apiKey, chartQuery) {
  if (config.version === 1) {
    const response = await getTradingViewAdvancedChartRESTv1(apiKey, chartQuery)
    const resStatus = response.status

    if (resStatus === 200) {
      return new Blob([await response.arrayBuffer()], {
        type: 'application/octet-stream',
      })
    } else {
      const payload = await response.json()

      if (resStatus === 400) {
        throw new InvalidRequestError()
      } else if (resStatus === 403) {
        throw new UnauthorizedRequestError(payload.message)
      } else if (resStatus === 422) {
        throw new UnprocessableRequestError(payload.error)
      } else if (resStatus === 429) {
        throw new TooManyRequestError(payload.message)
      } else {
        throw new RequestError(payload.message, resStatus)
      }
    }
  } else if (config.version === 2) {
    const response = await postTradingViewAdvancedChartRESTv2(
      apiKey,
      chartQuery
    )
    const resStatus = response.status

    if (resStatus === 200) {
      return new Blob([await response.arrayBuffer()], {
        type: 'application/octet-stream',
      })
    } else {
      const payload = await response.json()

      if (resStatus === 400) {
        throw new InvalidRequestError()
      } else if (resStatus === 403) {
        throw new UnauthorizedRequestError(payload.message)
      } else if (resStatus === 422) {
        throw new UnprocessableRequestError(payload.message)
      } else if (resStatus === 429) {
        throw new TooManyRequestError(payload.message)
      } else {
        throw new RequestError(payload.message, resStatus)
      }
    }
  } else {
    throw new InvalidConfigError()
  }
}

/**
 * merge 'config[cmdKey].default' with 'query' for chart-img chart query
 *
 * @param {String} cmdKey
 * @param {Object} query
 * @returns {Object}
 */
export function getChartImgQuery(cmdKey, query) {
  const chartQuery = Object.assign({}, config[cmdKey]?.default) // deep copy config cmdKey default

  Object.assign(chartQuery, omit(query, ['text', 'inputs'])) // merge config chart default with query

  return chartQuery
}

/**
 * @param {String} cmdKey
 * @param {Object} query
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
export function getInitChartInlineKeys(cmdKey, query, includeSymbols = true) {
  const { symbol: qSymbol, interval: qInterval } = query

  const symbol = qSymbol || config[cmdKey].default.symbol
  const interval = qInterval || config[cmdKey].default.interval
  const inputIncludes = config[cmdKey].inputs ? includeSymbols : false

  const inputIntvs = getChartInlineKeyIntervals(cmdKey, symbol, inputIncludes)

  if (inputIncludes) {
    const inputSymbols = getChartInLineKeyInputSymbols(
      cmdKey,
      interval,
      inputIncludes
    )
    return [inputIntvs, ...inputSymbols]
  } else {
    return [inputIntvs]
  }
}

/**
 * @param {String} cmdKey
 * @param {Integer} iRow
 * @param {Integer} iColumn
 * @param {String} interval
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
export function getIndexChartInlineKeys(
  cmdKey,
  iRow,
  iColumn,
  interval,
  includeSymbols = true
) {
  const inputIntvs = getChartInlineKeyInputIntervals(
    cmdKey,
    iRow,
    iColumn,
    includeSymbols
  )

  if (includeSymbols) {
    const inputSymbols = getChartInLineKeyInputSymbols(
      cmdKey,
      interval,
      includeSymbols
    )
    return [inputIntvs, ...inputSymbols]
  } else {
    return [inputIntvs]
  }
}

/**
 * @param {String} cmdKey
 * @param {String} symbol
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
function getChartInlineKeyIntervals(cmdKey, symbol, includeSymbols = true) {
  return config[cmdKey].intervals.map((interval) => {
    return {
      text: interval,
      callback_data: `${config.version}|${cmdKey}|${includeSymbols}|interval=${interval}|symbol=${symbol}`, // must be within 64 byte
    }
  })
}

/**
 * eg. config.chart.inputs[iRow][iColumn]
 *
 * @param {String} cmdKey
 * @param {Integer} iRow
 * @param {Integer} iColumn
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
function getChartInlineKeyInputIntervals(
  cmdKey,
  iRow,
  iColumn,
  includeSymbols = true
) {
  return config[cmdKey].intervals.map((interval) => {
    return {
      text: interval,
      callback_data: `${config.version}|${cmdKey}|${includeSymbols}|interval=${interval}|inputs[${iRow}][${iColumn}]`, // must be within 64 byte
    }
  })
}

/**
 * @param {String} cmdKey
 * @param {String} interval
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
function getChartInLineKeyInputSymbols(
  cmdKey,
  interval,
  includeSymbols = true
) {
  return config[cmdKey].inputs.map((input, iRow) =>
    input.map((query, iColumn) => {
      return {
        text: query.text,
        callback_data: `${config.version}|${cmdKey}|${includeSymbols}|interval=${interval}|inputs[${iRow}][${iColumn}]`, // must be within 64 byte
      }
    })
  )
}

/**
 * @param {String} dValue eg. 'inputs[1][3]'
 * @returns {Object} eg. { row: 1, column: 3 }
 */
function getInLineKeyInputIndex(dValue) {
  const match = dValue.match(/inputs\[(\d+)\]\[(\d+)\]/)

  if (match) {
    return {
      row: parseInt(match[1]),
      column: parseInt(match[2]),
    }
  } else {
    throw Error('Invalid Inputs Format')
  }
}
