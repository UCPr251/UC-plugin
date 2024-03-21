import { Data } from '../components/index.js'
import UCEvent from './UCEvent.js'

export default class UCGAPlugin extends UCEvent {
  constructor({
    e,
    name = 'UC插件·群管',
    dsc = 'UC插件·群管',
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
    /** 默认UCGA权限实例 */
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

}