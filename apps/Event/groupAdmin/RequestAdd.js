import { segment } from 'icqq'
import { log, UCPr, common } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'

class UCRequestGroupAdd extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-RequestAdd',
      dsc: 'UC群管·入群申请',
      event: 'request.group.add',
      Cfg: 'GAconfig.RequestAdd'
    })
    if (!e) return
    this.info = `<${e.nickname ?? this.userId}>（${this.userId}）`
  }

  async accept() {
    if (!this.isOpen) return false
    this.dealApprove()
    this.dealBlack()
    this.dealNotice()
  }

  async dealApprove() {
    if (this.B || !this.Cfg.isAutoApprove) return
    if (!this.botIsAdminOrOwner) return
    await this.e.approve(true)
    log.mark(`群员${this.info}申请入群${this.groupStr}，自动同意`)
  }

  async dealBlack() {
    if (!this.B || !this.Cfg.isAutoRefuseBlack) return
    if (!this.botIsAdminOrOwner) return
    await this.e.approve(false)
    log.mark(`黑名单用户${log._red(this.info)}申请入群${log._red(this.groupStr)}，自动拒绝`)
  }

  async dealNotice() {
    if (this.B || (!this.Cfg.isNoticeGroup && !this.Cfg.isNoticeMaster)) return
    const replyMsg = ['[入群申请通知]']
    replyMsg.push(segment.image(common.getAvatarUrl(this.userId)))
    replyMsg.push('昵称：' + this.e.nickname)
    replyMsg.push('\n账号：' + this.userId)
    if (this.e.inviter_id) replyMsg.push('\n邀请人：' + this.getMemStr(this.e.inviter_id))
    if (this.e.comment) replyMsg.push('\n申请理由：' + this.e.comment)
    if (this.e.tips) {
      replyMsg.push('\nTips：' + this.e.tips)
    }
    replyMsg.push('\n可引用该消息回复#同意 或#拒绝 处理申请')
    if (this.Cfg.isNoticeGroup) this.reply(replyMsg)
    if (!this.Cfg.isNoticeMaster) return
    log.red(123)
    replyMsg.splice(1, 0, '\n群聊：' + this.groupId, '\n群昵称：' + this.groupName, segment.image(common.getAvatarUrl(this.groupId, 'group')))
    await common.sendMsgTo(this.GAconfig.permission?.Master[0] ?? UCPr.GlobalMaster[0], replyMsg, 'Private')
  }

}

UCPr.EventInit(UCRequestGroupAdd)

class UCAgreeRefuseRequestGroupAdd extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-AgreeRefuseRequestGroupAdd',
      dsc: 'UC群管·入群申请处理',
      Cfg: 'GAconfig.RequestAdd',
      event: 'message',
      rule: [
        {
          reg: /^#?(UC)?(同意|拒绝)(群申请\s*\d{5,10})?$/i,
          fnc: 'deal'
        }
      ]
    })
  }

  async deal(e) {
    if (!this.defaultVerify()) return
    let userId = this.targetId, groupId = this.groupId
    if (e.source || !userId || !groupId) {
      if (!e.source) return false
      if (!e.source.message) return false
      userId = parseInt(e.source.message.match(/账号：(\d+)/)[1].trim())
      groupId ||= parseInt(e.source.message.match(/群聊：(\d+)/)[1].trim())
    }
    const systemMsg = await Bot.getSystemMsg()
    const event = systemMsg.find(v => v.request_type == 'group' && v.sub_type == 'add' && v.group_id === groupId && v.user_id === userId)
    if (!event || !event.approve) return this.reply('未找到该申请记录')
    const isAgree = this.msg.includes('同意')
    const result = await event.approve(isAgree)
    if (!result) return this.reply(`处理失败，${isAgree ? '同意' : '拒绝'}群${groupId}用户${userId}入群申请`)
    return this.reply(`已${isAgree ? '同意' : '拒绝'}该入群申请`)
  }

}

UCPr.EventInit(UCAgreeRefuseRequestGroupAdd)