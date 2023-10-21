import { Path, file, UCPr, Data, log } from './index.js'
import _ from 'lodash'

/** 对config设置的Admin操作 */

const Admin = {
  /**
   * 修改设置属性对应值
   * @param {*} path 属性路径
   * @param {*} operation 修改值
   * @param {Object} param2 optional
   * @param {'config'|'permissionCfg'} [param2.cwd='config'] 需要修改的配置文件
   * @param {boolean} [param2.isArrayeply=true] 是否回复
   * @param {string} [param2.reply] 操作成功回复内容
   */
  set(path, operation, { cwd = 'config', isReply = true, reply = '操作成功' }) {
    const config = UCPr[cwd]
    if (!config) return false
    let _path
    if (cwd === 'config') {
      _path = Path.configyaml
    } else {
      _path = Path.permissionyaml
    }
    const old = _.get(config, path)
    if (old) {
      if (old == operation) {
        if (isReply) this.reply(`当前${cwd}配置中${path}已经是${operation}了`)
      } else {
        _.set(config, path, operation)
        file.YAMLsaver(_path, config)
        if (isReply) this.reply(reply)
      }
    } else {
      const info = `操作失败：${cwd}配置中不存在${path}属性`
      log.error(info)
      if (isReply) this.reply(info)
    }
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
