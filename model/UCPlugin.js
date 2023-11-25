import { UCPr, log, Data } from '../components/index.js'
import Permission from './Permission.js'
import plugin from '../../../lib/plugins/plugin.js'

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
    if (!e) return
    /** Client */
    this.e = e
    /** e.sender */
    this.sender = this.e?.sender
    /** 用户id */
    this.userId = this.sender?.user_id ?? this.e.user_id
    if (!this.userId) return
    /** 空cfg权限实例 */
    this.P = this.permission()
    /** 是否主人 */
    this.isMaster = this.P.isMaster
    /** 是否黑名单 */
    this.isBlack = this.P.isBlack
  }

  /** 插件使用权限 */
  get check() {
    return Data.check.call(this)
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

  /** 获取权限实例 */
  permission(cfg = {}) {
    return Permission.get(this.e, cfg)
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
