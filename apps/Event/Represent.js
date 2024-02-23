import { Check, common, UCPr } from '../../components/index.js'
import { UCEvent } from '../../models/index.js'
import _ from 'lodash'

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
    if (!this.M) return false
    if (e.detail_type === 'guild') return false
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
    await common.sleep(0.2)
    delete e.uid
    e.user_id = user_id
    e.from_id = user_id
    e.isMaster = Check.str(UCPr.defaultCfg.masterQQ, user_id)
    e.sender = {
      card,
      nickname,
      user_id
    }
    const message = _.filter(e.message.map(v => {
      if (v.type !== 'text') return v
      return {
        type: 'text',
        text: v.text.replace(/#?(UC)?代/i, '').replace(user_id, '').trim()
      }
    }), (v) => v.type !== 'at' || v.qq !== user_id)
    e.at = _.findLast(message, { type: 'at' })?.qq
    e.message = message
    const msg = this.msg.match(/代(.+)/)[1].replace(user_id, '').trim()
    e.msg = msg
    e.raw_message = msg
    e.original_msg = msg
    return await this.BotPluginsDeal(e)
  }
}

UCPr.EventInit(UCRepresent)