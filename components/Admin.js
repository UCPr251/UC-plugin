import { Path, file, UCPr, Data } from './index.js'
import _ from 'lodash'

/** 对config设置的Admin操作 */

const Admin = {
  /**
   * 修改config.yaml属性对应值
   * @param {*} element 需要操作的元素
   * @param {*} operation 修改值
   * @returns {undefined|true|'already'} 操作结果code
   */
  changeCfg(element, operation) {
    const cfg = UCPr.config
    if (cfg[element] === undefined) return undefined
    if (cfg[element] === operation) return 'already'
    cfg[element] = operation
    file.YAMLsaver(Path.configyaml, cfg)
    return true
  },

  /**
   * 加减主人、黑、白名单
   * @param {'BlackQQ'|'WhiteQQ'|'Master'} type 修改属性
   * @param {string|Array} userId 操作的用户
   * @param {boolean} isAdd 增删
   */
  arr(type, userId, isAdd = true) {
    userId = _.concat([], userId).map(Number)
    const config = UCPr.permissionCfg
    if (isAdd) {
      config[type] = _.uniq(_.concat(config[type], userId))
    } else {
      config[type] = _.difference(config[type], userId)
    }
    file.YAMLsaver(Path.permissionyaml, config)
  },

  /**
   * 加减超管
   * @param {number} userId
   * @param {boolean} isAdd
   * @param {boolean|number} independent 是否独立，全局为false，独立为群号
   */
  Admin(userId, isAdd, independent = undefined) {
    const permissionCfg = UCPr.permissionCfg
    const Admin = permissionCfg.Admin
    const info = Admin[userId]
    if (isAdd) {
      if (independent === false) {
        Admin[userId] = false
      } else {
        Admin[userId] = _.concat(info || [], independent)
      }
    } else {
      if (independent === false) {
        delete Admin[userId]
      } else {
        Admin[userId] = _.pull(info, independent)
        if (_.isEmpty(Admin[userId])) delete Admin[userId]
      }
    }
    file.YAMLsaver(Path.permissionyaml, permissionCfg)
  },

  /** 获取管理列表 */
  AdminList() {
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
  }

}

export default Admin
