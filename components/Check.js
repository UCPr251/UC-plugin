import { file, UCPr, log } from './index.js'

/** 检查操作 */
const Check = {
  /**
   * 检查、创建文件夹
   * @param {string} path 指定路径
   * @param {boolean} mode true则递归创建文件夹，false不创建，默认false
   * @returns {boolean} 不存在则返回false，存在则返回true
   */
  floder(path, mode = false) {
    if (!file.existsSync(path)) {
      if (mode) {
        file.mkdirSync(path, true)
      }
      return false
    }
    return true
  },

  /**
   * 确认文件存在、读取文件
   * @param {string} path 文件路径
   * @param {boolean} mode 为true且文件存在则读取并返回文件，为false则只返回布尔型，默认false
   * @returns {boolean | object} 返回布尔型或文件
   */
  file(path, mode = false) {
    if (!file.existsSync(path)) {
      return false
    }
    if (mode) {
      return file.readFileSync(path)
    }
    return true
  },

  /**
   * 查找数组中是否含有指定内容
   * @param {Array} oriVal 某数组
   * @param {*} newVal 要查找的内容
   * @returns {boolean}
   */
  str(oriVal, newVal) {
    for (let i = oriVal.length - 1; i >= 0; i--) {
      if (oriVal[i] == newVal) {
        return true
      }
    }
    return false
  },

  /** 检查用户权限  */
  permission(userId, need = undefined) {
    if (need) {
      const permission = this.permission(userId)
      if (UCPr.isMaster && permission < 2) return false
      if (permission >= need) return true
      return false
    }
    log.whiteblod([`检查用户权限：${userId}`])
    if (Check.str(UCPr.Master, userId)) {
      log.whiteblod([`[权限]${userId}：主人权限`])
      return 2
    } else if (this.str(UCPr.AdminArr, userId)) {
      log.whiteblod([`[权限]${userId}：超管权限`])
      return 1
    }
    log.whiteblod([`[权限]${userId}：无权限`])
    return 0
  },

  /** 检查对方是否有该群管理权限 */
  target(userId, groupId) {
    if (!this.str(UCPr.AdminArr, userId)) return false
    const Admin = UCPr.Admin
    const permission = Admin[userId]
    if (permission === false) return true
    if (this.str(permission, groupId)) return true
    return false
  }

}

export default Check