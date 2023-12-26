import { Data, Path, file } from './index.js'
import defaultCfg from '../../../lib/config/config.js'
import UCfetch from '../system/serve.js'
import _ from 'lodash'

/** 各配置数据 */
export const CFG = {
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

/** 排序、转换 */
function transform(path) {
  guoba_config.permission[path] = _.sortBy(guoba_config.permission[path]).join('，')
}

/** 更新锅巴设置填充信息 */
function getNewGuobaConfig() {
  const { config, GAconfig, permission } = CFG
  guoba_config = _.cloneDeep({ config, GAconfig, permission })
  transform('GlobalMaster')
  transform('GlobalAdmin')
  transform('GlobalBlackQQ')
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

/** 群配置 */
const groupCFG = {}

/** 系统数据 */
class UCPr {
  constructor(name) {
    /** UCPr */
    this.Author = 'UCPr'
    /** Plugin_Name */
    this.Plugin_Name = name
    /** 数据状态 */
    this.status = false
    /** 事件监听器 */
    this.event = {
      'message.group': [],
      'message.all': [],
      'notice.group': [],
      'request.group': []
    }
    /** 文件监听器{ path: watcher } */
    this.watcher = {}
    /** cron定时任务[ { cron, fnc, name, job } ] */
    this.task = []
    /** 签名崩溃检测计时器 */
    this.intervalId = null
  }

  /** 初始化数据 */
  async init() {
    getNewConfig()
    Data.watch(Path.configyaml, () => getNewConfig(1))
    Data.watch(Path.GAconfigyaml, () => getNewConfig(2))
    Data.watch(Path.permissionyaml, () => getNewConfig(3))
    Data.watch(Path.lockyaml, () => getNewConfig(4))
    const yamls = file.readdirSync(Path.groupCfg, { type: '.yaml' })
    const config = _.cloneDeep(CFG.config)
    const { GAconfig } = CFG
    for (const key in config) {
      if (!_.isPlainObject(config[key])) {
        delete config[key]
      }
    }
    for (const yaml of yamls) {
      const yamlPath = Path.get('groupCfg', yaml)
      const groupCFGData = file.YAMLreader(yamlPath)
      const name = Path.parse(yaml).name
      groupCFG[name] = groupCFGData
      Data.watch(yamlPath, () => {
        groupCFG[name] = file.YAMLreader(yamlPath)
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
      groupCFG[name] = file.YAMLreader(yamlPath)
      log.whiteblod(`新增群设置文件${base}`)
      Data.watch(yamlPath, () => {
        groupCFG[name] = file.YAMLreader(yamlPath)
        log.whiteblod(`修改群设置文件${base}`)
      })
    })
    if (!_.isBoolean(watcher)) {
      watcher.on('unlink', (yamlPath) => {
        const { name, base } = Path.parse(yamlPath)
        delete groupCFG[name]
        this.temp.watcher[yamlPath].close()
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

  /**
   * @param {string} urlCode url代号
   * @param {...any} parameters 参数
   * @returns Fetch result
   */
  async fetch(urlCode, ...parameters) {
    return await UCfetch.call(this, urlCode, parameters)
  }

  /** 注册监听事件 */
  EventInit(EventClass) {
    const app = new EventClass({})
    const events = this.event[app.event]
    if (!events) {
      return log.warn('错误的监听事件：' + app.event)
    }
    Data.remove(events, app.name, 'name')
    log.debug(`注册${app.event}监听事件：${app.name}`)
    app.init && app.init()
    events.push({
      name: app.name,
      class: EventClass,
      rule: app.rule,
      sub_type: app.sub_type,
      accept: !!app.accept
    })
  }

  /** 群配置 */
  groupCFG(groupId) {
    if (!groupCFG[groupId]) return this.defaultCFG
    return _.merge({}, groupCFG[groupId], CFG.lock)
  }

  /** package.json */
  get package() {
    return file.JSONreader(Path.get('UC', 'package.json'))
  }

  /** UC插件版本 */
  get version() {
    return this.package.version
  }

  /** URL */
  get authorUrl() {
    return this.package.author.url
  }

  /** UC插件URL */
  get repoUrl() {
    return this.package.repository.url
  }

  /** 默认所有全局配置 */
  get defaultCFG() {
    const { config, GAconfig } = CFG
    return { config, GAconfig }
  }

  /** config.yaml */
  get config() {
    return CFG.config || {}
  }

  /** GAconfig.yaml */
  get GAconfig() {
    return CFG.GAconfig || {}
  }

  /** permission.yaml */
  get permission() {
    return CFG.permission || {}
  }

  /** lock.yaml */
  get lock() {
    return CFG.lock || {}
  }

  /** 机器人设置 */
  get defaultCfg() {
    return defaultCfg || {}
  }

  /** 是否合并机器人主人和插件主人 */
  get isDefaultMaster() {
    return this.config.isDefaultMaster ?? true
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
    return this.config.server ?? 1
  }

  /** 设置的Bot名称 */
  get BotName() {
    return this.config.BotName || Bot.nickname
  }

  /** 过码剩余次数提醒预警值 */
  get loveMysNotice() {
    return this.config.loveMysNotice ?? 50
  }

  /** UC插件部分功能不指定年份时默认补全年份 */
  get defaultYear() {
    return this.config.defaultYear ?? 2023
  }

  /** 用户无权限回复 */
  get noPerReply() {
    return this.config.noPerReply ?? '无权限或权限不足'
  }

  /** Bot无权限回复 */
  get noPowReply() {
    return this.config.noPowReply ?? '主淫，小的权限不足，无法执行该操作嘤嘤嘤~'
  }

  /** api连接失败回复 */
  get fetchErrReply() {
    return this.config.fetchErrReply ?? '连接失败，请稍后重试'
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

  /** 黑名单列表 */
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

  /** 机器人qq */
  get qq() {
    return Number(Bot.uin ?? this.defaultCfg.qq)
  }

  /** 签名自动重启设置 */
  get qsignRestart() {
    return this.config.qsignRestart ?? {}
  }

  /** 直播推送设置 */
  get BlivePush() {
    return this.config.BlivePush ?? {}
  }

  /** 放大图片设置 */
  get bigjpg() {
    return this.config.bigjpg ?? {}
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

export default new UCPr(Path.Plugin_Name)