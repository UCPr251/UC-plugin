import common from './common.js'
import Path from './Path.js'
import chalk from 'chalk'

function getFncChain(error) {
  if (!error?.stack) return '[Empty Error Stack]'
  const callerName = decodeURI(error.stack).split('\n').slice(1)
  const fncChain = callerName.map(line => {
    line = line.trim()
    const sp = line.split(' ')
    if (sp.length < 2 || sp.length > 3) return line
    const fncName = sp.length === 3 ? '.' + sp[1].split('.').at(-1) : ''
    const name = sp.at(-1).split('/').at(-1)
    const extIndex = name.search(/\.js/)
    if (extIndex === -1) return line
    const fncFile = name.slice(0, extIndex)
    const fncLine = name.slice(extIndex + 3).match(/:\d+:\d+/)[0]
    return `[${fncFile}${fncName}${fncLine}]`
  })
  return fncChain.join('←')
}

function transformErrorLog(log) {
  log = log.map(_log => {
    if (_log?.message && _log instanceof Error) {
      return common.toString(_log.message) + '\n' + getFncChain(_log)
    }
    return _log
  })
  return common.toString(log, '\n')
}

const _log = Symbol('log')
const _prefix = Symbol('prefix')
const _debugLog = Symbol('debugLog')

/** 日志class */
const log = {

  chalk,

  /** 转红色 */
  _red: chalk.rgb(251, 50, 50),

  /** 转黄色 */
  _yellow: chalk.rgb(255, 220, 20),

  /** 转蓝色 */
  _blue: chalk.rgb(0, 155, 255),

  /** 转紫色 */
  _purple: chalk.rgb(180, 110, 255),

  /** 日志前缀 */
  get [_prefix]() {
    return Path.prefix
  },

  /** 是否输出一般日志 */
  get [_log]() {
    return global.UCPr?.log ?? true
  },

  /** 是否输出debug日志 */
  get [_debugLog]() {
    return (global.UCPr?.debugLog || global.UCPr?.isWatch) ?? true
  },

  red(...log) {
    this[_log] && logger.mark(this._red(this[_prefix] + common.toString(log)))
  },

  purple(...log) {
    this[_log] && logger.mark(this._purple(this[_prefix] + common.toString(log)))
  },

  yellow(...log) {
    this[_log] && logger.mark(this._yellow(this[_prefix] + common.toString(log)))
  },

  blue(...log) {
    this[_log] && logger.mark(this._blue(this[_prefix] + common.toString(log)))
  },

  bluebold(...log) {
    this[_log] && logger.mark(this._blue.bold(this[_prefix] + common.toString(log)))
  },

  white(...log) {
    this[_log] && logger.mark(this[_prefix] + common.toString(log))
  },

  whiteblod(...log) {
    this[_log] && logger.mark(chalk.bold(this[_prefix] + common.toString(log)))
  },

  debug(...log) {
    this[_debugLog] && logger.mark(this._yellow(this[_prefix] + '[debug]' + common.toString(log)))
  },

  warn(...log) {
    logger.warn(this._yellow(this[_prefix] + '[warn]' + transformErrorLog(log)))
    return false
  },

  error(...log) {
    const errorLogInfo = transformErrorLog(log)
    logger.error(this._red(this[_prefix] + '[error]' + errorLogInfo))
    this.writeErrLogFnc?.(errorLogInfo)
    return errorLogInfo
  },

  mark(...log) {
    logger.mark(this[_prefix] + common.toString(log))
  },

  info(...log) {
    logger.info(this[_prefix] + common.toString(log))
  }
}

export default log