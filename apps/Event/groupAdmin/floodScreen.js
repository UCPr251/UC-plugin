import { common, UCPr, log, Admin } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'

const ret = {}

class UCfloodScreen extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-floodScreen',
      dsc: 'UC群管·刷屏检测',
      Cfg: 'GAconfig.DetecteFloodScreen'
    })
  }

  async accept(e) {
    if (this.userId === e.self_id) return false
    if (!this.isOpen || !this.botIsAdminOrOwner) return false
    if (this.level > 0) return false
    if (this.B) {
      if (this.Cfg.isDetecteBlack) {
        const msgArr = await common.getPersonalChatHistoryArr(e.group, this.userId, e.seq, 5)
        await common.recallMsgArr(e.group, msgArr)
        log.white(`黑名单用户${log._red(this.getMemStr(this.userId))}于群${log._red(this.groupStr)}内发言，已自动撤回其消息并踢出`)
        return e.group.kickMember(this.userId)
      }
    }
    const _data = ret[this.groupId]
    clearTimeout(_data?.timer)
    if (!_data || this.userId !== _data.userId) {
      ret[this.groupId] = {
        userId: this.userId,
        count: 1
      }
    } else {
      const data = ret[this.groupId]
      data.count++
      if (this.Cfg.isWarn && data.count === this.Cfg.judgeNum - 2) {
        this.reply([segment.at(this.userId), this.Cfg.warnText])
      } else if (data.count >= this.Cfg.judgeNum) {
        this.punish()
        data.count = 1
      }
    }
    ret[this.groupId].timer = this.setTimeOut()
  }

  async punish() {
    this.reply([segment.at(this.userId), this.Cfg.punishText])
    if (!this.checkBotPower(this.userId)) return
    if (!this.Cfg.isPunish) return
    if (this.Cfg.punishMode === 'mute') {
      this.e.group.muteMember(this.userId, this.Cfg.muteTime * 60)
    } else if (this.Cfg.punishMode === 'kick') {
      this.e.group.kickMember(this.userId)
      if (this.Cfg.kickAndBlack) {
        Admin.groupPermission('BlackQQ', this.userId, this.groupId, true)
      }
    }
  }

  setTimeOut() {
    return setTimeout(() => delete ret[this.groupId], this.Cfg.timeRange * 1000)
  }

}

UCPr.EventInit(UCfloodScreen)