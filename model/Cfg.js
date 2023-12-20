import UCPr, { CFG } from '../components/UCPr.js'
import { judgeProperty } from '../components/Admin.js'
import Base from './Base.js'
import _ from 'lodash'

export default class Cfg extends Base {
  constructor(e) {
    super(e)
    this.model = 'cfg'
  }

  /**
   * 获取设置图数据
   * @param {*} e
   * @param {*} groupId
   * @param {*} isGlobal 是否全局设置
   * @param {'config'|'GAconfig'} type 系统设置或群管设置
   * @returns {object}
   */
  static get(e, type, groupId, isGlobal) {
    const cfg = new Cfg(e)
    return cfg.getData(type, groupId, isGlobal)
  }

  /** 获取所有设置组的关键词|字符串 */
  static groupReg(type) {
    return Object.keys(CFG.cfgData[type]).filter(v => v).join('|')
  }

  /** 获取某一组的各个设置的关键词正则 */
  static settingReg(type, group) {
    return new RegExp(Object.keys(CFG.cfgData[type][group].cfg).filter(v => v).join('|'), 'i')
  }

  getData(type, groupId, isGlobal) {
    const data = _.cloneDeep(CFG.cfgData[type])
    const cfg = (isGlobal ? UCPr.defaultCFG : UCPr.groupCFG(groupId))[type]
    // 挂载当前config数据
    for (const k in data) {
      if (!isGlobal && data[k].GM) {
        delete data[k]
        continue
      }
      _.forEach(data[k].cfg, (value) => {
        if (!isGlobal && (_.get(UCPr.lock[type], value.path) !== undefined)) {
          value.lock = true
        }
        if (value.type === 'power') {
          value.value = value.options.map(option => {
            return _.get(cfg, value.path + '.' + judgeProperty[option]) ? '1' : '0'
          }).join('')
        } else if (!value.value) {
          let v = _.get(cfg, value.path)
          if (typeof v === 'string') {
            v = _.truncate(v, { length: 10 })
          }
          value.value = v ?? '无'
        }
      })
    }
    return {
      ...this.screenData,
      cfgData: data,
      isGlobal,
      type,
      groupId,
      saveId: 'UC-cfg'
    }
  }
}