import UCPr, { CFG } from '../components/UCPr.js'
import { judgeProperty } from '../components/Admin.js'
import Base from './Base.js'
import _ from 'lodash'

export default class Cfg extends Base {
  constructor(e) {
    super(e)
    this.model = 'cfg'
  }

  static get(e, groupId, isGlobal) {
    const cfg = new Cfg(e)
    return cfg.getData(groupId, isGlobal)
  }

  /** 获取所有设置组的关键词|字符串 */
  static get groupReg() {
    return Object.keys(CFG.cfgData).filter(v => v).join('|')
  }

  /** 获取某一组的各个设置的关键词正则 */
  static settingReg(group) {
    return new RegExp(Object.keys(CFG.cfgData[group].cfg).filter(v => v).join('|'), 'i')
  }

  getData(groupId, isGlobal) {
    const data = _.cloneDeep(CFG.cfgData)
    const { config, GAconfig } = UCPr
    const cfg = isGlobal ? { config, GAconfig } : UCPr.groupCFG(groupId)
    // 挂载当前config数据
    for (const k in data) {
      if (!isGlobal && data[k].GM) {
        delete data[k]
        continue
      }
      if (data[k].isDisplay && !data[k].isDisplay(cfg)) {
        delete data[k]
        continue
      }
      _.forEach(data[k].cfg, (value) => {
        const sp = _.trim(value.path, '.').split('.')
        if (!isGlobal && (_.get(UCPr.lock, [value.cfg, ...sp]) !== undefined)) {
          value.lock = true
        }
        if (value.type === 'power') {
          value.value = value.options.map(option => {
            return _.get(cfg, [value.cfg, ...sp, judgeProperty[option]]) ? '1' : '0'
          }).join('')
        } else if (!value.value) {
          let v = _.get(cfg, [value.cfg, ...sp])
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
      groupId,
      saveId: 'UC-cfg'
    }
  }
}