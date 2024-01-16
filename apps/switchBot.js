import { Path, file, UCPr, Data, Check } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

function init() {
  if (!_.isArray(switchBotData)) return
  setTimeout(() => {
    const groupData = UCPr.defaultCfg.getConfig('group')
    tempData = _.cloneDeep(groupData)
    for (const groupId of switchBotData) {
      _.set(groupData, `${groupId}.enable`, ['UC-switchBot'])
    }
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
    this.groupData = UCPr.defaultCfg.getConfig('group')
    this.isClose = _.isEqual(_.get(this.groupData, `${e.group_id}.enable`), ['UC-switchBot'])
  }

  init() {
    if (!switchBotData) {
      if (!Check.file(Path.switchBotjson)) {
        file.JSONsaver(Path.switchBotjson, [987654321])
      }
      tempData = _.cloneDeep(UCPr.defaultCfg.getConfig('group'))
      switchBotData = file.JSONreader(Path.switchBotjson)
      Data.watch(Path.switchBotjson, () => {
        switchBotData = file.JSONreader(Path.switchBotjson)
      })
      init()
      Data.watch(Path.get('botConfig', 'group.yaml'), init)
    }
  }

  async openBot(e) {
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (!this.isClose) {
      return e.reply('当前已经是开启状态了哦~', true)
    }
    this.open()
    Data.remove(switchBotData, this.groupId)
    file.JSONsaver(Path.switchBotjson, switchBotData)
    return e.reply(this.Cfg.openMsg.replace('BotName', this.BotName))
  }

  open() {
    const oriData = _.get(tempData, `${this.groupId}.enable`)
    if (!oriData || _.isEqual(oriData, ['UC-switchBot'])) {
      _.unset(this.groupData, `${this.groupId}.enable`)
    } else {
      _.set(this.groupData, `${this.groupId}.enable`, oriData)
    }
  }

  async closeBot(e) {
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (this.isClose) {
      return e.reply('当前已经是关闭状态了哦~', true)
    }
    _.set(this.groupData, `${this.groupId}.enable`, ['UC-switchBot'])
    switchBotData.push(this.groupId)
    file.JSONsaver(Path.switchBotjson, switchBotData)
    return e.reply(this.Cfg.closeMsg.replace('BotName', this.BotName))
  }
}
