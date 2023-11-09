import chalk from 'chalk'
import { UCPr, Data } from './index.js'

function getFncChain(error) {
  const callerName = error.stack.split('\n').slice(1, -2)
  const fncChain = callerName.map(line => {
    const sp = line.trim().split(' ')
    const fncName = sp[1].split('.').at(-1)
    const name = sp[2].split('/').at(-1)
    const extIndex = name.match(/\.js/).index
    const fncFile = name.slice(0, extIndex)
    const fncLine = name.slice(extIndex + 2).match(/\d+/)[0]
    return `[${fncFile}.${fncName}:${fncLine}]`
  })
  return fncChain.join('←')
}

/** 输出调试日志 */
const log = {
  /** 普通红色 */
  red(...log) {
    logger.info(chalk.red('[UC]' + log.map(v => {
      if (typeof v === 'string' || typeof v === 'number') {
        return v
      }
      return JSON.stringify(v, null, 2)
    }).join('\n')))
  },

  /** debug */
  debug(log, chain = true) {
    if (UCPr.debugLog) {
      let ext = ''
      if (chain) {
        const error = new Error()
        ext = getFncChain(error)
      }
      logger.yellow('[UC][debug]' + ext + log)
    }
  },

  /** 警告信息 */
  warn(...log) {
    logger.warn('[UC]' + log.join())
  },

  /** 红色报错输出，同时增加报错日志 */
  error(...log) {
    const error = new Error()
    const fncChain = getFncChain(error)
    log = fncChain + log.map(v => {
      if (typeof v === 'string' || typeof v === 'number') {
        return v
      }
      return JSON.stringify(v, null, 2)
    }).join('\n')
    logger.error('[UC][error]←' + log)
    Data.error(log)
  },

  /** 普通紫色 */
  purple(...log) {
    if (UCPr.log) {
      logger.info(logger.magenta('[UC]' + log.join()))
    }
  },

  /** 普通黄色 */
  yellow(...log) {
    if (UCPr.log) {
      logger.info(chalk.yellow('[UC]' + log.join()))
    }
  },

  /** 普通蓝色 */
  blue(...log) {
    if (UCPr.log) {
      logger.info(chalk.blue('[UC]' + log.join()))
    }
  },

  /** 蓝色加粗 */
  bluebold(...log) {
    logger.info(chalk.blue.bold('[UC]' + log.join()))
  },

  /** 普通白色 */
  white(...log) {
    if (UCPr.log) {
      logger.info('[UC]' + log.join())
    }
  },

  /** 白色加粗 */
  whiteblod(...log) {
    if (UCPr.log) {
      logger.info(chalk.bold('[UC]' + log.join()))
    }
  }
}

export default log