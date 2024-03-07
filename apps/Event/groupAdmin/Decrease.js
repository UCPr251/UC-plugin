import { UCPr, Admin, common } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'

class UCDecreaseEvent extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-Decrease',
      dsc: 'UC群管·群员退出',
      Cfg: 'GAconfig.Decrease',
      event: 'notice.group.decrease'
    })
    if (!e) return
    this.userName = (e.member?.card || e.member?.nickname) ?? this.userId
    this.info = `<${this.userName}>（${this.userId}）`
  }

  async accept() {
    if (!this.isOpen) return false
    this.dealBlack()
    this.dealNotice()
  }

  async dealBlack() {
    if (this.B) return log.white(`[黑名单退群]${this.info} 群聊：${this.groupStr}`)
    if (this.Cfg.isAutoBlack && this.e.operator_id === this.userId) {
      Admin.groupPermission('BlackQQ', this.userId, this.groupId, true)
    }
  }

  async dealNotice() {
    if (!this.Cfg.isNotice) return
    const notice = this.B ? '黑名单' : '群员'
    const replyMsg = [`【${notice}退群通知】`]
    replyMsg.push(segment.image(common.getAvatarUrl(this.groupId, 'group')))
    replyMsg.push('\n群聊：' + this.groupName)
    replyMsg.push('\n群号：' + this.groupId)
    replyMsg.push(segment.image(common.getAvatarUrl(this.userId)))
    replyMsg.push(notice + '：' + this.userName)
    replyMsg.push('\n' + notice + 'QQ：' + this.userId)
    await common.sendMsgTo(this.GAconfig.permission?.Master[0] ?? UCPr.GlobalMaster[0], replyMsg, 'Private')
  }

}

UCPr.EventInit(UCDecreaseEvent)