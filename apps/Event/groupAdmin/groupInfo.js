import { Data, UCDate, UCPr, common } from '../../../components/index.js'
import { UCEvent } from '../../../models/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

class UCGroupInfo extends UCEvent {
  constructor(e) {
    super({
      e,
      name: 'UC-groupInfo',
      dsc: 'UC群管·获取群信息',
      event: 'message',
      rule: [
        {
          reg: /^#(UC)?获取群列表$/i,
          fnc: 'GroupList'
        },
        {
          reg: /^#(UC)?获取群信息(\d+)?$/i,
          fnc: 'GroupInfo'
        }
      ]
    })
  }

  async GroupList() {
    if (!this.isOpen) return false
    if (!this.verifyLevel(4)) return
    const groupsInfo = _.sortBy(Array.from(Bot.gl.values()), 'group_id')
    const msgArr = Data.makeArrStr(groupsInfo, { property: 'group_name', property2: 'group_id' })
    return this.reply(`总群数：${groupsInfo.length}\n\n` + msgArr)
  }

  async GroupInfo(e) {
    if (!this.isOpen) return false
    if (!this.verifyLevel(4)) return
    const GroupsInfo = Object.fromEntries(Bot.gl)
    const groupId = this.msg.match(/\d+/)?.[0]
    if (groupId) {
      const info = GroupsInfo[groupId]
      if (!info) return this.reply(`我不在群${groupId}中哦~`)
      const msg = makeMsg(info)
      return this.reply([segment.image(common.getAvatarUrl(info.group_id, 'group')), msg])
    }
    const groupsInfo = _.sortBy(_.values(GroupsInfo), 'group_id')
    const msgArr = groupsInfo.map((info, index) => [segment.image(common.getAvatarUrl(info.group_id, 'group')), `${index + 1}、${makeMsg(info)}`])
    const title = `群信息，总群数：${groupsInfo.length}`
    const replyMsg = await common.makeForwardMsg(e, [title, ...msgArr], title)
    return this.reply(replyMsg)
  }

}

function makeMsg(info) {
  const { group_id, group_name, member_count, owner_id, admin_flag } = info
  let msg = `${group_name}（${group_id}）`
  msg += `\n总人数：${member_count}`
  msg += `\n群主：${owner_id}`
  msg += `\n管理员：${admin_flag ? '是' : '否'}`
  const { active_member_count, create_time, last_join_time, last_sent_time, shutup_time_me, shutup_time_whole } = info
  if (active_member_count) msg += `\n活跃人数：${active_member_count}`
  if (create_time) msg += `\n创建时间：${UCDate.format(create_time * 1000)}`
  if (last_join_time) msg += `\n入群时间：${UCDate.format(last_join_time * 1000)}`
  if (last_sent_time) msg += `\n上次发言：${UCDate.format(last_sent_time * 1000)}`
  if (shutup_time_me) msg += `\n被禁言时刻：${UCDate.format(shutup_time_me * 1000)}`
  if (shutup_time_whole) msg += '\n已开启全体禁言'
  return msg
}

UCPr.EventInit(UCGroupInfo)