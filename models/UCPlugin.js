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
    // this.UC = {}
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
    /** 是否群聊 */
    this.isGroup = this.UC.isGroup
    /** 群号 */
    this.groupId = this.UC.groupId
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

  /** 设置的Bot名称 */
  get BotName() {
    return UCPr.BotName
  }

  /** 机器人qq */
  get qq() {
    return UCPr.qq
  }

  /** 插件使用权限 */
  get check() {
    return Data.check.call(this)
  }

  /** 用户无权限回复 */
  noPerReply(quote = true, data = {}) {
    this.e.reply(UCPr.noPerReply, quote, data)
    return false
  }

  /** Bot无权限回复 */
  noPowReply(quote = true, data = {}) {
    this.e.reply(UCPr.noPowReply, quote, data)
    return false
  }

  /** api连接失败回复 */
  fetchErrReply(quote = true, data = {}) {
    this.e.reply(UCPr.fetchErrReply, quote, data)
    return false
  }

  /** 错误回复 */
  errorReply(quote = true, data = {}) {
    this.e.reply('未知错误，请查看错误日志', quote, data)
    return false
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
  verifyPermission(cfg = {}, option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    if (!this.verifyLevel()) return false
    return Permission.verify(this.e, cfg, option)
  }

  /**
   * 权限等级验证
   * - 全局主人：4
   * - 群主人：3
   * - 全局管理：2
   * - 群管理：1
   * - 普通用户：0
   * - 群黑名单：-1
   * - 全局黑名单：-2
   */
  verifyLevel(need = 0) {
    if (this.B) return false
    if (UCPr.onlyMaster && !this.M) return false
    if (this.level < need) return this.noPerReply()
    return true
  }

  /** 检查是否全局黑名单 */
  isGB(userId) {
    return Check.BlackQQ(userId)
  }

  /** 检查是否黑名单 */
  isB(userId, groupId) {
    if (this.isGB(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.BlackQQ, userId)
    return Check.str(this.groupCFG.permission?.BlackQQ, userId)
  }

  /** 用户是否确认操作 */
  isSure(fnc) {
    if (/是|确认|确定|确信|肯定/.test(this.msg)) {
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
    if (/取消/.test(this.msg)) {
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
    let { quote = true, ...data } = option
    if (this.e.file) quote = false
    this.reply(msg, quote, data)
    const setContext = setFnc || this.setFnc
    log.debug(`结束上下文hook：${this.name} ${setContext}`)
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
    return this.msg ?? this.e.msg ?? ''
  }

  /** 获取序号指定数据 */
  _getNum() {
    if (this.isCancel('_getNum')) return
    const data = this.getContext()._getNum?.data
    if (!data) {
      this.finish('_getNum')
      log.warn(`上下文hook数据丢失：${this.name}（${this.dsc}）自动结束上下文hook`)
      return
    }
    const { list, fnc } = data
    let numMatch = this.msg.match(/\d+/g)
    if (/^[1-9]\d*\s*-\s*[1-9]\d*$/.test(this.msg)) {
      const [start, end] = this.msg.match(/\d+/g).map(Number)
      if (start > end) {
        this.reply('???')
        return false
      }
      numMatch = _.range(start, Math.min(end, list.length) + 1)
    } else {
      numMatch = numMatch?.filter(num => num >= 1 && num <= list.length)
    }
    if (_.isEmpty(numMatch)) {
      this.reply('请输入有效的序号或取消操作')
      return false
    } else {
      const arr = numMatch.map(num => list[num - 1])
      this.finish('_getNum')
      this[fnc](arr, data)
    }
  }

}
