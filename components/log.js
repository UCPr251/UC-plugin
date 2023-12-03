import { UCPr, Data, common } from './index.js'
import chalk from 'chalk'

function getFncChain(error) {
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
  return '←' + fncChain.join('←')
}

/** 输出调试日志 */
const log = {
  /** 普通红色 */
  red(...log) {
    logger.mark(chalk.red('[UC]' + common.toString(log, true, '，')))
  },

  /** 全局logger.mark方法 */
  mark(...log) {
    logger.mark('[UC]' + common.toString(log, true, '，'))
  },

  /** debug */
  debug(log, chain = false) {
    if (UCPr.debugLog || UCPr.isWatch) {
      let ext = ''
      if (chain) {
        const error = new Error()
        ext = getFncChain(error)
      }
      this.yellow('[debug]' + ext + common.toString(log))
    }
  },

  /** 警告信息 */
  warn(...log) {
    logger.warn(chalk.yellow('[UC][Warn]' + common.toString(log, true)))
    return false
  },

  /** 红色报错输出，同时增加报错日志 */
  error(...log) {
    const error = new Error()
    const fncChain = getFncChain(error)
    log = fncChain + common.toString(log, true)
    logger.error(chalk.red('[UC][error]←' + log))
    Data.error(log)
    return false
  },

  /** 普通紫色 */
  purple(...log) {
    if (UCPr.log) {
      logger.mark(logger.magenta('[UC]' + common.toString(log, true, '，')))
    }
  },

  /** 普通黄色 */
  yellow(...log) {
    if (UCPr.log) {
      logger.mark(chalk.yellow('[UC]' + common.toString(log, true, '，')))
    }
  },

  /** 普通蓝色 */
  blue(...log) {
    if (UCPr.log) {
      logger.mark(chalk.blue('[UC]' + common.toString(log, true, '，')))
    }
  },

  /** 蓝色加粗 */
  bluebold(...log) {
    logger.mark(chalk.blue.bold('[UC]' + common.toString(log, true, '，')))
  },

  /** 普通白色 */
  white(...log) {
    if (UCPr.log) {
      logger.mark('[UC]' + common.toString(log, true, ''))
    }
  },

  /** 白色加粗 */
  whiteblod(...log) {
    if (UCPr.log) {
      logger.mark(chalk.bold('[UC]' + common.toString(log, true, '，')))
    }
  }
}

export default log