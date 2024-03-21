import { judgeProperty } from '../../components/Admin.js'
import Base from './Base.js'
import _ from 'lodash'

export default class Cfg extends Base {
  constructor(thisArg) {
    super(thisArg)
    this.model = 'cfg'
  }

  /**
   * 获取设置图数据
   * @param {*} thisArg UCPlugin实例
   * @param {{}} data 参数
   * @param {*} data.groupId
   * @param {*} data.isGlobal 是否全局设置
   * @param {'config'|'GAconfig'} data.type 系统设置或群管设置
   * @param {string} data.group 组类
   * @returns {object}
   */
  static get(thisArg, data = {}) {
    const cfg = new Cfg(thisArg)
    return cfg.getData(data)
  }

  /** 获取所有设置组的关键词|字符串 */
  static groupReg(type) {
    return Object.keys(UCPr.CFG.cfgData[type]).filter(Boolean).join('|')
  }

  /** 获取某一组的各个设置的关键词正则 */
  static setReg(type, group) {
    return new RegExp(Object.keys(UCPr.CFG.cfgData[type][group].cfg).filter(Boolean).join('|'), 'i')
  }

  getData({ type, groupId, isGlobal, group }) {
    let _cfgData = _.cloneDeep(UCPr.CFG.cfgData[type])
    // 仅获取某一组的设置
    if (group !== undefined) {
      const temp = _cfgData[group]
      _cfgData = {}
      _cfgData[group] = temp
    }
    const cfgData = _cfgData
    const cfg = (isGlobal ? UCPr.defaultCFG : UCPr.groupCFG(groupId))[type]
    // 挂载当前config数据
    for (const key in cfgData) {
      if (!isGlobal && cfgData[key].GM) {
        delete cfgData[key]
        continue
      }
      for (const _key in cfgData[key].cfg) {
        const value = cfgData[key].cfg[_key]
        if (!isGlobal) {
          if (value.global === true) {
            delete cfgData[key].cfg[_key]
            continue
          }
          if (_.get(UCPr.lock[type], value.path) !== undefined) {
            value.lock = true
          }
        }
        if (value.type === 'Power') {
          value.value = value.options.map(option => {
            return _.get(cfg, value.path + '.' + judgeProperty[option]) ? '1' : '0'
          }).join('')
        } else if (!value.value) {
          let v = _.get(cfg, value.path)
          if (typeof v === 'string') {
            v = _.truncate(v.trim(), { length: 12, omission: '…' })
          }
          value.value = v ?? '无'
        }
      }
    }
    return {
      ...this.screenData,
      cfgData,
      isGlobal,
      hasFile: isGlobal ? true : !!UCPr.group_CFG[groupId],
      type,
      groupId,
      saveId: 'UC-cfg'
    }
  }
}