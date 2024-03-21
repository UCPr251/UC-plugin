import { Data, Path, file } from './index.js'
import defaultCfg from '../../../lib/config/config.js'
import UCfetch from '../system/serve.js'
import _ from 'lodash'

/** 各配置数据 */
const CFG = {
  /** config.yaml */
  config: {},
  /** GAconfig.yaml */
  GAconfig: {},
  /** permission.yaml */
  permission: {},
  /** lock.yaml */
  lock: {},
  /** 帮助图html填充数据 */
  helpData: [],
  /** 设置图html填充数据 */
  cfgData: {}
}

/** 实时锅巴信息 */
export let guoba_config = {}

/** 更新锅巴设置填充信息 */
function getNewGuobaConfig() {
  const { config, GAconfig, permission } = CFG
  guoba_config = _.cloneDeep({ config, GAconfig, permission })
  for (const key of Reflect.ownKeys(guoba_config)) {
    for (const _key of Reflect.ownKeys(guoba_config[key])) {
      if (_.isPlainObject(guoba_config[key][_key])) {
        for (const _key_ of Reflect.ownKeys(guoba_config[key][_key])) {
          if (_.isPlainObject(guoba_config[key][_key][_key_]) && Reflect.has(guoba_config[key][_key][_key_], 'isM')) {
            const power = _.keys(_.pickBy(guoba_config[key][_key][_key_], _.identity))
            guoba_config[key][_key][_key_] = { power }
          }
        }
      }
    }
  }
}

const cfgMap = new Map()
cfgMap.set(1, 'config.yaml')
cfgMap.set(2, 'GAconfig.yaml')
cfgMap.set(3, 'permission.yaml')
cfgMap.set(4, 'lock.yaml')
cfgMap.set(5, 'help.js')
cfgMap.set(6, 'cfg.js')

/** 更新设置数据 */
function getConfig(mode) {
  const sp = cfgMap.get(mode).split('.')
  const key = sp.join('')
  if (mode <= 4) {
    CFG[sp[0]] = file.YAMLreader(Path[key])
  } else {
    import(`file:///${Path[key]}?${Date.now()}`).then(res => (CFG[`${sp[0]}Data`] = res.default))
  }
}

/** 更新设置 */
function getNewConfig(mode) {
  if (mode) {
    getConfig(mode)
    if (mode <= 3) getNewGuobaConfig()
    return log.whiteblod(`修改设置文件${cfgMap.get(mode)}`)
  }
  for (const i of _.range(1, 7)) getConfig(i)
  getNewGuobaConfig()
}

/** 系统数据 */
class UCPr {
  constructor() {
    /** UCPr */
    this.Author = Path.Author
    /** UC-plugin */
    this.Plugin_Name = Path.Plugin_Name
    /** 数据状态 */
    this.status = false
    /** 各配置数据 */
    this.CFG = CFG
    /** 数据更新函数 5：help.js 6：cfg.js */
    this.getConfig = getConfig
    /** 公共函数 */
    this.function = {}
    /** 公共数据 */
    this.temp = {}
    /** 事件监听器 */
    this.event = {
      'message.group': [],
      'message.private': [],
      'notice.group': [],
      'request.group': []
    }
    /** 文件监听器{ path: watcher } */
    this.watcher = {}
    /** cron任务管理器[ { cron, fnc, name, job } ] */
    this.task = []
    /** proxy代理管理器{ name: new Proxy() } */
    this.proxy = {}
    /** hook管理器 */
    this.hook = []
    /** 群原始配置 */
    this.group_CFG = {}
    /** package.json */
    this.package = {}
    /** 因锁定被移除的功能的数据 */
    this.removedFncData = {}
    /** 签名崩溃检测计时器 */
    this.intervalId = null
    /** 伪装数据 */
    this.wz = {}
  }

  /** 初始化数据 */
  async init() {
    if (this.status) return log.debug('UCPr已就绪，跳过本次初始化')
    this.package = file.JSONreader(Path.packagejson)
    getNewConfig()
    Data.watch(Path.configyaml, () => getNewConfig(1))
    Data.watch(Path.GAconfigyaml, () => getNewConfig(2))
    Data.watch(Path.permissionyaml, () => getNewConfig(3))
    Data.watch(Path.lockyaml, () => getNewConfig(4))
    const yamls = file.readdirSync(Path.groupCfg, { type: '.yaml' })
    const config = _.cloneDeep(this.CFG.config)
    const { GAconfig } = this.CFG
    const removes = ['qsignRestart', 'JSsystem']
    for (const key in config) {
      if (!_.isPlainObject(config[key]) || removes.includes(key)) {
        delete config[key]
      }
    }
    for (const yaml of yamls) {
      const yamlPath = Path.get('groupCfg', yaml)
      const groupCFGData = file.YAMLreader(yamlPath)
      const name = Path.parse(yaml).name
      this.group_CFG[name] = groupCFGData
      Data.watch(yamlPath, () => {
        this.group_CFG[name] = file.YAMLreader(yamlPath)
        log.whiteblod(`修改群设置文件${yaml}`)
      })
      // 合并筛选新增配置
      const usefulData = Data.mergeCfg(groupCFGData, {
        config, GAconfig, permission: { Master: [], Admin: [], BlackQQ: [] }
      })
      if (!_.isEqual(groupCFGData, usefulData)) {
        setTimeout(() => file.YAMLsaver(yamlPath, usefulData), 100)
      }
    }
    const watcher = await Data.watchDir(Path.groupCfg, (yamlPath) => {
      const { name, base } = Path.parse(yamlPath)
      this.group_CFG[name] = file.YAMLreader(yamlPath)
      log.whiteblod(`新增群设置文件${base}`)
      Data.watch(yamlPath, () => {
        this.group_CFG[name] = file.YAMLreader(yamlPath)
        log.whiteblod(`修改群设置文件${base}`)
      })
    })
    if (!_.isBoolean(watcher)) {
      watcher.on('unlink', (yamlPath) => {
        const { name, base } = Path.parse(yamlPath)
        delete this.group_CFG[name]
        this.watcher[yamlPath].close()
        log.whiteblod(`删除群设置文件${base}`)
      })
    } else {
      log.error('监听groupCfg群设置文件夹错误，文件夹不存在')
    }
    if (this.isWatch) {
      Data.watch(Path.helpjs, () => getNewConfig(5))
      Data.watch(Path.cfgjs, () => getNewConfig(6))
    }
    this.status = true
  }

  /** 注册监听事件 */
  EventInit(EventClass) {
    if (!EventClass?.prototype) return
    const app = new EventClass()
    let { event, name, rule, sub_type } = app
    const sp = event.split('.')
    if (sp.length === 3) {
      sub_type = sp.pop()
      event = sp.join('.')
    }
    const events = this.event[event]
    if (!events) {
      if (event !== 'message') return log.warn('错误的监听事件：' + event)
      Data.remove(this.event['message.group'], name, 'name')
      Data.remove(this.event['message.private'], name, 'name')
    } else {
      Data.remove(events, name, 'name')
    }
    log.debug(`注册${event}.${sub_type ||= 'all'}监听事件：${name}`)
    app.init && app.init()
    const data = {
      name,
      class: EventClass,
      rule,
      sub_type,
      accept: !!app.accept
    }
    if (event === 'message') { // 特殊处理message.all事件
      this.event['message.group'].push(data)
      this.event['message.private'].push(data)
    } else {
      events.push(data)
    }
  }

  /**
   * @param {string} urlCode url代号
   * @param {...any} parameters 参数
   * @returns Fetch result
   */
  async fetch(urlCode, ...parameters) {
    return UCfetch.call(this, urlCode, parameters)
  }

  /** 群配置 */
  groupCFG(groupId) {
    if (!this.group_CFG[groupId]) return this.defaultCFG
    return _.merge({}, this.group_CFG[groupId], this.CFG.lock)
  }

  /** UC插件版本 */
  get version() {
    return this.package.version
  }

  /** URL */
  get authorUrl() {
    return this.package.author?.url ?? 'https://gitee.com/UCPr251'
  }

  /** UC插件URL */
  get repoUrl() {
    return this.package.repository?.url ?? 'https://gitee.com/UCPr251/UC-plugin'
  }

  /** 默认所有全局配置 */
  get defaultCFG() {
    const { config, GAconfig } = this.CFG
    return { config, GAconfig }
  }

  /** config.yaml */
  get config() {
    return this.CFG.config || {}
  }

  /** GAconfig.yaml */
  get GAconfig() {
    return this.CFG.GAconfig || {}
  }

  /** permission.yaml */
  get permission() {
    return this.CFG.permission || {}
  }

  /** lock.yaml */
  get lock() {
    return this.CFG.lock || {}
  }

  /** 机器人本体设置 */
  get defaultCfg() {
    return defaultCfg || {}
  }

  /** 是否合并机器人主人和插件主人 */
  get isDefaultMaster() {
    return this.config.isDefaultMaster ?? true
  }

  /** 是否每日零点前自动备份云崽和插件数据 */
  get autoBackup() {
    return this.config.autoBackup ?? false
  }

  /** 是否仅主人可操作 */
  get onlyMaster() {
    return this.config.onlyMaster ?? false
  }

  /** 开发模式使用，热更新apps等数据 */
  get isWatch() {
    return this.config.isWatch ?? false
  }

  /** 插件优先级 */
  get priority() {
    return this.config.priority ?? 251
  }

  /** 选择服务 */
  get server() {
    return this.config.server ?? 2
  }

  /** 设置的Bot名称 */
  get BotName() {
    return this.config.BotName || Bot.nickname
  }

  /** 全局开关响应前缀，BotName+前缀即可触发，用于避免与其他机器人冲突 */
  get globalPrefix() {
    return this.config.globalPrefix ?? false
  }

  /** 过码剩余次数提醒预警值 */
  get loveMysNotice() {
    return this.config.loveMysNotice ?? 50
  }

  /** 部分功能不指定年份时默认补全年份 */
  get defaultYear() {
    return new Date().getFullYear()
  }

  get emptyStr() {
    return '无'
  }

  /** 用户无权限回复 */
  get noPerReply() {
    return this.config.noPerReply ?? '无权限'
  }

  /** Bot无权限回复 */
  get noPowReply() {
    return this.config.noPowReply ?? '主淫，小的权限不足，无法执行该操作嘤嘤嘤~'
  }

  /** api连接失败回复 */
  get fetchErrReply() {
    return this.config.fetchErrReply ?? 'API连接失败，请稍后或切换服务后重试'
  }

  /** 指定群主人对象 */
  get Master() {
    return this.permission.Master ?? {}
  }

  /** 全局主人列表 */
  get GlobalMaster() {
    if (!this.isDefaultMaster) return this.permission.GlobalMaster
    return _.uniq(this.defaultCfg.masterQQ.concat(this.permission.GlobalMaster)).map(Number)
  }

  /** 指定群管理对象 */
  get Admin() {
    return this.permission.Admin ?? {}
  }

  /** 全局管理列表 */
  get GlobalAdmin() {
    return this.permission.GlobalAdmin ?? []
  }

  /** 黑名单对象 */
  get BlackQQ() {
    return this.permission.BlackQQ ?? {}
  }

  /** 全局黑名单列表 */
  get GlobalBlackQQ() {
    return this.permission.GlobalBlackQQ ?? []
  }

  /** 是否输出日志 */
  get log() {
    return this.config.log ?? true
  }

  /** 是否输出debug日志 */
  get debugLog() {
    return this.config.debugLog ?? false
  }

  /** 机器人qq号 */
  get qq() {
    return Number(Bot.uin ?? this.defaultCfg.qq)
  }

  /** 签名自动重启设置 */
  get qsignRestart() {
    return this.config.qsignRestart ?? {}
  }

  /** 开关Bot设置 */
  get switchBot() {
    return this.config.switchBot ?? {}
  }

  /** 戳一戳设置 */
  get chuoyichuo() {
    return this.config.chuoyichuo ?? {}
  }

  /** 随机老婆设置 */
  get randomWife() {
    return this.config.randomWife ?? {}
  }

  /** 随机群友设置 */
  get randomMember() {
    return this.config.randomMember ?? {}
  }

  /** 直播推送设置 */
  get BlivePush() {
    return this.config.BlivePush ?? {}
  }

  /** 放大图片设置 */
  get bigjpg() {
    return this.config.bigjpg ?? {}
  }

  /** 群撤回设置 */
  get recall() {
    return this.GAconfig.recall ?? {}
  }

  /** 群禁言设置 */
  get mute() {
    return this.GAconfig.mute ?? {}
  }

  /** 群踢人设置 */
  get kick() {
    return this.GAconfig.kick ?? {}
  }

}

export default new UCPr()