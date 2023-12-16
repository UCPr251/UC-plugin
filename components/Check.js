import file from './file.js'
import UCPr from './UCPr.js'

function getLevel(userId, groupId) {
  const groupCfg = UCPr.groupCFG(groupId)
  if (Check.str(UCPr.GlobalMaster, userId)) return 4
  if (Check.str(groupCfg.permission?.Master, userId)) return 3
  if (Check.str(UCPr.GlobalAdmin, userId)) return 2
  if (Check.str(groupCfg.permission?.Admin, userId)) return 1
  if (Check.str(UCPr.GlobalBlackQQ, userId)) return -2
  if (Check.str(groupCfg.permission?.BlackQQ, userId)) return -1
  return 0
}

const temp = {}

// eslint-disable-next-line no-unused-vars
function logLevel(userId, level) {
  if (!UCPr.debugLog) return
  if (temp[userId]) {
    clearTimeout(temp[userId])
  }
  temp[userId] = setTimeout(() => log.debug(`用户${userId}权限等级：${level}`), 5)
}

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

  /**
   * @returns {Set<6>}
   */
  levelSet(userId, groupId) {
    if (this.e) {
      return Check.levelSet(this.e.sender?.user_id ?? this.e.user_id, this.e.group_id)
    }
    const level = new Set()
    if (!userId) return level
    const groupCFG = UCPr.groupCFG(groupId)
    if (Check.str(UCPr.GlobalMaster, userId)) level.add(4)
    if (Check.str(groupCFG.permission?.Master, userId)) level.add(3)
    if (Check.str(UCPr.GlobalAdmin, userId)) level.add(2)
    if (Check.str(groupCFG.permission?.Admin, userId)) level.add(1)
    // level.add(0)
    if (Check.str(groupCFG.permission?.BlackQQ, userId)) level.add(-1)
    if (Check.str(UCPr.GlobalBlackQQ, userId)) level.add(-2)
    return level
  },

  /**
   * 检查用户权限等级，不判断其他
   * 不传群号则只检测全局权限等级
   * 按照权限等级从大到小检查
   * @returns {number|boolean}
   * 全局主人：4
   * 群主人：3
   * 全局管理：2
   * 群管理：1
   * 普通用户：0
   * 群黑名单：-1
   * 全局黑名单：-2
   */
  level(userId, groupId, need) {
    if (this.e) {
      return Check.level(this.e.sender?.user_id ?? this.e.user_id, this.e.group_id, userId)
    }
    if (!userId) return 0
    if (!isNaN(need)) {
      return Check.level(userId, groupId) >= need
    }
    const level = getLevel(userId, groupId)
    // logLevel(userId, level)
    return level
  },

  /** 检查用户全局权限，不判断其他 */
  globalLevel(userId, need) {
    log.debug(`[Check.globalLevel]检查用户全局权限${userId}，${need}`)
    if (this.e) {
      return Check.globalLevel(this.e.sender?.user_id ?? this.e.user_id, userId)
    }
    if (!userId) return false
    if (!isNaN(need)) {
      return Check.globalLevel(userId) >= need
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
    // log.debug(`[Check.GroupPermission]检查用户群${groupId} ${type}权限，${userId}`)
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