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

const tempData = {}

/**
 * 防抖保存配置文件
 * @param {string} key key
 * @param {Object} data 新数据
 * @param {*} path
 * @param {Function} fnc 保存新数据后调用函数
 */
function saver(key, data, path, fnc) {
  if (!tempData[key]) {
    tempData[key] = {}
  }
  if (!tempData[key].timer) {
    tempData[key].data = data
  } else {
    clearTimeout(tempData[key].timer)
    tempData[key].data = _.merge({}, tempData[key].data, data)
  }
  tempData[key].timer = setTimeout(() => {
    file.YAMLsaver(path, tempData[key].data)
    delete tempData[key]
    setTimeout(() => fnc && fnc(), 40)
  }, 40)
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
      const newGroupCfg = { config, GAconfig }
      newGroupCfg.permission = {
        Master: [],
        Admin: [],
        BlackQQ: []
      }
      file.YAMLsaver(configPath, newGroupCfg)
    }
  },

  /** 修改群设置 */
  groupCfg(groupId, path, operation, cfg) {
    const groupConfig = tempData[groupId]?.data ?? UCPr.groupCFG(groupId)
    if (!groupConfig) return log.warn('[Admin.groupCfg]群配置不存在：', groupId)
    const old = _.get(groupConfig[cfg], path)
    if (old !== undefined) {
      if (!_.isEqual(old, operation)) {
        log.debug(`修改${groupId}.yaml文件${path}为` + common.toString(operation))
        _.set(groupConfig[cfg], path, operation)
        saver(groupId, groupConfig, this.getCfgPath(groupId))
        return true
      }
      return false
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
    if (!config) return log.warn('[Admin.globalCfg]错误参数：', path, cfg)
    const old = _.get(config, path)
    if (old !== undefined) {
      if (!_.isEqual(old, operation)) {
        log.debug(`修改${cfg}文件${path}为` + common.toString(operation))
        _.set(config, path, operation)
        saver(cfg, config, Path[`${cfg}yaml`], Data.refreshLock)
        return true
      }
      return false
    }
    return log.warn(`操作失败：${cfg}配置中不存在${path}属性`)
  },

  /**
   * 指定群加减主人、管理、黑名单
   * @param {'Master'|'Admin'|'BlackQQ'} type
   * @param {number} userId
   * @param {number} groupId
   * @param {boolean} isAdd
   */
  groupPermission(type, userId, groupId, isAdd = true) {
    log.debug(`[Admin][groupPermission]群${groupId}${isAdd ? '加' : '减'}${type}：${userId}`)
    userId = Number(userId)
    groupId = Number(groupId)
    if (!userId || !groupId) return log.warn('[Admin][group]错误参数', userId, groupId)
    // 修改全局config
    const permission = UCPr.permission
    if (!permission[type]) permission[type] = {}
    const cfg = permission[type]
    if (isAdd) {
      if (!_.isArray(cfg[userId])) cfg[userId] = []
      cfg[userId].push(groupId)
      cfg[userId] = _.sortBy(_.uniq(cfg[userId]))
    } else {
      Data.remove(cfg[userId], groupId)
      if (_.isEmpty(cfg[userId])) {
        delete cfg[userId]
      }
    }
    file.YAMLsaver(Path.permissionyaml, permission)
    // 修改群config
    if (!UCPr.groupCFG(groupId)) this.newConfig(groupId)
    setTimeout(() => {
      const _cfg = UCPr.groupCFG(groupId)
      if (!_cfg) return log.warn('无群设置信息：' + groupId)
      const _permission = _cfg.permission
      if (isAdd) {
        if (!_.isArray(_permission[type])) _permission[type] = []
        _permission[type].push(userId)
        _permission[type] = _.sortBy(_.uniq(_permission[type]))
      } else {
        Data.remove(_permission[type], userId)
      }
      file.YAMLsaver(this.getCfgPath(groupId), _cfg)
    }, 100)
    return true
  },

  /**
   * 加减全局主人、管理、黑名单
   * @param {'Master'|'Admin'|'BlackQQ'} type
   * @param {string|Array} userId 操作的用户
   * @param {boolean} isAdd 增删
   */
  globalPermission(type, userId, isAdd = true) {
    if (!type || !userId) return log.warn('[Admin.globalPermission]空白参数')
    type = `Global${type}`
    userId = _.castArray(userId).map(Number)
    const permission = UCPr.permission
    if (isAdd) {
      permission[type] = _.sortBy(_.uniq(permission[type].concat(userId)))
    } else {
      permission[type] = _.difference(permission[type], userId)
    }
    file.YAMLsaver(Path.permissionyaml, permission)
  },

  /**
   * 锁定设置属性对应值
   * @param {*} path 属性路径，包含config/GAconfig
   * @param {boolean} isLock true锁定false解锁
   */
  lockConfig(path, isLock) {
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

  /** 获取全局主人、管理或黑名单列表 */
  permissionList(type) {
    const global = UCPr[`Global${type}`]
    const cfg = UCPr[type]
    return {
      global: Data.makeArrStr(global, { chunkSize: 50 }),
      globalLen: global.length,
      group: Data.makeArrStr(Data.makeObj(cfg), { chunkSize: 20, length: 500 }),
      groupLen: Object.keys(cfg).length
    }
  }

}

export default Admin