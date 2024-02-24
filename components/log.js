import chalk from 'chalk'
import _ from 'lodash'

function toString(value, sep = '，') {
  if (typeof value === 'string') return value
  if (_.isArray(value)) return value.map(v => toString(v, sep)).join(sep)
  if (_.isPlainObject(value)) return JSON.stringify(value, null, 2)
  return _.toString(value)
}

function getFncChain(error) {
  if (!error?.stack) return '[Empty Error Stack]'
  const callerName = error.stack.split('\n').slice(1, -2)
  const fncChain = callerName.map(line => {
    const sp = line.trim().split(' ')
    const fncName = sp[1]?.split('.')?.at(-1)
    const name = sp[2]?.split('/')?.at(-1)
    if (!fncName || !name) return ''
    const extIndex = name.search(/\.js/)
    if (extIndex === -1) return ''
    const fncFile = name.slice(0, extIndex)
    const fncLine = name.slice(extIndex + 2).match(/:\d+/)[0]
    return `[${fncFile}.${fncName}${fncLine}]`
  })
  return fncChain.join('←')
}

function transformErrorLog(log) {
  log = log.map(_log => {
    if (_log?.message) {
      return toString(_log.message) + '\n' + getFncChain(_log)
    }
    return _log
  })
  return toString(log, '\n')
}

const _UCPr = Symbol('UCPr')
const _Path = Symbol('Path')
const _log = Symbol('log')
const _prefix = Symbol('prefix')
const _debugLog = Symbol('debugLog')

/** 日志class */
class log {
  constructor(UCPr, Path, writeErrLogFnc) {
    this[_UCPr] = UCPr
    this[_Path] = Path
    /** 写入错误日志函数 */
    this.writeErrLogFnc = writeErrLogFnc
    /** 转红色 */
    this._red = chalk.rgb(251, 50, 50)
    /** 转黄色 */
    this._yellow = chalk.rgb(255, 220, 20)
    /** 转蓝色 */
    this._blue = chalk.rgb(0, 155, 255)
    /** 转紫色 */
    this._purple = chalk.rgb(180, 110, 255)
    /** 节流mark */
    // this.whiteT = _.throttle(this.white, 20, { trailing: false })
  }

  /** 日志前缀 */
  get [_prefix]() {
    return this[_Path].prefix
  }

  /** 是否输出一般日志 */
  get [_log]() {
    return this[_UCPr].log
  }

  /** 是否输出debug日志 */
  get [_debugLog]() {
    return this[_UCPr].debugLog || this[_UCPr].isWatch
  }

  red(...log) {
    this[_log] && logger.mark(this._red(this[_prefix] + toString(log)))
  }

  purple(...log) {
    this[_log] && logger.mark(this._purple(this[_prefix] + toString(log)))
  }

  yellow(...log) {
    this[_log] && logger.mark(this._yellow(this[_prefix] + toString(log)))
  }

  blue(...log) {
    this[_log] && logger.mark(this._blue(this[_prefix] + toString(log)))
  }

  bluebold(...log) {
    this[_log] && logger.mark(this._blue.bold(this[_prefix] + toString(log)))
  }

  white(...log) {
    this[_log] && logger.mark(this[_prefix] + toString(log))
  }

  whiteblod(...log) {
    this[_log] && logger.mark(chalk.bold(this[_prefix] + toString(log)))
  }

  debug(...log) {
    this[_debugLog] && logger.mark(this._yellow(this[_prefix] + '[debug]' + toString(log)))
  }

  warn(...log) {
    logger.warn(this._yellow(this[_prefix] + '[warn]' + transformErrorLog(log)))
    return false
  }

  error(...log) {
    const errorLogInfo = transformErrorLog(log)
    logger.error(this._red(this[_prefix] + '[error]' + errorLogInfo))
    this.writeErrLogFnc?.(errorLogInfo)
    return errorLogInfo
  }

  mark(...log) {
    logger.mark(this[_prefix] + toString(log))
  }

  info(...log) {
    logger.info(this[_prefix] + toString(log))
  }
}

export default log