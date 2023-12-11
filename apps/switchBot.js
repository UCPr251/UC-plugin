import { Path, file, UCPr, Data, Check, common } from '../components/index.js'
import { UCPlugin, UCEvent } from '../model/index.js'
import loader from '../../../lib/plugins/loader.js'
import _ from 'lodash'

class UCSwitchBotEvent extends UCEvent {
  constructor(e) {
    super({
      e,
      name: 'UC-switchBotEvent',
      event: 'message.group',
      Cfg: 'config.switchBot'
    })
    if (!this.isGroup) return
    this.groupData = UCPr.defaultCfg.getConfig('group')
    this.isClose = _.isEqual(_.get(this.groupData, `${e.group_id}.enable`), ['UC-switchBot'])
  }

  accept(e) {
    if (this.isClose) {
      if (!this.verifyPermission(this.Cfg.closedCommand, { isReply: false })) return false
      if (this.Cfg.isAt && e.atme) {
        this.dealMsg(e)
        return 'return'
      }
      const reg = new RegExp(`^\\s*${UCPr.BotName}`, 'i')
      if (this.Cfg.isPrefix && reg.test(this.msg)) {
        e.message.forEach(v => {
          if (v.text) v.text = v.text.replace(reg, '')
        })
        this.dealMsg(e)
        return 'return'
      }
    }
  }

  async dealMsg(e) {
    _.unset(this.groupData, `${this.groupId}.enable`)
    await common.sleep(0.2)
    await loader.deal(e)
    _.set(this.groupData, `${this.groupId}.enable`, ['UC-switchBot'])
    return true
  }

}

UCPr.EventInit(UCSwitchBotEvent)

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
          reg: `^#${UCPr.BotName}(${UCPr.switchBot.closeReg?.trim() || '下班|休息'})$`,
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
    const oriData = _.get(tempData, `${this.groupId}.enable`)
    if (!oriData || _.isEqual(oriData, ['UC-switchBot'])) {
      _.unset(this.groupData, `${this.groupId}.enable`)
    } else {
      _.set(this.groupData, `${this.groupId}.enable`, oriData)
    }
    Data.remove(switchBotData, this.groupId)
    file.JSONsaver(Path.switchBotjson, switchBotData)
    return e.reply(this.Cfg.openMsg.replace('BotName', this.BotName))
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
