import UCPr, { cfgData } from '../components/UCPr.js'
import { judgeProperty } from '../components/Admin.js'
import Base from './Base.js'
import _ from 'lodash'

export default class Cfg extends Base {
  constructor(e) {
    super(e)
    this.model = 'cfg'
  }

  static get(e) {
    const cfg = new Cfg(e)
    return cfg.getData()
  }

  /** 获取所有设置组的关键词|字符串 */
  static get groupReg() {
    return Object.keys(cfgData).filter(v => v).join('|')
  }

  /** 获取某一组的各个设置的关键词正则 */
  static settingReg(group) {
    return new RegExp(Object.keys(cfgData[group].cfg).filter(v => v).join('|'), 'i')
  }

  getData() {
    const data = _.cloneDeep(cfgData)
    // 挂载当前config数据
    for (const k in data) {
      _.forEach(data[k].cfg, (value) => {
        if (value.type === 'power') {
          value.value = value.options.map(option => {
            return _.get(UCPr.config, value.path + judgeProperty[option]) ? '1' : '0'
          }).join('')
        } else if (!value.value) {
          let v = _.get(UCPr.config, value.path)
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
      saveId: 'UC-cfg'
    }
  }
}