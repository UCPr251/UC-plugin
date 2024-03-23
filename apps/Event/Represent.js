import { Check, common, UCPr } from '../../components/index.js'
import { UCEvent } from '../../models/index.js'

class UCRepresent extends UCEvent {
  constructor(e) {
    super({
      e,
      name: 'UC-Represent',
      dsc: '代发言',
      event: 'message',
      rule: [
        {
          reg: /^#?(UC)?代.+/i,
          fnc: 'represent'
        }
      ]
    })
  }

  async represent(e) {
    if (!this.M || e.detail_type === 'guild') return false
    if (!this.GM && (Check.str(UCPr.botCfg.masterQQ, this.at) || this.isGM(this.at))) return this.reply('群主人不能代全局主人发言哦~')
    let user_id, card, nickname
    if (this.isGroup) {
      if (!this.at) return false
      user_id = this.at
      const memberInfo = this.getMemInfo(user_id)
      card = memberInfo?.card ?? user_id
      nickname = memberInfo?.nickname ?? user_id
      e.logText = `[${e.group_name}(${memberInfo?.card || memberInfo?.nickname || user_id})]`
    } else {
      user_id = this.msg.match(/\d{5,10}/)?.[0]
      if (!user_id) return false
      const friend = Bot.pickFriend(user_id, false)
      card = nickname = (friend?.nickname || user_id)
      e.logText = `[私聊][${nickname}(${user_id})]`
    }
    log.whiteblod(`[${this.userId}代${this.at}发言]`)
    await common.sleep(0.2)
    Reflect.deleteProperty(e, 'uid')
    e.user_id = user_id
    e.from_id = user_id
    e.isMaster = Check.str(UCPr.botCfg.masterQQ, user_id)
    e.sender = {
      card,
      nickname,
      user_id
    }
    const message = e.message.map(v => {
      if (v.type !== 'text' || !v.text?.includes('代')) return v
      return {
        type: 'text',
        text: v.text.replace(/^#?(UC)?代/i, '').replace(user_id, '').replace(/^\s*[＃井#]+\s*/, '#').replace(/^\s*[\\*※＊]+\s*/, '*').trim()
      }
    }).filter((v) => v.type !== 'at' || v.qq !== user_id)
    e.at = message.findLast(v => v.type === 'at')?.qq
    e.message = message
    const msg = this.msg.match(/代(.+)/)[1].replace(user_id, '').replace(/^\s*[＃井#]+\s*/, '#').replace(/^\s*[\\*※＊]+\s*/, '*').trim()
    e.msg = msg
    e.raw_message = msg
    e.original_msg = msg
    this.BotDealEvent(e)
  }
}

UCPr.EventInit(UCRepresent)