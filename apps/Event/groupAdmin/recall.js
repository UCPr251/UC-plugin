import { common, UCPr } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'
import _ from 'lodash'

class UCRecall extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-recall',
      dsc: 'UC群管·撤回、清屏',
      Cfg: 'GAconfig.recall',
      rule: [
        {
          reg: /^#(UC)?清屏\s*\d*$/i,
          fnc: 'clear'
        },
        {
          reg: /^#(UC)?撤回\s*\d*$/i,
          fnc: 'recall'
        }
      ]
    })
  }

  async clear(e) {
    if (!this.defaultVerify()) return
    const clearNum = Math.min(this.msg.match(/\d+/)?.[0] ?? this.Cfg.defaultClear, this.Cfg.CLEAR_MAX)
    const start = Date.now()
    this.reply(`开始执行清屏任务，待清理：${clearNum}`, false, { recallMsg: 60 })
    const msgHistoryArr = await common.getChatHistoryArr(e.group, e.seq - 1, clearNum)
    if (_.isEmpty(msgHistoryArr)) return this.errorReply()
    const count = await common.recallMsgArr(e.group, msgHistoryArr.reverse())
    return this.reply(`成功清屏${count}条群消息\n耗时${((Date.now() - start) / 1000).toFixed(1)}秒`)
  }

  async recall(e) {
    if (!this.defaultVerify()) return
    if (!(this.at || e.atme) && !e.source) return this.reply('请艾特或引用需要撤回消息的群员')
    const userId = this.at || (e.atme ? e.self_id : e.source.user_id)
    if (!this.checkUserPower(userId)) return this.noPerReply()
    if (!this.checkBotPower(userId)) return this.noPowReply()
    const seq = e.source?.seq || e.seq
    const numMatch = this.msg.match(/\d+/)
    if (e.source && !numMatch) {
      const msg = (await common.getChatHistoryArr(e.group, seq, 1)).pop()
      if (!msg) return this.reply('消息不存在')
      return e.group.recallMsg(msg.message_id)
    }
    const recallNum = Math.min(numMatch?.[0] ?? 1, this.Cfg.RECALL_MAX)
    const start = Date.now()
    await this.reply(`开始执行任务：撤回指定人群消息\n待清理：${recallNum}`, false, { recallMsg: 60 })
    const msgHistoryArr = await common.getPersonalChatHistoryArr(e.group, userId, seq, recallNum)
    if (_.isEmpty(msgHistoryArr)) return this.errorReply()
    const count = await common.recallMsgArr(e.group, msgHistoryArr)
    const memName = this.getMemName(userId)
    return this.reply(`成功撤回<${memName}>（${userId}）${count}条群消息\n耗时${((Date.now() - start) / 1000).toFixed(1)}秒`)
  }

}

UCPr.EventInit(UCRecall)