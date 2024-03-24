import { common, log, UCPr } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'

class UCIncrease extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-Increase',
      dsc: 'UC群管·群员增加',
      event: 'notice.group.increase',
      Cfg: 'GAconfig.Increase'
    })
    if (!e) return
    this.userName = e.nickname ?? this.userId
    this.info = `<${this.userName}>（${this.userId}）`
  }

  async accept() {
    if (!this.isOpen) return false
    if (this.userId === this.qq) return false
    this.dealNotice()
    this.dealKickBlack()
  }

  async dealNotice() {
    if (!this.Cfg.isNotice) return
    const notice = this.B ? '黑名单' : '新群员'
    const replyMsg = [`【${notice}入群通知】`]
    replyMsg.push(segment.image(common.getAvatarUrl(this.groupId, 'group')))
    replyMsg.push('群聊：' + this.groupId)
    replyMsg.push('\n群号：' + this.groupId)
    replyMsg.push(segment.image(common.getAvatarUrl(this.userId)))
    replyMsg.push(notice + '：' + this.userName)
    replyMsg.push('\n账号：' + this.userId)
    await common.sendMsgTo(this.GAconfig.permission?.Master[0] ?? UCPr.GlobalMaster[0], replyMsg, 'Friend')
  }

  async dealKickBlack() {
    if (!this.B || !this.Cfg.isKickBlack) return false
    log.white(`[黑名单入群]${log._red(this.info)} 群聊：${log._red(this.groupStr)}`)
    if (this.botIsAdminOrOwner && this.Cfg.isDetecteBlack) {
      this.group.kickMember(this.userId)
        .catch(e => log.error('踢出黑名单失败：', e))
        .then(() => {
          log.white(`[踢出黑名单]${this.info} 群聊：${this.groupStr}`)
          this.reply(this.Cfg.kickBlackReply.replace(/info/g, this.info).replace(/BotName/gi, this.BotName))
        })
      const _chatData = await common.getChatHistoryArr(this.group, undefined, 10)
      const chatData = _chatData.filter(msg => msg.user_id == this.userId)
      if (chatData.length) {
        const count = await common.recallMsgArr(this.group, chatData.reverse())
        log.white(`[撤回黑名单消息]${this.info} 群聊：${this.groupStr} 成功撤回${count}条消息`)
      }
    }
  }

}

UCPr.EventInit(UCIncrease)