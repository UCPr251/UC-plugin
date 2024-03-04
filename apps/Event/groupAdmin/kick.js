import { common, UCPr, Admin, Data } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'
import _ from 'lodash'

class UCKick extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-kick',
      dsc: 'UC群管·踢出群员',
      Cfg: 'GAconfig.kick',
      rule: [
        {
          reg: /^#(UC)?(全局)?踢(黑名单\s*\d*)?$/i,
          fnc: 'kickMember'
        }
      ]
    })
    this.setFnc = '_makeSure'
  }

  async kickMember() {
    if (!this.defaultVerify()) return
    if (/黑名单/.test(this.msg)) {
      return this.kickBlack()
    }
    if (!this.targetId) return this.reply('请指定要踢的群员')
    if (!this.checkUserPower()) return this.noPerReply()
    if (!this.checkBotPower()) return this.noPowReply()
    if (this.Cfg.isAutoBlack) {
      Admin.groupPermission('BlackQQ', this.targetId, this.groupId)
    }
    const status = await this.e.group.kickMember(this.targetId)
    if (status) return this.reply(this.Cfg.kickReply)
    return this.errorReply()
  }

  async kickBlack() {
    let GroupsArr
    const isGlobal = /全局/.test(this.msg)
    const GroupsInfo = Object.fromEntries(this.e.bot?.gl ?? Bot.gl)
    if (!isGlobal) {
      const groupId = this.GM ? (this.numMatch?.[0] || this.groupId) : this.groupId
      GroupsArr = [groupId]
    } else {
      if (!this.verifyLevel(4)) return
      GroupsArr = _.sortBy(Object.keys(GroupsInfo))
    }
    const groupToKick = []
    const noPow = []
    for (const groupId of GroupsArr) {
      const memberObj = await common.getMemberObj(groupId)
      if (!common.isAdminOrOwner(memberObj[this.e.self_id])) {
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
          const name = info?.card || info?.nickname || memId
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
    this.e.groupToKick = groupToKick
    this.setUCcontext()
    this.reply('待清理人员信息如下，是否确认操作？[取消|确认]')
    await common.sleep(1)
    const title = '待清理人员信息'
    const waitToClearMsg = await common.makeForwardMsg(this.e, [noPowerMsg, title, ...waitToClearMsgArr], title)
    return this.reply(waitToClearMsg, false)
  }

  _makeSure() {
    if (this.isCancel()) return
    if (this.isSure()) {
      this.finishReply('确认操作，开始执行清理任务，每0.5s清理一次')
      const { groupToKick } = this.getUCcontext()
      this.kickBlackMem(groupToKick)
    }
  }

  /** 清理黑名单群员 */
  async kickBlackMem(groupToKick) {
    log.purple('开始清理黑名单群员')
    const worng = []
    const success = []
    for (const groupInfo of groupToKick) {
      const groupClient = common.pickGroup(groupInfo.groupId)
      for (const { memId, name } of groupInfo.memToKick) {
        await common.sleep(0.5)
        const info = `${memId}（${name}）`
        const status = await groupClient.kickMember(memId)
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
      replyMsgArr.push(...Data.makeArrStr(success, { chunkSize: 100, length: 3000 }))
    }
    if (worng.length !== 0) {
      replyMsgArr.push('以下黑名单群员清理失败，可能是权限不足')
      replyMsgArr.push(...Data.makeArrStr(worng, { chunkSize: 100, length: 3000 }))
    }
    const title = '清理黑名单执行结果'
    const replyMsg = await common.makeForwardMsg(this.e, [title, ...replyMsgArr], title)
    return this.reply(replyMsg)
  }

}

UCPr.EventInit(UCKick)