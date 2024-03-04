import { UCPr, Check, Data } from '../components/index.js'
import UCEvent from './UCEvent.js'

export default class UCGAPlugin extends UCEvent {
  constructor({
    e,
    name = 'UC插件·事件',
    dsc = 'UC插件·事件',
    event = 'message.group',
    priority,
    rule,
    Cfg
  }) {
    super({ e, name, dsc, event, priority, rule, Cfg })
    if (!e) return
    this.isUCGA = true
    /** 群名 */
    this.groupName = this.e.group?.name || this.e.group_name
    /** <群名>（群id） */
    this.groupStr = `<${this.groupName}> (${this.groupId})`
    /** 5-10位数字匹配 */
    this.numMatch = this.msg.match(/\d{5,10}/g)
    /** 目标id */
    this.targetId = this.at || +this.numMatch?.[0]
    /** 空UCGA权限实例 */
    this.UCGA = this.Permission()
    /** bot是否管理员或群主 */
    this.botIsAdminOrOwner = this.UCGA.botIsOwnerOrAdmin
  }

  /** 是否启用群管及该功能 */
  get isOpen() {
    return this.GAconfig.isOpen && (this.Cfg.isOpen ?? true)
  }

  /** <target名>（targetId） */
  get memStr() {
    return this.getMemStr()
  }

  /** <群员名>（userId） */
  getMemStr(userId = this.targetId) {
    return `<${this.getMemName(userId)}>（${userId}）`
  }

  /** 检查开关、use权限?、Bot群权限 */
  defaultVerify(isVerifyPermission = true) {
    if (!this.isOpen) return false
    if (isVerifyPermission && !this.verifyPermission(this.Cfg.use)) return false
    if (!this.botIsAdminOrOwner) return this.noPowReply()
    return true
  }

  /** bot和target群权限对比 */
  checkBotPower(memId) {
    if (memId && memId != this.targetId) return this.PermissionClass.get({ ...this, userId: memId, targetId: null }, {}).botIsPow_user
    return this.UCGA.botIsPow_target
  }

  /** user和target插件权限对比 */
  checkUserPower(memId) {
    if (memId && memId != this.targetId) return this.PermissionClass.get({ ...this, targetId: memId }, {}).isPer
    return this.UCGA.isPer
  }

  /** UC指令前缀检查 */
  checkPrefix() {
    return /^#?UC/i.test(this.msg)
  }

  /** 有时候icqq的监听会重复？做个CD限制 */
  async isCD() {
    const key = `${this.name}:${this.groupId}:${this.userId}`
    const data = await Data.redisGet(key)
    if (data) return true
    Data.redisSet(key, '1', 3600)
    return false
  }

  /** 检查是否全局主人 */
  isGM(userId) {
    return Check.Master(userId)
  }

  /** 检查是否主人 */
  isM(userId, groupId) {
    if (this.isGM(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.Master, userId)
    return Check.str(this.groupCFG.permission?.Master, userId)
  }

  /** 检查是否全局管理 */
  isGA(userId) {
    return Check.Admin(userId)
  }

  /** 检查是否管理 */
  isA(userId, groupId) {
    if (this.isGA(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.Admin, userId)
    return Check.str(this.groupCFG.permission?.Admin, userId)
  }

}