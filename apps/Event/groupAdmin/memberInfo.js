import { UCDate, UCPr } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'

class UCMemberInfo extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-memberInfo',
      dsc: 'UC群管·获取群员信息',
      rule: [
        {
          reg: /^#?(UC)?让我(看看|康康)\s*\d*$/i,
          fnc: 'memberInfo'
        }
      ]
    })
  }

  async memberInfo() {
    if (!this.isOpen) return false
    if (!this.verifyLevel(1)) return
    if (!this.checkUserPower()) return
    if (!this.targetId) return this.reply('请艾特或指定你要查看信息的群员')
    const member = this.UCGA.targetClient
    if (!member.info) return this.reply('未获取到群员信息：' + this.targetId)
    const replyMsg = this.makeMsg(member.info)
    return this.reply(replyMsg)
  }

  makeMsg(info) {
    const { nickname, card, age, role, title, sex } = info
    let msg = this.memStr
    msg += `\nQQ昵称：${nickname}`
    if (card) msg += `\n群名片：${card}`
    if (title) msg += `\n头衔：${title}`
    if (age) msg += `\n年龄：${age}`
    msg += `\n性别：${sex === 'male' ? '男' : sex === 'female' ? '女' : '未知'}`
    msg += `\n群权限：${role === 'admin' ? '管理员' : role === 'owner' ? '群主' : '成员'}`
    // eslint-disable-next-line no-unused-vars
    const { area, join_time, last_sent_time, shutup_time, level, rank, title_expire_time } = info
    if (area) msg += `\n所在地区：${area}`
    if (level) msg += `\n聊天等级：${level}`
    if (rank) msg += `\n聊天状态：${rank}`
    if (join_time) msg += `\n入群时间：${UCDate.format(join_time * 1000)}`
    if (last_sent_time) msg += `\n上次发言：${UCDate.format(last_sent_time * 1000)}`
    if (shutup_time && shutup_time > Date.now() / 1000) msg += `\n禁言到期时间：${UCDate.format(shutup_time * 1000)}`
    // if (title_expire_time) msg += `\n头衔过期时间：${UCDate.format(title_expire_time * 1000)}`
    return msg
  }
}

UCPr.EventInit(UCMemberInfo)