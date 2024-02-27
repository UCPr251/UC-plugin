import { common, UCDate, UCPr } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'

class UCMute extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-mute',
      dsc: 'UC群管·禁言群员',
      Cfg: 'GAconfig.mute',
      rule: [
        {
          reg: /^#(UC)?(全体)?禁言(?!信息|列表)(.*)/i,
          fnc: 'muteMember'
        },
        {
          reg: /^#(UC)?(全体|全部)?解禁$/i,
          fnc: 'releaseMute'
        },
        {
          reg: /^#(UC)?禁言(信息|列表)$/i,
          fnc: 'groupMuteInfo'
        }
      ]
    })
  }

  async muteMember(e) {
    if (!this.defaultVerify(false)) return
    if (e.atme) return
    if (/全体/.test(this.msg)) {
      if (!this.verifyPermission(this.Cfg.muteAll)) return
      if (e.group.all_muted) return this.reply('当前已经开启全体禁言了哦~')
      const status = await e.group.muteAll(true).catch(err => log.error(err))
      if (status) return this.reply(this.Cfg.allMuteReply)
      return this.errorReply()
    }
    if (!this.verifyPermission(this.Cfg.use)) return
    if (!this.at) return this.reply('请艾特要禁言的群员')
    if (!this.checkUserPower(this.at)) return this.noPerReply()
    if (!this.checkBotPower(this.at)) return this.noPowReply()
    const timeChinese = this.msg.match(/#?禁言(.*)/)?.[1].trim()
    let seconds = timeChinese === '' ? this.Cfg.defaultMute : UCDate.transformChineseSeconds(timeChinese)
    seconds ||= this.Cfg.defaultMute
    if (!this.M) seconds = Math.min(seconds, this.Cfg.MUTE_MAX)
    seconds = Math.min(seconds, 2592000)
    await e.group.muteMember(this.at, seconds).catch(err => log.error(err))
    const name = this.getMemName(this.at)
    const info = `<${name}>（${this.at}）`
    const time = UCDate.diff(seconds, 's').toStr()
    if (seconds === 0) return this.reply(this.Cfg.releaseReply.replace('info', info).replace('time', time))
    return this.reply(this.Cfg.muteReply.replace('info', info).replace('time', time))
  }

  async releaseMute(e) {
    if (!this.defaultVerify(false)) return false
    if (e.atme) return false
    if (/全体/.test(this.msg)) {
      if (!this.verifyPermission(this.Cfg.muteAll)) return false
      if (!e.group.all_muted) return this.reply('当前没有开启全体禁言哦~')
      const status = await e.group.muteAll(false)
      if (status) return this.reply(this.Cfg.releaseAllMuteReply)
      return this.errorReply()
    }
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (/全部/.test(this.msg)) {
      const releasedNum = await common.releaseAllMute(e.group)
      return this.reply(this.Cfg.releaseAllMutedReply.replace('num', releasedNum))
    }
    if (!this.at) return this.reply('请艾特要解除禁言的群员')
    const memClient = e.group.pickMember(this.at)
    if (!memClient.mute_left) return this.reply('对方没有被禁言哦~')
    await common.muteMember(this.at, this.groupId, 0)
    const name = this.getMemName(this.at)
    const info = `<${name}>（${this.at}）`
    return this.reply(this.Cfg.releaseReply.replace('info', info))
  }

  async groupMuteInfo(e) {
    if (!this.defaultVerify()) return false
    if (e.group.all_muted) return this.reply('当前处于全体禁言中')
    const muteInfoList = await common.getMuteList(e.group, true)
    if (!muteInfoList.length) return this.reply('当前没有人被禁言哦~')
    const title = '群员禁言信息'
    const replyMsg = await common.makeForwardMsg(e, [title, ...muteInfoList], title)
    return this.reply(replyMsg)
  }

}

UCPr.EventInit(UCMute)