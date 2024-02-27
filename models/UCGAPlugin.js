import { UCPr, Check } from '../components/index.js'
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
    /** bot是否为管理员 */
    this.botIsAdmin = this.e.group?.is_admin
    /** bot是否为群主 */
    this.botIsOwner = this.e.group?.is_owner
    /** bot是否管理员或群主 */
    this.botIsAdminOrOwner = this.botIsAdmin || this.botIsOwner
    /** 群名 */
    this.groupName = this.e.group?.name
  }

  /** 是否启用群管及该功能 */
  get isOpen() {
    return this.GAconfig.isOpen && (this.Cfg.isOpen ?? true)
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

  /** 检查开关、use权限?、Bot群权限 */
  defaultVerify(isVerifyPermission = true) {
    if (!this.isOpen) return false
    if (isVerifyPermission && !this.verifyPermission(this.Cfg.use)) return false
    if (!this.botIsAdminOrOwner) return this.noPowReply()
    return true
  }

  /** Bot和待操作群员群权限对比 */
  checkBotPower(memId = this.userId) {
    if (this.botIsOwner) return true
    if (memId == this.qq) return true
    if (!this.botIsAdmin) return false
    if (!memId) return false
    const memInfo = this.getMemInfo(memId)
    if (!memInfo) return false
    if (memInfo.role === 'admin' || memInfo.role === 'owner') return false
    return true
  }

  /** 用户和待操作群员插件权限对比 */
  checkUserPower(memId) {
    return this.level >= Check.level(memId, this.groupId)
  }

}