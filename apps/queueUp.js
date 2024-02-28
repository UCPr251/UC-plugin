import { Path, Check, common, file } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

export default class UCQueueUp extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-queueUp',
      dsc: '群内排队',
      event: 'message.group',
      rule: [
        {
          reg: /^#?(UC)?创建排队$/i,
          fnc: 'setQueueUp'
        },
        {
          reg: /^#?(UC)?排队$/i,
          fnc: 'queueUp'
        },
        {
          reg: /^#?(UC)?完成$/,
          fnc: 'finishQueueUp'
        },
        {
          reg: /^#?(UC)?(开启|关闭|结束)排队$/i,
          fnc: 'OCQueueUp'
        },
        {
          reg: /^#?(UC)?排队信息$/i,
          fnc: 'getQueueUpInfo'
        },
        {
          reg: /^#?(UC)?队列$/i,
          fnc: 'getList'
        }
      ]
    })
  }

  async setQueueUp() {
    if (!this.verifyPermission()) return false
    const queueUpData = getData()
    const info = queueUpData[this.groupId]
    if (info && info.ing) return this.reply('上次排队尚未结束，请先结束再创建', true)
    queueUpData[this.groupId] = {
      ing: true,
      joining: [],
      finished: []
    }
    savaData(queueUpData)
    return this.reply('创建排队成功，群友可通过#排队 参与排队', true)
  }

  async queueUp(e) {
    if (!this.verifyLevel()) return false
    let userId = e.sender.user_id
    if (this.at && this.verifyPermission()) {
      userId = this.at
    }
    const queueUpData = getData()
    const info = queueUpData[this.groupId]
    if (!info) return this.reply('本群尚未创建排队', true)
    if (!info.ing) return this.reply('本次排队已结束', true)
    if (Check.str(info.finished, userId)) return this.reply('你已经完成了本次排队哦', true)
    const index = info.joining.indexOf(userId)
    if (index > -1) return this.reply(`你已经报过名了哦~\n你当前位于第${index + 1}位，和${this.BotName}一起耐心等待吧！`, true)
    info.joining.push(userId)
    savaData(queueUpData)
    return this.reply(`排队成功！你当前位于第${info.joining.length}位`, true)
  }

  async finishQueueUp() {
    if (!this.at || !this.verifyPermission()) return false
    const queueUpData = getData()
    const info = queueUpData[this.groupId]
    if (!info || !info.ing) return false
    const name = await common.getName(this.groupId, this.at)
    if (Check.str(info.finished, this.at)) return this.reply(`群员${name}（${this.at}）本次排队已完成`)
    const index = info.joining.indexOf(this.at)
    if (index === -1) return this.reply(`群员${name}（${this.at}）未参与排队`)
    _.pull(info.joining, this.at)
    info.finished.push(this.at)
    savaData(queueUpData)
    const len = info.joining.length
    if (!len) return this.reply('所有排队任务已经完成了哦~')
    const newIndex = index > len - 1 ? len - 1 : index
    return this.reply([segment.at(info.joining[newIndex]), '排到你了哦！别错过了哦~'])
  }

  async OCQueueUp() {
    if (!this.verifyPermission()) return false
    const queueUpData = getData()
    const info = queueUpData[this.groupId]
    if (!info) return this.reply('本群尚未创建排队', true)
    const isOpen = /开启/.test(this.msg)
    const status = isOpen ? '开启' : '关闭'
    if (info.ing === isOpen) return this.reply(`当前群内排队已经是${status}状态了`)
    info.ing = isOpen
    savaData(queueUpData)
    return this.reply(`成功${status}本群排队啦！`, true)
  }

  async getQueueUpInfo(e) {
    if (!this.verifyPermission()) return false
    const queueUpData = getData()
    const info = queueUpData[this.groupId]
    if (!info) return this.reply('本群尚未创建排队', true)
    const memberData = await common.getMemberObj(e.group)
    const playersInfo = info.joining
      .map((player, index) => {
        const memInfo = memberData[player]
        const name = memInfo.card || memInfo.nickname
        return `${index + 1}、${name}（${player}）`
      })
    const finishedInfo = info.finished
      .map((player, index) => {
        const memInfo = memberData[player]
        const name = memInfo.card || memInfo.nickname
        return `${index + 1}、${name}（${player}）`
      })
    const title = '排队信息'
    const reply = []
    if (!_.isEmpty(playersInfo)) {
      reply.push('排队中用户')
      reply.push(playersInfo.join('\n'))
    }
    if (!_.isEmpty(finishedInfo)) {
      reply.push('已完成用户')
      reply.push(finishedInfo.join('\n'))
    }
    if (_.isEmpty(reply)) return this.reply('当前没有排队信息哦')
    const replyMsg = await common.makeForwardMsg(e, reply, title)
    return this.reply(replyMsg)
  }

  async getList(e) {
    if (!this.verifyLevel()) return false
    const queueUpData = getData()
    const info = queueUpData[this.groupId]
    if (!info) return false
    if (_.isEmpty(info.joining)) return this.reply('排队队列为空')
    const memberData = await common.getMemberObj(e.group)
    const playersInfo = info.joining
      .map((player, index) => {
        const memInfo = memberData[player]
        const name = memInfo.card || memInfo.nickname
        return `${index + 1}、${name}（${player}）`
      })
    const index = info.joining.indexOf(e.sender.user_id)
    let replyMsg = '排队队列\n\n' + playersInfo.join('\n')
    if (index > -1) {
      replyMsg += `\n\n你当前位于第${index + 1}位，和${this.BotName}一起耐心等待吧！`
    }
    return this.reply(replyMsg)
  }

}

function getData() {
  return file.JSONreader(Path.queueUpjson, {})
}

function savaData(data) {
  file.JSONsaver(Path.queueUpjson, data)
}