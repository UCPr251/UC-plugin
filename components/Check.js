import file from './file.js'
import UCPr from './UCPr.js'

/** 检查操作 */
const Check = {
  /** 检查、创建文件夹 */
  floder(path, mode = false) {
    if (!file.existsSync(path)) {
      if (mode) {
        file.mkdirSync(path, true)
      }
      return false
    }
    return true
  },

  /** 确认文件存在、读取文件 */
  file(path, mode = false) {
    if (!file.existsSync(path)) {
      return false
    }
    if (mode) {
      return file.readFileSync(path)
    }
    return true
  },

  /** 查找数组指定内容 */
  str(oriVal, newVal) {
    for (let i = oriVal.length - 1; i >= 0; i--) {
      if (oriVal[i] == newVal) {
        return true
      }
    }
    return false
  },

  /** 查找[ { } ]数组元素指定属性指定值 */
  propertyValue(oriVal, property, value) {
    if (oriVal.find(v => v[property] == value)) {
      return true
    }
    return false
  },

  /** 检查用户权限 */
  permission(userId, need = undefined) {
    if (this.e) {
      return Check.permission(this.e.sender.user_id, userId)
    }
    if (need !== undefined) {
      const permission = Check.permission(userId)
      if (UCPr.onlyMaster && permission < 2) return false
      if (permission >= need) return true
      return false
    }
    if (Check.str(UCPr.Master, userId)) return 2
    else if (Check.str(UCPr.AdminArr, userId)) return 1
    return 0
  },

  /** 只检查是否拥有该群管理权限，不判断其他 */
  target(userId, groupId) {
    if (this.e) {
      return Check.target(this.e.sender.user_id, this.e.group_id)
    }
    if (!userId || !groupId) return false
    if (!Check.str(UCPr.AdminArr, userId)) return false
    const permission = UCPr.Admin[userId]
    if (permission === false) return true
    if (Check.str(permission, groupId)) return true
    return false
  },

  /** 检查是否是黑名单 */
  black(userId) {
    if (this.e) {
      return Check.black(this.e.sender.user_id)
    }
    return Check.str(UCPr.BlackQQ, userId)
  }

}

export default Check