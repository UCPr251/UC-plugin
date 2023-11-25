import { Path, file, UCPr, Data, log, common } from './index.js'
import _ from 'lodash'

/** 权限判断优先级说明 */
const judgePriority = '权限判断优先级：主人>黑名单>全局仅主人>功能仅主人>允许群聊=允许私聊>允许任何人>允许插件管理员=允许群管理员'
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

let tempData = { config: {}, GAconfig: {}, permission: {} }

/** 对config设置的Admin操作 */
const Admin = {

  /** 获取管理列表 */
  get AdminList() {
    const permission = UCPr.Admin
    const global = Data.makeArrStr(_.chain(permission)
      .pickBy(v => v === false)
      .keys()
      .sortBy()
      .value())
    let normalObj = _.pickBy(permission, v => v !== false)
    const normal = {}
    _.forEach(_.sortBy(_.keys(normalObj)), v => (normal[v] = normalObj[v]))
    return { global, normal: Data.makeArrStr(Data.makeObj(normal)) }
  },

  /**
   * 防抖保存设置文件，主要用于系统循环多次调用Admin.config，后覆盖前
   * @param {'config'|'GAconfig'|'permission'} [cfg='config'] 需要修改的配置文件
   * @param {Object} data 新数据
   */
  saver(cfg, data) {
    if (!tempData[cfg].timer) {
      tempData[cfg].data = data
    } else {
      clearTimeout(tempData[cfg].timer)
      tempData[cfg].data = _.merge(tempData[cfg].data, data)
    }
    tempData[cfg].timer = setTimeout(() => file.YAMLsaver(Path[`${cfg}yaml`], tempData[cfg].data), 100)
  },

  /**
   * 修改设置属性对应值
   * @param {*} path 属性路径
   * @param {*} operation 修改值
   * @param {'config'|'GAconfig'|'permission'} [cfg='config'] 需要修改的配置文件
   */
  config(path, operation, cfg = 'config') {
    const config = UCPr[cfg]
    if (!config) return log.error('[Admin.config]错误参数：', path, cfg)
    const old = _.get(config, path)
    if (old !== undefined) {
      if (!_.isEqual(old, operation)) {
        log.debug(`修改${cfg}文件${path}为` + common.toString(operation))
        _.set(config, path, operation)
        this.saver(cfg, config)
        return true
      }
    } else {
      log.error(`操作失败：${cfg}配置中不存在${path}属性`)
    }
    return false
  },

  /**
   * 加减管理
   * @param {number} userId
   * @param {boolean} isAdd
   * @param {boolean|number} independent 是否独立，全局为false，独立为群号
   */
  admin(userId, isAdd, independent) {
    log.debug(`[Admin][ADadmin]用户${userId}${isAdd ? '加' : '减'}${independent || '全局'}管理`)
    const permission = UCPr.permission
    if (!permission.Admin) permission.Admin = {}
    const Admin = permission.Admin
    if (isAdd) {
      if (independent === false) {
        Admin[userId] = false
      } else if (!isNaN(independent)) {
        Admin[userId] = _.concat(Admin[userId] || [], independent)
      } else {
        return false
      }
    } else {
      if (independent === false) {
        delete permission.Admin[userId]
      } else if (!isNaN(independent)) {
        permission.Admin[userId] = _.pull(Admin[userId], independent)
        if (_.isEmpty(Admin[userId])) {
          delete permission.Admin[userId]
        }
      } else {
        return false
      }
    }
    this.saver('permission', permission)
    return true
  },

  /**
   * 加减主人、黑、白名单
   * @param {'BlackQQ'|'WhiteQQ'|'Master'} type 修改属性
   * @param {string|Array} userId 操作的用户
   * @param {boolean} isAdd 增删
   */
  permission(type, userId, isAdd = true) {
    userId = _.castArray(userId).map(Number)
    const config = UCPr.permission
    if (isAdd) {
      config[type] = _.uniq(_.concat(config[type], userId))
    } else {
      config[type] = _.difference(config[type], userId)
    }
    this.saver('permission', config)
  }

}

export default Admin