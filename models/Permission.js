/* eslint-disable lines-between-class-members */
import { Check, UCPr, common } from '../components/index.js'
import _ from 'lodash'

/** 三方权限判断、功能权限判断 */
export default class Permission {
  constructor({
    userId,
    targetId,
    groupId,
    group,
    reply
  }, { isG = true, isP = true, isM = false, isA = false, isGA = false, isE = false }) {
    /** 用户id */
    this.userId = +userId
    /** 群号 */
    this.groupId = +groupId
    /** 是否群聊 */
    this.isGroup = !!this.groupId
    /** user权限级别Set */
    this.levelSet = Check.levelSet(this.userId, this.groupId)
    /** user权限级别 */
    this.level = Check.level(this.userId, this.groupId)
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
    /** 群实例 */
    this.group = group ?? common.pickGroup(this.groupId)
    if (!this.isGroup) return
    this.reply = reply
    /** user实例 */
    this.userClient = this.group.pickMember(this.userId) ?? {}
    if (!+targetId) {
      /** 与Bot自身比较 */
      this.targetIsBot = true
      return
    }
    /** 目标id */
    this.targetId = +targetId
    /** target实例 */
    this.targetClient = this.group.pickMember(this.targetId) ?? {}
  }

  /** user是否插件全局主人 */
  get GM() {
    return this.levelSet.has(4)
  }
  /** user是否插件主人 */
  get M() {
    return this.GM || this.levelSet.has(3)
  }
  /** user是否插件全局管理员 */
  get GA() {
    return this.levelSet.has(2)
  }
  /** user是否插件管理员 */
  get A() {
    return this.GA || this.levelSet.has(1)
  }
  /** user是否插件全局黑名单 */
  get GB() {
    return this.levelSet.has(-2)
  }
  /** user是否插件黑名单 */
  get B() {
    return this.GB || this.levelSet.has(-1)
  }
  /** user是否群管理员 */
  get isAdmin() {
    return this.userClient.is_admin
  }
  /** user是否群拥有者 */
  get isOwner() {
    return this.userClient.is_owner
  }
  /** user是否群主或管理 */
  get isOwnerOrAdmin() {
    return this.isOwner || this.isAdmin
  }
  /** bot是否群管理员 */
  get botIsAdmin() {
    return this.group.is_admin
  }
  /** bot是否群拥有者 */
  get botIsOwner() {
    return this.group.is_owner
  }
  /** bot是否群主或管理 */
  get botIsOwnerOrAdmin() {
    return this.botIsOwner || this.botIsAdmin
  }
  /** target是否群管理员 */
  get targetIsAdmin() {
    return this.targetClient.is_admin
  }
  /** target是否群拥有者 */
  get targetIsOwner() {
    return this.targetClient.is_owner
  }
  /** target是否群主或管理 */
  get targetIsOwnerOrAdmin() {
    return this.targetIsOwner || this.targetIsAdmin
  }
  /** user插件权限是否大于target */
  get isPer() {
    return this.level > Check.level(this.targetId, this.groupId)
  }
  /** user群权限是否大于target */
  get isPow() {
    if (this.isOwner) return true
    if (this.targetIsOwner) return false
    if (this.isAdmin && !this.targetIsAdmin) return true
    return false
  }
  /** bot群权限是否大于user */
  get botIsPow_user() {
    if (this.isOwner) return false
    if (this.botIsOwner) return true
    if (this.botIsAdmin && !this.isAdmin) return true
    return false
  }
  /** bot群权限是否大于target */
  get botIsPow_target() {
    if (this.targetIsBot) return false
    if (this.targetIsOwner) return false
    if (this.botIsOwner) return true
    if (this.botIsAdmin && !this.targetIsAdmin) return true
    return false
  }
  /**
   * 是否有权限操作，判断优先级 主人>全局仅主人=黑名单=功能仅主人=
   * 不允许群聊=不允许私聊>允许任何人>允许插件管理员=允许群管理员
   */
  get isPermission() {
    if (this.M) return true // 是全局主人或群主人
    if (UCPr.onlyMaster) return false // 已开启全局仅主人
    if (this.B) return false // 是全局黑名单或群黑名单
    if (this.isM) return false // 已开启功能仅主人
    if (this.isGroup && !this.isG) return false // 不允许群聊
    if (!this.isGroup && !this.isP) return false // 不允许私聊
    if (this.isE) return true // 允许任何人
    if (this.A && this.isA) return true // 允许插件管理员
    if (this.isOwnerOrAdmin && this.isGA) return true // 允许群管理员
    return false // 无权限
  }

  /** 获取实例化数据 */
  static get(thisArg, cfg) {
    if (typeof cfg === 'string' || _.isArray(cfg)) {
      cfg = _.get(UCPr, cfg, {})
    }
    return new Permission(thisArg, cfg)
  }

  /** 默认权限管理判断 */
  judge(option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }, forceJudge = false) {
    if (forceJudge) { option.isReply && this.reply?.(UCPr.noPerReply, option.quote ?? true, option); return false }
    if (UCPr.onlyMaster && !this.M) return false
    if (!this.isPermission) { option.isReply && this.reply?.(UCPr.noPerReply, option.quote ?? true, option); return false }
    return true
  }

  /** 默认权限验证 */
  static verify(thisArg, Cfg = {}, option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    return Permission.get(thisArg, Cfg).judge(option)
  }

}
