import { Path, file, UCPr, Data, log, common, Check } from './index.js'
import _ from 'lodash'

/** 权限判断优先级说明 */
const judgePriority = '权限判断优先级：主人>全局仅主人=黑名单>功能仅主人>允许群聊=允许私聊>允许任何人>允许插件管理员=允许群管理员'
/** 权限判断字符，中文 */
const judgeInfo = ['群聊', '私聊', '仅主人', '插管', '群管', '任何人']
/** 权限判断字符，英文 */
const judgeProperty = ['isG', 'isP', 'isM', 'isA', 'isGA', 'isE']
/** 权限判断各值含义 */
const judgeHelpInfo = [
  '是否允许群聊使用，关闭仅主人可群聊使用',
  '是否允许私聊使用，关闭仅主人可私聊使用',
  '是否仅允许主人使用',
  '是否允许群插件管理员使用，关闭仅主人或群原生管理员可使用',
  '是否允许群原生管理员使用，关闭仅主人或插件群管理员可使用',
  '是否允许任何人使用，关闭仅主人或管理员可使用'
]

export { judgePriority, judgeInfo, judgeProperty, judgeHelpInfo }

let tempData = {}

/**
 * 防抖保存设置文件，主要用于系统循环多次调用Admin.config，后覆盖前
 * @param {'config'|'GAconfig'|'permission'} [cfg='config'] 需要修改的配置文件
 * @param {Object} data 新数据
 */
function saver(cfg, data) {
  if (!tempData[cfg]) {
    tempData[cfg] = {}
  }
  if (!tempData[cfg].timer) {
    tempData[cfg].data = data
  } else {
    clearTimeout(tempData[cfg].timer)
    tempData[cfg].data = _.merge({}, tempData[cfg].data, data)
  }
  tempData[cfg].timer = setTimeout(() => file.YAMLsaver(Path[`${cfg}yaml`], tempData[cfg].data), 100)
}

/** 对config设置的Admin操作 */
const Admin = {

  getCfgPath(groupId) {
    return Path.get('groupCfg', `${groupId}.yaml`)
  },

  newConfig(groupId) {
    const configPath = this.getCfgPath(groupId)
    if (!Check.file(configPath)) {
      const { config, GAconfig } = UCPr
      file.YAMLsaver(configPath, { config, GAconfig })
    }
  },

  /** 修改群设置 */
  groupCfg(groupId, path, operation, cfg) {
    const groupConfig = UCPr.groupConfig[groupId]
    if (!groupConfig) return log.warn('[Admin.groupCfg]群配置不存在：', groupId)
    const old = _.get(groupConfig[cfg], path)
    if (old !== undefined) {
      if (!_.isEqual(old, operation)) {
        log.debug(`修改${groupId}.yaml文件${path}为` + common.toString(operation))
        _.set(groupConfig[cfg], path, operation)
        file.YAMLsaver(this.getCfgPath(groupId), groupConfig)
      }
      return true
    }
    return log.warn(`操作失败：${groupId}.yaml配置中不存在${path}属性`)
  },

  /**
   * 修改全局设置，同步锁定设置
   * @param {*} path 属性路径
   * @param {*} operation 修改值
   * @param {'config'|'GAconfig'|'permission'} [cfg='config'] 需要修改的配置文件
   */
  globalCfg(path, operation, cfg = 'config') {
    const config = UCPr[cfg]
    if (!config) return log.warn('[Admin.config]错误参数：', path, cfg)
    const old = _.get(config, path)
    if (old !== undefined) {
      if (!_.isEqual(old, operation)) {
        log.debug(`修改${cfg}文件${path}为` + common.toString(operation))
        _.set(config, path, operation)
        saver(cfg, config)
        Data.refreshLock()
        return true
      }
    }
    return log.warn(`操作失败：${cfg}配置中不存在${path}属性`)
  },

  /**
   * 锁定设置属性对应值
   * @param {*} path 属性路径，包含config/GAconfig
   * @param {boolean} isLock true锁定false解锁
   */
  lock(path, isLock) {
    const lockCfg = UCPr.lock
    if (isLock) {
      const globalCfg = _.get(UCPr, path)
      log.debug(`锁定设置${path}为` + common.toString(globalCfg))
      _.set(lockCfg, path, globalCfg)
    } else {
      log.debug(`解锁设置${path}`)
      _.unset(lockCfg, path)
    }
    file.YAMLsaver(Path.lockyaml, lockCfg)
  },

  /** 获取管理列表 */
  list(type) {
    const global = UCPr[`Global${type}`]
    const cfg = UCPr[type]
    return {
      global: Data.makeArrStr(global, { chunkSize: 50 }),
      globalLen: global.length,
      group: Data.makeArrStr(Data.makeObj(cfg), { chunkSize: 20, length: 500 }),
      groupLen: Object.keys(cfg).length
    }
  },

  /**
   * 指定群加减主人、管理
   * @param {'Master'|'Admin'} type
   * @param {number} userId
   * @param {boolean} isAdd
   */
  group(type, userId, groupId, isAdd) {
    log.debug(`[Admin][group]群${groupId}${isAdd ? '加' : '减'}${type === 'Master' ? '主人' : '管理'}：${userId}`)
    userId = Number(userId)
    groupId = Number(groupId)
    if (!userId || !groupId) return log.warn('[Admin][group]错误参数', userId, groupId)
    const permission = UCPr.permission
    if (!permission[type]) permission[type] = {}
    const cfg = permission[type]
    if (isAdd) {
      cfg[userId] = _.sortBy((cfg[userId] || []).push(groupId))
    } else {
      Data.remove(cfg[userId], groupId)
      if (_.isEmpty(cfg[userId])) {
        delete cfg[userId]
      }
    }
    saver('permission', permission)
    return true
  },

  /** 指定群新增黑名单用户 */
  balckQQ(groupId, userId, isAdd) {
    log.debug(`[Admin][balckQQ]群${groupId}${isAdd ? '加' : '减'}黑名单：${userId}`)
    groupId = Number(groupId)
    userId = Number(userId)
    if (!groupId || !userId) return log.warn('[Admin][balckQQ]错误参数', groupId, userId)
    const permission = UCPr.permission
    const BlackQQ = permission.BlackQQ
    if (!BlackQQ[groupId]) BlackQQ[groupId] = []
    const black = BlackQQ[groupId]
    if (isAdd) {
      black.push(userId)
    } else {
      Data.remove(black, userId)
    }
    BlackQQ[groupId] = _.sortBy(black)
    saver('permission', permission)
    return true
  },

  /**
   * 加减全局主人、管理
   * @param {'Master'|'Admin'|'BlackQQ'} type
   * @param {string|Array} userId 操作的用户
   * @param {boolean} isAdd 增删
   */
  global(type, userId, isAdd = true) {
    type = `Global${type}`
    userId = _.castArray(userId).map(Number)
    const permission = UCPr.permission
    if (!permission[type]) permission[type] = []
    const cfg = permission[type]
    if (isAdd) {
      permission[type] = _.uniq(_.concat(cfg, userId))
    } else {
      permission[type] = _.difference(cfg, userId)
    }
    saver('permission', permission)
  }

}

export default Admin