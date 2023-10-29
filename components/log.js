import chalk from 'chalk'
import { UCPr, Data } from './index.js'

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

  /** 红色报错输出，同时增加报错日志 */
  error(...log) {
    logger.error('[UC]' + log.map(v => {
      if (typeof v === 'string' || typeof v === 'number') {
        return v
      }
      return JSON.stringify(v, null, 2)
    }).join('\n'))
    Data.error(log)
  },

  /** 普通紫色 */
  purple(...log) {
    if (UCPr.log) {
      logger.info(logger.magenta('[UC]' + log.join()))
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