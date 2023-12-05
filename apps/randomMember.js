import { UCPr } from '../components/index.js'
import { UCPlugin } from '../model/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

export default class UCRandomMember extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-randomMember',
      dsc: '随机挑选一名幸运群友',
      event: 'message.group',
      Cfg: 'config.randomMember',
      rule: [
        {
          reg: new RegExp(`^#*${UCPr.randomMember?.keyWords?.trim() || '随机群友'}$`, 'i'),
          fnc: 'randomMember'
        }
      ]
    })
  }

  async randomMember(e) {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyPermission(this.Cfg.use)) return false
    const map = await e.group.getMemberMap()
    const mem = _.sample(Array.from(map.values()))
    const msg = [this.Cfg.reply.replace('info', `${mem.nickname}（${mem.user_id}）`), segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${mem.user_id}`)]
    if (this.Cfg.isAt) msg.unshift(segment.at(mem.user_id))
    return e.reply(msg)
  }
}