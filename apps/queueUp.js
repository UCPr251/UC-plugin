import { Path, Check, common, file, UCPr, Permission } from '../components/index.js'
import _ from 'lodash'

await init()

export class UCQueueUp extends plugin {
  constructor() {
    super({
      name: 'UC-queueUp',
      dsc: '群内排队',
      event: 'message.group',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?UC创建排队$/i,
          fnc: 'setQueueUp'
        },
        {
          reg: /^#?(UC)?排队$/i,
          fnc: 'queueUp'
        },
        {
          reg: /^#完成$/,
          fnc: 'finishQueueUp'
        },
        {
          reg: /^#?UC(开启|关闭)排队$/i,
          fnc: 'OCQueueUp'
        },
        {
          reg: /^#?UC排队信息$/i,
          fnc: 'getPrizeDraw'
        }
      ]
    })
  }

  verify() {
    const per = new Permission(this.e.sender.user_id)
    if (per.judge()) return true
    return false
  }

  async setQueueUp(e) {
    if (!this.verify()) return false
    const queueUpData = getData()
    const info = queueUpData[e.group_id]
    if (info && info.ing) return e.reply('上次排队尚未结束，请先结束再创建', true)
    queueUpData[e.group_id] = {
      ing: true,
      joining: [],
      finished: []
    }
    savaData(queueUpData)
    return e.reply('创建排队成功，群友可通过#排队 参与排队', true)
  }

  async queueUp(e) {
    let userId = e.sender.user_id
    if (e.at && this.verify()) {
      userId = e.at
    }
    const queueUpData = getData()
    const info = queueUpData[e.group_id]
    if (!info) return e.reply('本群尚未创建排队', true)
    if (!info.ing) return e.reply('本次排队已结束', true)
    if (Check.str(info.finished, userId)) return e.reply('你已经完成了本次排队哦', true)
    const index = queueUpData.joining.indexOf(userId)
    if (index > -1) return e.reply(`你已经报过名了哦~\n你当前位于第${index + 1}位，和${UCPr.BotName}一起耐心等待吧！`, true)
    queueUpData.joining.push(userId)
    savaData(queueUpData)
    return e.reply(`排队成功！你当前位于第${queueUpData.joining.length}位`, true)
  }

  async finishQueueUp(e) {
    if (!e.at || !this.verify()) return false
    const queueUpData = getData()
    const info = queueUpData[e.group_id]
    if (!info || !info.ing) return e.reply('当前群无进行中的排队任务')
    const name = await common.getName(e.group_id, e.at)
    if (Check.str(info.finished, e.at)) return e.reply(`群员${name}（${e.at}）本次排队已完成`)
    if (!Check.str(info.joining, e.at)) return e.reply(`群员${name}（${e.at}）未参与排队`)
    _.pull(info.joining, e.at)
    info.finished.push(e.at)
    savaData(queueUpData)
    return e.reply('操作成功')
  }

  async OCQueueUp(e) {
    if (!this.verify()) return false
    const queueUpData = getData()
    const info = queueUpData[e.group_id]
    if (!info) return e.reply('本群尚未创建排队')
    const isOpen = /开启/.test(e.msg)
    const status = isOpen ? '开启' : '关闭'
    if (info.ing === isOpen) return e.reply(`当前群内排队已经是${status}状态了`)
    info.ing = isOpen
    savaData(queueUpData)
    return e.reply(`成功${status}本群排队啦！`, true)
  }

  async getPrizeDraw(e) {
    // if (!this.verify()) return false
    const queueUpData = getData()
    const info = queueUpData[e.group_id]
    const memberData = await common.getMemberObj(e.group)
    const playersInfo = _.sortBy(info.joining)
      .map((player, index) => {
        let memInfo = memberData[player]
        let name = memInfo.card || memInfo.nickname
        return `${index + 1}、${name}（${player}）`
      })
    const finishedInfo = _.sortBy(info.finished)
      .map((player, index) => {
        let memInfo = memberData[player]
        let name = memInfo.card || memInfo.nickname
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
    if (_.isEmpty(reply)) return e.reply('当前没有排队信息哦')
    const replyMsg = await common.makeForwardMsg(e, reply, title)
    return e.reply(replyMsg)
  }
}

async function init() {
  if (!Check.file(Path.queueUpjson)) {
    file.JSONsaver(Path.queueUpjson, {})
  }
}

function getData() {
  file.JSONreader(Path.queueUpjson)
}

function savaData(data) {
  file.JSONsaver(Path.queueUpjson, data)
}