import { UCPr, log, Data, Check } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import Permission from './Permission.js'
import _ from 'lodash'

/** UC插件plugin类 */
export default class UCPlugin extends plugin {
  constructor({
    e,
    name = 'UC-plugin-apps',
    dsc = 'UC插件',
    event = 'message',
    priority = UCPr.priority,
    rule,
    Cfg
  }) {
    super({ name, dsc, event, priority, rule })
    this.UC = {}
    if (!e) return
    /** Client */
    this.e = e
    /** 格式化消息 */
    this.msg = this.formatMsg()
    /** 空cfg权限实例 */
    this.UC = this.Permission()
    /** e.sender */
    this.sender = this.UC.sender
    /** 用户id */
    this.userId = this.UC.userId
    /** 群号 */
    this.groupId = this.UC.groupId
    /** 是否群聊 */
    this.isGroup = this.UC.isGroup
    /** 群所有配置config, GAconfig, permission，无则全局 */
    this.groupCFG = UCPr.groupCFG(this.groupId)
    /** 群config配置，无则全局 */
    this.config = this.groupCFG.config
    /** 群GAconfig配置，无则全局 */
    this.GAconfig = this.groupCFG.GAconfig
    /** 群功能配置 */
    this.Cfg = _.get(this.groupCFG, Cfg, {})
    if (!this.userId) return
    /** 权限级别Set */
    this.levelSet = this.UC.levelSet
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

  /** 检查是否全局主人 */
  isGM(userId) {
    return Check.Master(userId)
  }

  /** 检查是否全局管理 */
  isGA(userId) {
    return Check.Admin(userId)
  }

  /** 检查是否全局主黑名单 */
  isGB(userId) {
    return Check.BlackQQ(userId)
  }

  /** 获取权限实例 */
  Permission(cfg = {}) {
    return Permission.get(this.e, cfg)
  }

  /** 默认权限判断(回复)? */
  verifyPermission(cfg = {}, option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    if (!this.verifyLevel()) return false
    return Permission.verify(this.e, cfg, option)
  }

  /** 权限等级验证 */
  verifyLevel(need = 0) {
    if (this.B) return false
    if (UCPr.onlyMaster && !this.M) return false
    if (this.level < need) {
      this.e.reply(UCPr.noPerReply, true)
      return false
    }
    return true
  }

  /** 用户是否确认操作 */
  isSure(fnc) {
    if (/是|确认|确定|确信|肯定/.test(this.e.msg)) {
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

  /** 格式化this.msg */
  formatMsg() {
    if (this.e.message) {
      const msgArr = []
      for (const msg of this.e.message) {
        switch (msg.type) {
          case 'text':
            msgArr.push(msg.text?.replace(/^\s*[＃井#]+\s*/, '#').replace(/^\s*[\\*※＊]+\s*/, '*').trim())
            break
          case 'image':
            if (!this.img) {
              this.img = []
            }
            this.img.push(msg.url)
            break
          case 'at':
            this.at = msg.id ?? msg.qq
            break
          case 'file':
            this.file = { name: msg.name, fid: msg.fid }
            break
          default: break
        }
      }
      return msgArr.join(' ').replace(/\s+/g, ' ').trim()
    }
  }

}
