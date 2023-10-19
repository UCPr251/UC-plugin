/* eslint-disable no-unused-vars */
/* eslint-disable lines-between-class-members */
import { Check, UCPr } from './index.js'

/** 群聊权限判断 */
class Permission {
  constructor(e, { isA = false, isGA = true }) {
    this.e = e
    this.sender = e.sender
    this.id = this.sender.user_id
    /** 是否允许群原生管理员操作 */
    this.isGA = isGA
    /** 是否允许插件群管理员操作 */
    this.isA = isA
  }

  /** 发送者id */
  get userId() {
    return this.id
  }
  /** 发送者昵称 */
  get name() {
    return this.sender.card || this.sender.nickname
  }
  /** 群号 */
  get groupId() {
    return this.e.group_id
  }
  /** 权限级别 */
  get permission() {
    return Check.permission(this.id)
  }
  /** 是否插件主人 */
  get isMaster() {
    return this.permission === 2
  }
  /** 是否该群插件管理员 */
  get isAdmin() {
    return Check.target(this.id, this.groupId)
  }
  /** 是否黑名单 */
  get isBlack() {
    return Check.str(UCPr.BlackQQ, this.id)
  }
  /** 是否群管理员 */
  get isGroupAdmin() {
    return this.sender.role === 'admin'
  }
  /** 是否群拥有者 */
  get isGroupOwner() {
    return this.sender.role === 'owner'
  }
  /** 是否有群管理权限 */
  get isPow() {
    return this.isGroupAdmin || this.isGroupOwner
  }
  /** Bot是否权限大于对方 */
  get botIsPow() {
    if (this.isGroupOwner) return false
    if (this.e.group.is_owner) return true
    if (this.e.group.is_admin && !this.isGroupAdmin) {
      return true
    }
    return false
  }
  /** 是否有权限操作 */
  get isPer() {
    if (this.isBlack) return false
    if (UCPr.onlyMaster && !this.isMaster) return false
    if (this.isMaster) return true
    if (!this.isA && !this.isPow) return false
    if (this.isPow && this.isGA) return true
    return this.isAdmin
  }
  /** reply回复 */
  reply(msg) {
    this.e.reply(msg, true)
    return false
  }
  /** 默认权限管理判断 */
  judge() {
    if (UCPr.onlyMaster && this.isAdmin) return this.reply(UCPr.onlyMasterReply)
    if (!this.isPer) return this.reply(UCPr.noPerReply)
    return true
  }

}

export default Permission