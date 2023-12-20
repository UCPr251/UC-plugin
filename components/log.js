import { UCPr, Data, common, Path } from './index.js'
import chalk from 'chalk'

function getFncChain(error) {
  if (!error?.stack) return '[Empty Error Stack]'
  const callerName = error.stack.split('\n').slice(2, -2)
  const fncChain = callerName.map(line => {
    const sp = line.trim().split(' ')
    const fncName = sp[1]?.split('.')?.at(-1)
    const name = sp[2]?.split('/')?.at(-1)
    if (!fncName || !name) return ''
    const extIndex = name.match(/\.js/)?.index
    if (!extIndex) return ''
    const fncFile = name.slice(0, extIndex)
    const fncLine = name.slice(extIndex + 2).match(/\d+/)[0]
    return `[${fncFile}.${fncName}:${fncLine}]`
  })
  return fncChain.join('←')
}

/** 输出日志 */
const log = {
  red() {
    logger.mark(chalk.red('[UC]' + common.toString(Array.from(arguments))))
  },

  mark(...log) {
    logger.mark('[UC]' + common.toString(log))
  },

  /** debug */
  debug(...log) {
    if (UCPr.debugLog || UCPr.isWatch) {
      this.yellow('[debug]' + common.toString(log))
    }
  },

  warn(...log) {
    logger.warn(chalk.yellow('[UC][Warn]' + common.toString(log)))
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
    logger.error(chalk.red('[UC][error]' + log))
    Data.addLog(Path.errorLogjson, log)
    return false
  },

  purple(...log) {
    if (UCPr.log) {
      logger.mark(logger.magenta('[UC]' + common.toString(log)))
    }
  },

  yellow(...log) {
    if (UCPr.log) {
      logger.mark(chalk.yellow('[UC]' + common.toString(log)))
    }
  },

  blue(...log) {
    if (UCPr.log) {
      logger.mark(chalk.blue('[UC]' + common.toString(log)))
    }
  },

  bluebold(...log) {
    logger.mark(chalk.blue.bold('[UC]' + common.toString(log)))
  },

  white(...log) {
    if (UCPr.log) {
      logger.mark('[UC]' + common.toString(log))
    }
  },

  whiteblod(...log) {
    if (UCPr.log) {
      logger.mark(chalk.bold('[UC]' + common.toString(log)))
    }
  }
}

export default log