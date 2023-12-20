import { common, UCPr, Admin, Data } from '../../../components/index.js'
import { UCEvent } from '../../../model/index.js'
import _ from 'lodash'

class UCKick extends UCEvent {
  constructor(e) {
    super({
      e,
      name: 'UC-kick',
      dsc: 'UC群管·踢出群员',
      Cfg: 'GAconfig.kick',
      rule: [
        {
          reg: /^#?(UC)?(全局)?踢(黑名单\s*\d*)?$/,
          fnc: 'kickMember'
        }
      ]
    })
    this.setFnc = 'makeSure'
  }

  async kickMember(e) {
    if (!this.defaultVerify()) return
    if (/黑名单/.test(this.msg)) {
      return this.kickBlack(e)
    }
    if (!this.at) return this.reply('请艾特要踢的群员')
    if (!this.checkUserPower(this.at)) return this.noPerReply()
    if (!this.checkBotPower(this.at)) return this.noPowReply()
    if (this.Cfg.isAutoBlack) {
      Admin.groupPermission('BlackQQ', this.at, this.groupId)
    }
    if (this.Cfg.isAutoGlobalBlack) {
      Admin.globalPermission('BlackQQ', this.at)
    }
    const status = await this.e.group.kickMember(this.at)
    if (status) return this.reply(this.Cfg.kickReply)
    return this.errorReply()
  }

  async kickBlack(e) {
    let GroupsArr
    const isGlobal = /全局/.test(this.msg)
    const GroupsInfo = Object.fromEntries(e.bot?.gl ?? Bot.gl)
    if (!isGlobal) {
      const groupId = this.GM ? (this.msg.match(/\d+/)?.[0] || e.group_id) : e.group_id
      GroupsArr = [groupId]
    } else {
      if (!this.verifyLevel(4)) return
      GroupsArr = _.sortBy(Object.keys(GroupsInfo))
    }
    const groupToKick = []
    const noPow = []
    for (const groupId of GroupsArr) {
      const memberObj = await common.getMemberObj(groupId)
      if (!common.isAdminOrOwner(memberObj[e.self_id])) {
        noPow.push({
          groupId,
          name: GroupsInfo[groupId].group_name
        })
        continue
      }
      const memToKick = []
      for (const memId of _.keys(memberObj)) {
        if (this.isB(memId, groupId)) {
          const info = memberObj[memId]
          const name = info.card || info.nickname || memId
          memToKick.push({
            memId,
            name
          })
        }
      }
      if (memToKick.length > 0) {
        groupToKick.push({
          groupId,
          name: GroupsInfo[groupId].group_name,
          memToKick
        })
      }
    }
    if (groupToKick.length === 0) return this.reply('没有可清理的黑名单群员哦~')
    const groupToKickInfo = Data.makeArr(groupToKick, { property: 'name', property2: 'groupId', sep: '：' })
    const waitToClearMsgArr = groupToKick.map((info, index) => {
      const memArr = _.sortBy(info.memToKick, 'memId')
      const memInfo = Data.makeArrStr(memArr, { property: 'name', property2: 'memId' })
      return `群聊${groupToKickInfo[index]}\n\n黑名单群员：\n${memInfo}`
    })
    const noPowInfo = Data.makeArrStr(noPow, { property: 'name', property2: 'groupId' })
    const noPowerMsg = '权限不足无法执行操作的群聊：\n\n' + noPowInfo
    e.groupToKick = groupToKick
    this.setFunction()
    this.reply('待清理人员信息如下，请查看。[取消|确认]')
    await common.sleep(1)
    const title = '待清理人员信息'
    const waitToClearMsg = await common.makeForwardMsg(e, [noPowerMsg, title, ...waitToClearMsgArr], title)
    return this.reply(waitToClearMsg, false)
  }

  makeSure() {
    const { groupToKick } = this.getContext().makeSure
    if (this.isCancel()) return
    if (this.isSure()) {
      this.kickBlackMem(groupToKick)
      this.finishReply('确认操作，开始执行清理任务，每0.5s清理一次')
    }
  }

  /** 清理黑名单群员 */
  async kickBlackMem(groupToKick) {
    log.purple('开始清理黑名单群员')
    const worng = []
    const success = []
    for (const groupInfo of groupToKick) {
      const groupClient = common.pickGroup(groupInfo.groupId)
      for (const memInfo of groupInfo.memToKick) {
        await common.sleep(0.5)
        const info = `${memInfo.memId}（${memInfo.name}）`
        const status = await groupClient.kickMember(memInfo.memId)
        if (status) {
          log.debug(`成功清理群${groupInfo.groupId}用户${info}`)
          success.push(info)
        } else {
          log.warn(`群${groupInfo.groupId}清理用户${info}失败`)
          worng.push(info)
        }
      }
    }
    log.purple('清理黑名单群员结束')
    const replyMsgArr = [`本次清理了${success.length}个黑名单用户`]
    if (success.length !== 0) {
      replyMsgArr.push(Data.makeArrStr(success))
    }
    if (worng.length !== 0) {
      replyMsgArr.push('以下黑名单群员清理失败，可能是权限不足')
      replyMsgArr.push(Data.makeArrStr(worng))
    }
    const title = '清理黑名单执行结果'
    const replyMsg = await common.makeForwardMsg(this.e, [title, ...replyMsgArr], title)
    return this.reply(replyMsg)
  }

}

UCPr.EventInit(UCKick)