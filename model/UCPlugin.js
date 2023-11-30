import { UCPr, log, Data } from '../components/index.js'
import Permission from './Permission.js'
import plugin from '../../../lib/plugins/plugin.js'
import _ from 'lodash'

/** UC插件plugin类 */
export default class UCPlugin extends plugin {
  constructor(cfg) {
    const {
      e,
      name = 'UC-plugin-apps',
      dsc = 'UC插件',
      event = 'message',
      priority = UCPr.priority,
      rule = []
    } = cfg
    super({ name, dsc, event, priority, rule })
    this.UC = {}
    if (!e) return
    if (e.msg) e.msg = Data.formatMsg(e)
    /** Client */
    this.e = e
    /** 空cfg权限实例 */
    this.UC = this.Permission()
    /** e.sender */
    this.sender = this.UC.sender
    /** 用户id */
    this.userId = this.UC.userId
    /** 群号 */
    this.groupId = this.UC.groupId
    /** 是否群聊 */
    this.isGroup = e.isGroup
    if (!this.userId) return
    /** 权限级别 */
    this.level = this.UC.level
    /** 是否主人 */
    this.M = this.UC.M
    /** 是否全局主人 */
    this.GM = this.UC.GM
    /** 是否管理 */
    this.A = this.UC.A
    /** 是否全局管理 */
    this.GA = this.UC.GA
    /** 是否黑名单 */
    this.B = this.UC.B
    /** 是否全局黑名单 */
    this.GB = this.UC.GB
  }

  /** 插件使用权限 */
  get check() {
    return Data.check.call(this)
  }

  /** 获取config配置 */
  get config() {
    const configLock = UCPr.lock.config
    const source = UCPr.groupConfig[this.groupId]?.config || UCPr.config
    return _.merge({}, source, configLock)
  }

  /** 获取GAconfig配置 */
  get GAconfig() {
    const GAconfigLock = UCPr.lock.GAconfig
    const source = UCPr.groupConfig[this.groupId]?.GAconfig || UCPr.GAconfig
    return _.merge({}, source, GAconfigLock)
  }

  /** 用户无权限回复 */
  get noPerReply() {
    return UCPr.noPerReply
  }

  /** Bot无权限回复 */
  get noPowReply() {
    return UCPr.noPowReply
  }

  /** api连接失败回复 */
  get fetchErrReply() {
    return UCPr.fetchErrReply
  }

  /** 设置的Bot名称 */
  get BotName() {
    return UCPr.BotName
  }

  /** 机器人qq */
  get qq() {
    return UCPr.qq
  }

  /** 错误回复 */
  get errorReply() {
    return '未知错误，请查看错误日志'
  }

  /**
   * @param {string} urlCode url代号
   * @param {...any} parameters 参数
   * @returns Fetch result
   */
  async fetch(urlCode, ...parameters) {
    return await UCPr.fetch(urlCode, ...parameters)
  }

  /** 获取权限实例 */
  Permission(cfg = {}) {
    return Permission.get(this.e, cfg)
  }

  /** 默认权限判断(回复)? */
  verify(cfg = {}, option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    return Permission.verify(this.e, cfg, option)
  }

  /** 权限等级验证 */
  verifyLevel(need = 0) {
    if (this.level < need) {
      this.e.reply(UCPr.noPerReply, true)
      return false
    }
    return true
  }

  /** 用户是否确认操作 */
  isSure(fnc) {
    if (/确认|确定|确信|肯定/.test(this.e.msg)) {
      fnc && fnc()
      return true
    }
    return false
  }

  /** 用户是否取消上下文hook */
  isCancel(setFnc, option = {
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    if (/取消/.test(this.e.msg)) {
      if (setFnc) {
        this.setFnc = setFnc
      }
      return this.finishReply(undefined, setFnc, option)
    }
    return false
  }

  /** 完成hook并回复 */
  finishReply(msg = '取消已操作', setFnc, option = {
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    const { quote = true, ...data } = option
    this.reply(msg, quote, data)
    const setContext = setFnc || this.setFnc
    log.debug('结束上下文hook：' + setContext)
    this.finish(setContext)
    return true
  }

}
