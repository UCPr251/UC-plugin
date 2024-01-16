/* eslint-disable lines-between-class-members */
import { Check, UCPr } from '../components/index.js'
import _ from 'lodash'

/** 权限判断 */
export default class Permission {
  constructor(e = {}, { isG = true, isP = false, isM = false, isA = false, isGA = false, isE = false }) {
    this.e = e
    this.sender = this.e.sender ?? this.e.member
    /** 是否群聊 */
    this.isGroup = this.e.message_type === 'group' || this.e.notice_type === 'group' || this.e.request_type === 'group' || this.e.isGroup
    /** 用户id */
    this.userId = this.sender?.user_id ?? this.e.user_id
    /** 权限级别Set */
    this.levelSet = Check.levelSet.call(this)
    /** 权限级别 */
    this.level = Check.level.call(this)
    /** 是否允许私聊使用 */
    this.isP = isP
    /** 是否允许群聊使用 */
    this.isG = isG
    /** 是否仅允许主人使用 */
    this.isM = isM
    /** 是否允许群管理员使用 */
    this.isGA = isGA
    /** 是否允许插件管理员使用 */
    this.isA = isA
    /** 是否允许任何人使用 */
    this.isE = isE
  }

  /** 发送者昵称 */
  get name() {
    return this.sender?.card || this.sender?.nickname || this.userId
  }
  /** 群号 */
  get groupId() {
    if (!this.isGroup) return null
    return this.e.group_id ?? this.e.group?.group_id ?? this.e.group?.gid ?? this.e.groupId
  }
  /** 是否插件全局主人 */
  get GM() {
    return this.levelSet?.has(4)
  }
  /** 是否插件主人 */
  get M() {
    if (this.GM) return true
    return this.levelSet?.has(3)
  }
  /** 是否插件全局管理员 */
  get GA() {
    return this.levelSet?.has(2)
  }
  /** 是否插件管理员 */
  get A() {
    if (this.GA) return true
    return this.levelSet?.has(1)
  }
  /** 是否插件全局黑名单 */
  get GB() {
    return this.levelSet?.has(-2)
  }
  /** 是否插件黑名单 */
  get B() {
    if (this.GB) return true
    return this.levelSet?.has(-1)
  }
  /** 是否群管理员 */
  get isGroupAdmin() {
    return this.sender?.role === 'admin'
  }
  /** 是否群拥有者 */
  get isGroupOwner() {
    return this.sender?.role === 'owner'
  }
  /** 是否有群权限 */
  get isPow() {
    if (!this.isGroup) return false
    return this.isGroupOwner || this.isGroupAdmin
  }
  /** Bot是否权限大于对方 */
  get botIsPow() {
    if (!this.isGroup) return false
    if (this.isGroupOwner) return false
    if (this.e.group?.is_owner) return true
    if (this.e.group?.is_admin && !this.isGroupAdmin) return true
    return false
  }
  /**
   * 是否有权限操作，判断优先级 主人>全局仅主人=黑名单>功能仅主人>
   * 允许群聊=允许私聊>允许任何人>允许插件管理员=允许群管理员
   */
  get isPer() {
    if (this.M) return true // 是主人
    if (UCPr.onlyMaster || this.B) return false // 是仅主人或黑名单
    if (this.isM && !this.M) return false // 是功能仅主人
    if (this.isGroup && !this.isG) return false // 不允许群聊
    if (!this.isGroup && !this.isP) return false // 不允许私聊
    if (this.isE) return true // 允许任何人
    if (this.A && this.isA) return true // 允许插件管理员
    if (this.isPow && this.isGA) return true // 允许群管理员
    return false // 无权限
  }

  /** 获取实例化数据 */
  static get(e, cfg) {
    if (typeof cfg === 'string' || _.isArray(cfg)) {
      cfg = _.get(UCPr, cfg, {})
    }
    return new Permission(e, cfg)
  }

  /** reply回复 */
  reply(msg, option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    if (option.isReply !== false) this.e.reply(msg, option.quote ?? true, option)
    return false
  }

  /** 默认权限管理判断 */
  judge(option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }, judge = false) {
    if (judge) return this.reply(UCPr.noPerReply, option)
    if (UCPr.onlyMaster && !this.M) return false
    if (!this.isPer) return this.reply(UCPr.noPerReply, option)
    return true
  }

  /** 默认权限验证 */
  static verify(e, Cfg = {}, option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    const per = Permission.get(e, Cfg)
    return per.judge(option)
  }

}