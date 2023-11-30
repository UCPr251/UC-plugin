import file from './file.js'
import UCPr from './UCPr.js'

/** 检查操作 */
const Check = {
  /** 检查、递归创建文件夹 */
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

  /** 查找数组指定元素 */
  str(arr, value) {
    if (!Array.isArray(arr) || value === undefined) return false
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] == value) {
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

  /**
   * @returns {Set<6>}
   */
  levelSet(userId, groupId) {
    if (this.e) {
      return Check.levelSet(this.e.sender?.user_id ?? this.e.user_id, this.e.group_id, userId)
    }
    const level = new Set()
    if (Check.str(UCPr.GlobalMaster, userId)) level.add(4)
    if (Check.str(UCPr.permission.Master[userId], groupId)) level.add(3)
    if (Check.str(UCPr.GlobalAdmin, userId)) level.add(2)
    if (Check.str(UCPr.permission.Admin[userId], groupId)) level.add(1)
    if (Check.str(UCPr.permission.BlackQQ[userId], groupId)) level.add(-1)
    if (Check.str(UCPr.GlobalBlackQQ, userId)) level.add(-2)
    return level
  },

  /**
   * 检查用户权限等级，不判断其他
   * 返回权限等级绝对值最大值(黑名单优先)
   * @returns {number|boolean}
   * 全局主人：4
   * 群主人：3
   * 全局管理：2
   * 群管理：1
   * 普通用户：0
   * 群黑名单：-1
   * 全局黑名单：-2
   */
  level(userId, groupId, right) {
    if (this.e) {
      return Check.level(this.e.sender?.user_id ?? this.e.user_id, this.e.group_id, userId)
    }
    if (!userId) return 0
    if (right !== undefined) {
      return Check.level(userId, groupId) >= right
    }
    const levelSet = Check.levelSet(userId, groupId)
    if (levelSet.has(4)) return 4
    if (levelSet.has(3)) return 3
    if (levelSet.has(-2)) return -2
    if (levelSet.has(2)) return 2
    if (levelSet.has(-1)) return -1
    if (levelSet.has(1)) return 1
    return 0
  },

  /** 检查用户全局权限，不判断其他 */
  globalLevel(userId, right = undefined) {
    log.debug(`[Check.globalLevel]检查用户全局权限${userId}，${right}`)
    if (this.e) {
      return Check.globalLevel(this.e.sender?.user_id ?? this.e.user_id, userId)
    }
    if (!userId) return false
    if (right !== undefined) {
      return Check.globalLevel(userId) >= right
    }
    if (Check.str(UCPr.GlobalMaster, userId)) return 4
    if (Check.str(UCPr.GlobalBlackQQ, userId)) return -2
    if (Check.str(UCPr.GlobalAdmin, userId)) return 2
    return 0
  },

  /**
   * 检查群权限，不判断其他
   * @param {'Admin'|'Master'|'BlackQQ'} type 检测cfg类型
   * @param {number} userId
   * @param {number} groupId
   * @returns {boolean}
   */
  GroupPermission(type, userId, groupId) {
    log.debug(`[Check.GroupPermission]检查用户群权限${type}，${userId}，${groupId}`)
    if (this.e) {
      return Check.GroupPermission(type, this.e.sender?.user_id ?? this.e.user_id, this.e.group_id)
    }
    if (!userId) return false
    if (Check.str(UCPr[`Global${type}`], userId)) return true
    if (!groupId) return false
    const cfg = UCPr[type][userId]
    if (cfg && Check.str(cfg, groupId)) return true
    return false
  },

  /** 检查用户群管理权限，不判断其他 */
  Admin(userId, groupId) {
    return Check.GroupPermission.call(this, 'Admin', userId, groupId)
  },

  /** 检查用户群主人权限，不判断其他 */
  Master(userId, groupId) {
    return Check.GroupPermission.call(this, 'Master', userId, groupId)
  },

  /** 检查是否是黑名单 */
  BlackQQ(userId, groupId) {
    return Check.GroupPermission.call(this, 'BlackQQ', userId, groupId)
  }

}

export default Check