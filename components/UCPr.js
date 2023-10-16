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
let permissionCfg = {}

/** 实时锅巴信息 */
export let now_config = {}

/** 实时全部配置信息 */
export let ALLCONFIG = {}

/** 将纯粹对象转换为普通属性 */
function transformObj(obj, property) {
  for (let key in obj[property]) {
    obj[property + key] = obj[property][key]
    delete obj[property][key]
  }
  delete obj[property]
  return obj
}

/** 获取锅巴配置填充信息 */
function getNewGuobaConfig() {
  ALLCONFIG = _.merge({}, config, permissionCfg)
  now_config = _.cloneDeep(ALLCONFIG)
  now_config = transformObj(now_config, 'DetecteFloodScreen')
  now_config = transformObj(now_config, 'recall')
  now_config.Master = now_config.Master.join('，')
  // now_config.SuperAdmin = now_config.SuperAdmin.join('，')
  now_config.blackQQ = now_config.blackQQ.join('，')
  now_config.whiteQQ = now_config.whiteQQ.join('，')
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
        permissionCfg = getConfig(2)
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
  permissionCfg = getConfig(2)
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

  /** permissionCfg.yaml */
  get permissionCfg() {
    return permissionCfg
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
  get isMaster() {
    return this.config.isMaster ?? false
  },

  /** 插件优先级 */
  get priority() {
    return this.config.priority ?? 251
  },

  /** 选择服务 */
  get server() {
    return this.config.server ?? 1
  },

  /** 主人列表 */
  get Master() {
    if (!this.isDefaultMaster) return this.permissionCfg.Master
    return (Array.from(new Set(this.defaultCfg.masterQQ.concat(this.permissionCfg.Master)))).map(Number)
  },

  /** 管理对象 */
  get Admin() {
    return this.permissionCfg.Admin
  },

  /** 管理列表 */
  get AdminArr() {
    return (Object.keys(this.permissionCfg.Admin)).map(Number)
  },

  /** 黑名单列表 */
  get blackQQ() {
    return this.permissionCfg.blackQQ
  },

  /** 白名单列表 */
  get whiteQQ() {
    return this.permissionCfg.whiteQQ
  },

  /** 是否输出日志 */
  get log() {
    return this.config.log
  },

  /** 机器人qq */
  get qq() {
    return this.defaultCfg.qq ?? Bot.uin
  }

}

export default UCPr