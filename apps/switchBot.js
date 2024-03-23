import { Path, file, UCPr, Data, Check } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

function init() {
  setTimeout(() => {
    const groupData = UCPr.botCfg.getConfig('group')
    tempData = _.cloneDeep(groupData)
    switchBotData.forEach(groupId => _.set(groupData, `${groupId}.enable`, ['UC-switchBot']))
  }, 20)
}

let tempData, switchBotData

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
          reg: `^#${UCPr.BotName}(${UCPr.switchBot.openReg?.trim() || '上班|工作'})$`,
          fnc: 'openBot'
        },
        {
          reg: /^#?UC上线$/i,
          fnc: 'openBot'
        },
        {
          reg: `^#${UCPr.BotName}(${UCPr.switchBot.closeReg?.trim() || '下班|休息'})$`,
          fnc: 'closeBot'
        },
        {
          reg: /^#?UC下线$/i,
          fnc: 'closeBot'
        }
      ]
    })
    if (!this.isGroup) return
    this.groupData = UCPr.botCfg.getConfig('group')
    this.isClose = _.isEqual(_.get(this.groupData, `${this.groupId}.enable`), ['UC-switchBot'])
  }

  init() {
    if (!Check.file(Path.switchBotjson)) {
      switchBotData = file.JSONsaver(Path.switchBotjson, [])
    } else {
      switchBotData = file.JSONreader(Path.switchBotjson)
    }
    tempData = _.cloneDeep(UCPr.botCfg.getConfig('group'))
    Data.watch(Path.switchBotjson, () => (switchBotData = file.JSONreader(Path.switchBotjson)))
    init()
    Data.watch(Path.get('botConfig', 'group.yaml'), init)
  }

  async openBot() {
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (!this.isClose) {
      return this.reply('当前已经是开启状态了哦~', true)
    }
    this.open()
    Data.remove(switchBotData, this.groupId)
    file.JSONsaver(Path.switchBotjson, switchBotData)
    return this.reply(this.Cfg.openMsg.replace(/BotName/gi, this.BotName))
  }

  open() {
    const oriData = _.get(tempData, `${this.groupId}.enable`)
    if (!oriData || _.isEqual(oriData, ['UC-switchBot'])) {
      return _.unset(this.groupData, `${this.groupId}.enable`)
    }
    _.set(this.groupData, `${this.groupId}.enable`, oriData)
  }

  async closeBot() {
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (this.isClose) return this.reply('当前已经是关闭状态了哦~', true)
    _.set(this.groupData, `${this.groupId}.enable`, ['UC-switchBot'])
    switchBotData.push(this.groupId)
    file.JSONsaver(Path.switchBotjson, switchBotData)
    return this.reply(this.Cfg.closeMsg.replace(/BotName/gi, this.BotName))
  }
}
