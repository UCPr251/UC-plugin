import defaultCfg from '../../../lib/config/config.js'
import UCfetch from '../defSet/system/serve.js'
import chokidar from 'chokidar'
import file from './file.js'
import Path from './Path.js'
import _ from 'lodash'

const Plugin_Name = 'UC-plugin'

/** config.yaml */
let config = {}
/** permission.yaml */
let permission = {}

/** 实时锅巴信息 */
export let now_config = {}

/** 获取锅巴配置填充信息 */
function getNewGuobaConfig() {
  now_config = _.merge({}, config, permission)
  now_config.Master = _.sortBy(now_config.Master).join('，')
  now_config.BlackQQ = _.sortBy(now_config.BlackQQ).join('，')
  now_config.WhiteQQ = _.sortBy(now_config.WhiteQQ).join('，')
}

function getConfig(mode) {
  switch (mode) {
    case 1: return file.YAMLreader(Path.configyaml)
    case 2: return file.YAMLreader(Path.permissionyaml)
    default: return {}
  }
}

/** 更新配置 */
function getNewConfig(mode) {
  if (mode) {
    let file
    switch (mode) {
      case 1: {
        config = getConfig(1)
        file = 'config.yaml'
        break
      }
      case 2: {
        permission = getConfig(2)
        file = 'permission.yaml'
        break
      }
      default: break
    }
    logger.info(`[UC]修改配置文件${file}`)
    getNewGuobaConfig()
    return
  }
  config = getConfig(1)
  permission = getConfig(2)
}

function watch(path, mode) {
  const watcher = chokidar.watch(path)
  watcher.on('change', () => getNewConfig(mode))
}

watch(Path.configyaml, 1)
watch(Path.permissionyaml, 2)

/** 系统配置信息 */
const UCPr = {
  /** UC-plugin */
  Plugin_Name,
  /** UCPr */
  Author: 'UCPr',
  /** 错误回复 */
  error: '未知错误，请查看错误日志',

  /** 初始化数据 */
  init: () => {
    getNewConfig()
    getNewGuobaConfig()
  },

  /**
   * @param {string} urlCode url代号
   * @param {...any} parameters 参数
   * @returns Fetch result
   */
  async fetch(urlCode, ...parameters) {
    return await UCfetch.call(this, urlCode, parameters)
  },

  /** config.yaml */
  get config() {
    return config
  },

  /** permission.yaml */
  get permission() {
    return permission
  },

  /** 机器人配置 */
  get defaultCfg() {
    return defaultCfg ?? {}
  },

  /** 是否合并机器人主人和插件主人 */
  get isDefaultMaster() {
    return this.config.isDefaultMaster ?? true
  },

  /** 是否仅主人可操作 */
  get onlyMaster() {
    return this.config.onlyMaster ?? false
  },

  /** 仅主人可操作时，对本拥有权限的管理的回复 */
  get onlyMasterReply() {
    return this.config.onlyMasterReply ?? '当前仅主人可操作'
  },

  /** 插件优先级 */
  get priority() {
    return this.config.priority ?? 251
  },

  /** 选择服务 */
  get server() {
    return this.config.server ?? 1
  },

  /** Bot名称 */
  get BotName() {
    return this.config.BotName || Bot.nickname
  },

  /** 过码剩余次数提醒预警值 */
  get loveMysNotice() {
    return this.config.loveMysNotice ?? 50
  },

  /** 用户无权限回复 */
  get noPerReply() {
    return this.config.noPerReply ?? '无权限'
  },

  /** Bot无权限回复 */
  get noPowReply() {
    return this.config.noPowReply ?? '主淫，小的权限不足，无法执行该操作嘤嘤嘤~'
  },

  /** api连接失败回复 */
  get fetchErrReply() {
    return this.config.fetchErrReply ?? '连接失败，请稍后重试'
  },

  /** 主人列表 */
  get Master() {
    if (!this.isDefaultMaster) return this.permission.Master
    return (Array.from(new Set(this.defaultCfg.masterQQ.concat(this.permission.Master)))).map(Number)
  },

  /** 管理对象 */
  get Admin() {
    return this.permission.Admin
  },

  /** 管理列表 */
  get AdminArr() {
    return (Object.keys(this.permission.Admin)).map(Number)
  },

  /** 黑名单列表 */
  get BlackQQ() {
    return this.permission.BlackQQ ?? []
  },

  /** 白名单列表 */
  get WhiteQQ() {
    return this.permission.WhiteQQ ?? []
  },

  /** 是否输出日志 */
  get log() {
    return this.config.log ?? true
  },

  /** 机器人qq */
  get qq() {
    return Bot.uin ?? this.defaultCfg.qq
  },

  /** 签名自动重启配置 */
  get qsignRestart() {
    return this.config.qsignRestart ?? {}
  },

  /** 直播推送配置 */
  get BlivePush() {
    return this.config.BlivePush ?? {}
  },

  /** 放大图片配置 */
  get bigjpg() {
    return this.config.bigjpg ?? {}
  },

  /** 开关Bot配置 */
  get switchBot() {
    return this.config.switchBot ?? {}
  },

  /** 戳一戳配置 */
  get chuoyichuo() {
    return this.config.chuoyichuo ?? {}
  },

  /** 随机老婆配置 */
  get randomWife() {
    return this.config.randomWife ?? {}
  }

}

export default UCPr