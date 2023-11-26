import { Data, Path, file } from './index.js'
import defaultCfg from '../../../lib/config/config.js'
import UCfetch from '../defSet/system/serve.js'
import _ from 'lodash'

const Plugin_Name = 'UC-plugin'

/** config.yaml */
let config = {}
/** GAconfig.yaml */
let GAconfig = {}
/** permission.yaml */
let permission = {}

/** 实时锅巴信息 */
let guoba_config = {}
/** 帮助图html填充数据 */
let helpData = []
/** 设置图html填充数据 */
let cfgData = {}

export { guoba_config, helpData, cfgData }

/** 排序、转换 */
function transform(path) {
  guoba_config.permission[path] = _.sortBy(guoba_config.permission[path]).join('，')
}

/** 更新锅巴设置填充信息 */
function getNewGuobaConfig() {
  guoba_config = _.cloneDeep({ config, GAconfig, permission })
  transform('Master')
  transform('BlackQQ')
  transform('WhiteQQ')
  // 搜小说分支内容
  if (guoba_config.config.searchNovel?.novelPath) {
    guoba_config.config.searchNovel.novelPath = guoba_config.config.searchNovel.novelPath.join('\n')
  }
}

/** 1：congfig.yaml，2：permission.yaml，3：help.js，4：cfg.js */
function getConfig(mode) {
  switch (mode) {
    case 1: return file.YAMLreader(Path.configyaml)
    case 2: return file.YAMLreader(Path.permissionyaml)
    case 3: return file.YAMLreader(Path.GAconfigyaml)
    case 4: return import(`file:///${Path.helpjs}?${Date.now()}`)
    case 5: return import(`file:///${Path.cfgjs}?${Date.now()}`)
    default: return {}
  }
}

/** 更新设置 */
function getNewConfig(mode) {
  if (mode) {
    let file
    switch (mode) {
      case 1: {
        config = getConfig(1)
        file = 'config.yaml'
        getNewGuobaConfig()
        break
      }
      case 2: {
        permission = getConfig(2)
        file = 'permission.yaml'
        getNewGuobaConfig()
        break
      }
      case 3: {
        GAconfig = getConfig(3)
        file = 'GAconfig.js'
        getNewGuobaConfig()
        break
      }
      case 4: {
        getConfig(4).then(res => (helpData = res.default))
        file = 'help.js'
        break
      }
      case 5: {
        getConfig(5).then(res => (cfgData = res.default))
        file = 'cfg.js'
        break
      }
      default: break
    }
    log.whiteblod(`修改设置文件${file}`)
    return
  }
  config = getConfig(1)
  permission = getConfig(2)
  GAconfig = getConfig(3)
  getConfig(4).then(res => (helpData = res.default))
  getConfig(5).then(res => (cfgData = res.default))
  getNewGuobaConfig()
}

/** 系统数据 */
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
    Data.watch(Path.configyaml, () => getNewConfig(1))
    Data.watch(Path.permissionyaml, () => getNewConfig(2))
    Data.watch(Path.GAconfigyaml, () => getNewConfig(3))
    if (UCPr.isWatch) {
      Data.watch(Path.helpjs, () => getNewConfig(4))
      Data.watch(Path.cfgjs, () => getNewConfig(5))
    }
  },

  /**
   * @param {string} urlCode url代号
   * @param {...any} parameters 参数
   * @returns Fetch result
   */
  async fetch(urlCode, ...parameters) {
    return await UCfetch.call(this, urlCode, parameters)
  },

  /** 挂载临时数据，实现数据共享 */
  temp: {
    /** 签名崩溃检测计时器 */
    intervalId: null
  },

  /** config.yaml */
  get config() {
    return config
  },

  /** GAconfig.yaml */
  get GAconfig() {
    return GAconfig
  },

  /** permission.yaml */
  get permission() {
    return permission
  },

  /** 机器人设置 */
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

  /** 开发模式使用，热更新apps等数据 */
  get isWatch() {
    return this.config.isWatch ?? false
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
    return _.uniq(this.defaultCfg.masterQQ.concat(this.permission.Master)).map(Number)
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

  /** 是否输出debug日志 */
  get debugLog() {
    return this.config.debugLog ?? false
  },

  /** 机器人qq */
  get qq() {
    return Bot.uin ?? this.defaultCfg.qq
  },

  /** 签名自动重启设置 */
  get qsignRestart() {
    return this.config.qsignRestart ?? {}
  },

  /** 直播推送设置 */
  get BlivePush() {
    return this.config.BlivePush ?? {}
  },

  /** 放大图片设置 */
  get bigjpg() {
    return this.config.bigjpg ?? {}
  },

  /** 开关Bot设置 */
  get switchBot() {
    return this.config.switchBot ?? {}
  },

  /** 戳一戳设置 */
  get chuoyichuo() {
    return this.config.chuoyichuo ?? {}
  },

  /** 随机老婆设置 */
  get randomWife() {
    return this.config.randomWife ?? {}
  },

  /** 随机群友设置 */
  get randomMember() {
    return this.config.randomMember ?? {}
  }

}

export default UCPr