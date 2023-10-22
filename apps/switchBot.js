import { Path, file, UCPr, Permission } from '../components/index.js'
import _ from 'lodash'

export class UCSwitchBot extends plugin {
  constructor() {
    super({
      name: 'UC-switchBot',
      dsc: '指定群开关Bot',
      event: 'message.group',
      priority: UCPr.priority,
      rule: [{
        reg: `^#?${UCPr.BotName}(${UCPr.switchBot.openReg})$`,
        fnc: 'openBot'
      },
      {
        reg: `^#?${UCPr.BotName}(${UCPr.switchBot.closeReg})$`,
        fnc: 'closeBot'
      }
      ]
    })
  }

  verify() {
    const per = new Permission(this.e, { ...UCPr.switchBot })
    return per.judge()
  }

  async openBot(e) {
    if (!this.verify()) return false
    const data = file.YAMLreader(Path.groupyaml)
    if (_.get(data, `${e.group_id}.enable`) === null) {
      return e.reply('当前已经是开启状态了哦~', true)
    }
    _.set(data, `${e.group_id}.enable`, null)
    file.YAMLsaver(Path.groupyaml, data)
    return e.reply(UCPr.switchBot.openMsg.replace('BotName', UCPr.BotName))
  }

  async closeBot(e) {
    if (!this.verify()) return false
    const data = file.YAMLreader(Path.groupyaml)
    if (_.isEqual(_.get(data, `${e.group_id}.enable`), ['UC-switchBot'])) {
      return e.reply('当前已经是关闭状态了哦~', true)
    }
    _.set(data, `${e.group_id}.enable`, ['UC-switchBot'])
    file.YAMLsaver(Path.groupyaml, data)
    return e.reply(UCPr.switchBot.closeMsg.replace('BotName', UCPr.BotName))
  }
}
