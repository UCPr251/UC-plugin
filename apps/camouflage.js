import { Path, Data, UCPr, UCDate, Check, common } from '../components/index.js'
import { UCPlugin, UCEvent } from '../models/index.js'

export default class UCCamouflage extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-camouflage',
      dsc: '伪装群员',
      event: 'message.group',
      Cfg: 'config.camouflage',
      rule: [
        {
          reg: /^#?(UC)?伪装$/i,
          fnc: 'camouflage'
        },
        {
          reg: /^#?(UC)?结束伪装$/i,
          fnc: 'restore'
        }
      ]
    })
    if (!e) return
    this.CDData = '[UC]camouflage:CD'
    this.redisData = `[UC]camouflage:${this.groupId}:${this.userId}`
    this.limitData = `[UC]camouflage:limit:${this.userId}`
  }

  async camouflage() {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyPermission(this.Cfg.use)) return
    if (UCPr.wz.ing) return this.reply(`当前正在执行群聊${UCPr.wz.groupId}对群员${UCPr.wz.userId}的伪装任务\n结束时间：${UCPr.wz.endTime}\n冷却时间：${UCPr.wz.CD}分钟\n请等待伪装和冷却结束`)
    if (!this.at) return this.reply('请同时艾特要伪装的群员')
    if (!this.M) {
      const CD = await Data.redisGet(this.CDData, 0)
      if (CD) return this.reply('伪装功能冷却中！冷却结束时间：' + CD)
      const times = await Data.redisGet(this.limitData, 0)
      if (times + 1 > this.Cfg.timesLimit) {
        return this.reply(`你今天已经伪装${times}次了，休息一下吧~`)
      }
      Data.redisSet(this.limitData, times + 1, UCDate.EXsecondes)
    }
    const memClient = this.group.pickMember(this.at)
    const selfClient = this.group.pickMember(this.e.self_id)
    if (!memClient || !selfClient || !memClient._info || !selfClient._info) return this.reply('获取信息失败，请稍后重试')
    const memAvatarUrl = memClient.getAvatarUrl()
    const selfAvatarUrl = selfClient.getAvatarUrl()
    this.memAvatarPath = await Data.download(memAvatarUrl, Path.temp, 'memAvatar')
    this.selfAvatarPath = await Data.download(selfAvatarUrl, Path.temp, 'selfAvatar')
    if (!Check.file(this.memAvatarPath)) return this.reply('下载群员头像失败，请稍后重试')
    if (!Check.file(this.selfAvatarPath)) return this.reply('下载自身头像失败，请稍后重试')
    const { card, nickname } = memClient.info
    this.e.bot.setAvatar(this.memAvatarPath).catch(e => log.error(e))
    this.e.group.setCard(this.e.self_id, card || nickname).catch(e => log.error(e))
    this.selfCard = selfClient.info.card
    if (this.Cfg.isSilent) {
      const groupData = UCPr.defaultCfg.getConfig('group')
      groupData[this.groupId] ??= {}
      UCPr.wz.oriEnable = groupData[this.groupId].enable // 群原始功能白名单
      groupData[this.groupId].enable = ['UC-camouflage']
    }
    UCPr.wz.ing = true // 状态
    UCPr.wz.count = 0 // 消息计数
    UCPr.wz.key = `${this.groupId}:${this.at}` // 标识
    UCPr.wz.groupId = this.groupId // 群号
    UCPr.wz.userId = this.at // 被伪装的群员
    UCPr.wz.CD = this.Cfg.CD // CD
    UCPr.wz.msgLimit = this.Cfg.msgLimit // 消息数量限制
    UCPr.wz.endTime = UCDate.getTime(this.Cfg.time, 'm') // 结束时间
    const fnc = this.restoreFnc.bind(this)
    UCPr.wz.restoreFnc = fnc // 恢复函数
    UCPr.wz.timer = setTimeout(fnc, this.Cfg.time * 60 * 1000) // 定时器
    const client = new UCCamouflageEvent(this.e, UCPr.wz.key)
    client.userId = this.at
    client.setUCcontext(undefined, 0)
    this.finishUCcontext = client.finishUCcontext.bind(client)
    return this.reply(`开始伪装任务，持续${this.Cfg.time}分钟~`)
  }

  async restore() {
    if (!this.verifyPermission(this.Cfg.use)) return
    if (!UCPr.wz.ing) return this.reply('当前没有在伪装哦~')
    clearTimeout(UCPr.wz.timer)
    return UCPr.wz.restoreFnc()
  }

  restoreFnc(isMsgLimit = false) {
    this.finishUCcontext()
    this.e.bot.setAvatar(this.selfAvatarPath).catch(e => log.error(e))
    this.e.group.setCard(this.e.self_id, this.selfCard).catch(e => log.error(e))
    this.Cfg.CD && Data.redisSet(this.CDData, UCDate.getTime(this.Cfg.CD, 'm'), this.Cfg.CD * 60)
    if (this.Cfg.isSilent) {
      const groupData = UCPr.defaultCfg.getConfig('group')
      if (UCPr.wz.oriEnable) {
        groupData[this.groupId].enable = UCPr.wz.oriEnable
      } else {
        delete groupData[this.groupId].enable
      }
    }
    const count = UCPr.wz.count
    UCPr.wz = {}
    const msg = isMsgLimit ? '伪装已达消息数量上限，自动结束伪装' : '伪装任务已结束'
    return this.reply(msg + `\n期间共发送${count}条消息` + (this.Cfg.CD ? `，进入${this.Cfg.CD}分钟冷却` : ''))
  }

}

class UCCamouflageEvent extends UCEvent {
  constructor(e, key) {
    super({
      e,
      name: 'UC-CamouflageEvent',
      dsc: '执行伪装'
    })
    this.key = key
    this.setFnc = 'repeat'
  }

  async repeat() {
    if (!UCPr.wz.ing) return this.finishUCcontext()
    const key = `${this.groupId}:${this.userId}`
    if (key !== UCPr.wz.key) return
    const replyMsg = common.makeMsg(this.e.message)
    if (this.e.source) {
      const msg = (await common.getChatHistoryArr(this.group, this.e.source.seq, 1))[0]
      replyMsg.unshift({
        type: 'reply',
        id: msg.message_id
      })
    }
    this.reply(replyMsg)
    UCPr.wz.count++
    if (UCPr.wz.count >= UCPr.wz.msgLimit) return UCPr.wz.restoreFnc(true)
    return false
  }

}

UCPr.EventInit(UCCamouflageEvent)