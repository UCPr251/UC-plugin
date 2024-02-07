import { UCPr, Data, common, Path } from './index.js'
import chalk from 'chalk'

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

const prefix = '[UC]'

/** 输出日志 */
const log = {
  red() {
    logger.mark(chalk.red(prefix + common.toString(Array.from(arguments))))
  },

  mark(...log) {
    logger.mark(prefix + common.toString(log))
  },

  /** debug */
  debug(...log) {
    if (UCPr.debugLog || UCPr.isWatch) {
      this.yellow('[debug]' + common.toString(log))
    }
  },

  warn(...log) {
    logger.warn(chalk.yellow(prefix + '[Warn]' + common.toString(log)))
    return false
  },

  error(...log) {
    log = log.map(_log => {
      if (_log?.message) {
        return common.toString(_log.message) + '\n' + getFncChain(_log)
      }
      return _log
    })
    log = common.toString(log, '\n')
    logger.error(chalk.red(prefix + '[error]' + log))
    Data.addLog(Path.errorLogjson, log)
    return log
  },

  purple(...log) {
    if (UCPr.log) {
      logger.mark(logger.magenta(prefix + common.toString(log)))
    }
  },

  yellow(...log) {
    if (UCPr.log) {
      logger.mark(chalk.yellow(prefix + common.toString(log)))
    }
  },

  blue(...log) {
    if (UCPr.log) {
      logger.mark(chalk.blue(prefix + common.toString(log)))
    }
  },

  bluebold(...log) {
    logger.mark(chalk.blue.bold(prefix + common.toString(log)))
  },

  white(...log) {
    if (UCPr.log) {
      logger.mark(prefix + common.toString(log))
    }
  },

  whiteblod(...log) {
    if (UCPr.log) {
      logger.mark(chalk.bold(prefix + common.toString(log)))
    }
  }
}

export default log