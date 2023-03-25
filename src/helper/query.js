import log from './logger'
import get from 'lodash.get'
import omit from 'lodash.omit'

import config from '../../config.json' assert { type: 'json' }

import {
  intervals,
  getTradingViewAdvancedChartRESTv1,
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
 * @param {String} text eg. /chart binance:btcusdt 4h
 * @param {String} splitBy
 * @returns {Object} eg. { symbol: 'BINANCE:BTCUSDT', interval: '4h' }
 */
export function getQueryByText(text, splitBy = ' ') {
  const [cmd, symbol, interval] = text.split(splitBy)
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
  const splits = data.split(splitBy)
  const query = {}

  // eg. version|type|typeParm|...
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
      Object.assign(query, get(config, `chart.${dValue}`)) // eg. config.chart.inputs[0][1]
      query.inputs = getInputIndex(dValue)
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
    throw new InvalidConfigError() // todo: implement!
  } else {
    throw new InvalidConfigError()
  }
}

/**
 * merge 'config.chart.default' with 'query' for chart-img chart query
 *
 * @param {Object} query
 * @returns {Object}
 */
export function getChartImgQuery(query) {
  const chartQuery = Object.assign({}, config.chart?.default) // deep copy config chart default

  Object.assign(chartQuery, omit(query, ['text', 'inputs'])) // merge config chart default with query

  return chartQuery
}

/**
 * @param {Object} query
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
export function getInitChartInlineKeys(query, includeSymbols = true) {
  const { symbol: qSymbol, interval: qInterval } = query

  const symbol = qSymbol || config.chart.default.symbol
  const interval = qInterval || config.chart.default.interval

  const inputIntvs = getChartInlineKeyIntervals(symbol, includeSymbols)
  const inputSymbols = getChartInlineKeyInputSymbols(interval, includeSymbols)

  if (includeSymbols) {
    return [inputIntvs, ...inputSymbols]
  } else {
    return [inputIntvs]
  }
}

/**
 * @param {Integer} iRow
 * @param {Integer} iColumn
 * @param {String} interval
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
export function getIndexChartInlineKeys(
  iRow,
  iColumn,
  interval,
  includeSymbols = true
) {
  const inputIntvs = getChartInlineKeyInputIntervals(iRow, iColumn, includeSymbols) // prettier-ignore
  const inputSymbols = getChartInlineKeyInputSymbols(interval, includeSymbols)

  if (includeSymbols) {
    return [inputIntvs, ...inputSymbols]
  } else {
    return [inputIntvs]
  }
}

/**
 * @param {String} symbol
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
function getChartInlineKeyIntervals(symbol, includeSymbols = true) {
  return config.chart.intervals.map((interval) => {
    return {
      text: interval,
      callback_data: `${config.version}|chart|${includeSymbols}|interval=${interval}|symbol=${symbol}`, // must be within 64 byte
    }
  })
}

/**
 * eg. config.chart.inputs[iRow][iColumn]
 *
 * @param {Integer} iRow
 * @param {Integer} iColumn
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
function getChartInlineKeyInputIntervals(iRow, iColumn, includeSymbols = true) {
  return config.chart.intervals.map((interval) => {
    return {
      text: interval,
      callback_data: `${config.version}|chart|${includeSymbols}|interval=${interval}|inputs[${iRow}][${iColumn}]`, // must be within 64 byte
    }
  })
}

/**
 * @param {String} interval
 * @param {Boolean} includeSymbols
 * @returns {Object}
 */
function getChartInlineKeyInputSymbols(interval, includeSymbols = true) {
  return config.chart.inputs.map((input, iRow) =>
    input.map((query, iColumn) => {
      return {
        text: query.text,
        callback_data: `${config.version}|chart|${includeSymbols}|interval=${interval}|inputs[${iRow}][${iColumn}]`, // must be within 64 byte
      }
    })
  )
}

/**
 * @param {String} dValue eg. 'inputs[1][3]'
 * @returns {Object} eg. { row: 1, column: 3 }
 */
function getInputIndex(dValue) {
  const match = dValue.match(/inputs\[(\d+)\]\[(\d+)\]/)

  if (match) {
    return {
      row: parseInt(match[1]),
      column: parseInt(match[2]),
    }
  } else {
    throw Error('Inalid Inputs Format')
  }
}
