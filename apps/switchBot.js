import { Path, file, UCPr } from '../components/index.js'
import { UCPlugin } from '../model/index.js'
import _ from 'lodash'

export default class UCSwitchBot extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-switchBot',
      dsc: '指定群开关Bot',
      event: 'message.group',
      Cfg: 'config.switchBot',
      rule: [
        {
          reg: `^#?${UCPr.BotName}(${UCPr.switchBot?.openReg?.trim() || '上班|工作'})$`,
          fnc: 'openBot'
        },
        {
          reg: `^#?${UCPr.BotName}(${UCPr.switchBot?.closeReg?.trim() || '下班|休息'})$`,
          fnc: 'closeBot'
        }
      ]
    })
  }

  async openBot(e) {
    if (!this.verifyPermission(this.Cfg.use)) return false
    const data = file.YAMLreader(Path.groupyaml)
    if (!data[e.group_id] || !_.get(data, `${e.group_id}.enable`)) {
      return e.reply('当前已经是开启状态了哦~', true)
    }
    delete data[e.group_id].enable
    if (_.isEmpty(data[e.group_id])) {
      delete data[e.group_id]
    }
    file.YAMLsaver(Path.groupyaml, data)
    return e.reply(this.Cfg.openMsg.replace('BotName', this.BotName))
  }

  async closeBot(e) {
    if (!this.verifyPermission(this.Cfg.use)) return false
    const data = file.YAMLreader(Path.groupyaml)
    if (_.isEqual(_.get(data, `${e.group_id}.enable`), ['UC-switchBot'])) {
      return e.reply('当前已经是关闭状态了哦~', true)
    }
    _.set(data, `${e.group_id}.enable`, ['UC-switchBot'])
    file.YAMLsaver(Path.groupyaml, data)
    return e.reply(this.Cfg.closeMsg.replace('BotName', this.BotName))
  }
}
