import { Path, UCPr } from '../components/index.js'
import { UCPlugin, MsgManager } from '../models/index.js'
import _ from 'lodash'

const folderPath = Path.get('data', 'chuoMaster')

const defaultMsg = [{ type: 'text', text: '戳我主人干嘛呢？坏蛋！' }]

export default class UCChuoMaster extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-chuoMaster',
      dsc: '戳主人回复',
      event: 'notice.group.poke',
      Cfg: 'config.chuoMaster',
      rule: [
        {
          fnc: 'chuoMaster',
          log: false
        }
      ]
    })
  }

  async chuoMaster() {
    if (!this.Cfg.isOpen || this.B) return false
    if (this.userId === this.qq) return false
    if (this.userId === this.e.target_id) return false
    if (!this.isM(this.e.target_id)) return false
    log.whiteblod('戳主人回复生效')
    const random = Math.random()
    let ret = this.Cfg.text
    if (ret > random) {
      return this.reply(new MsgManager(folderPath, this, this.dsc, this.name).makeMessage(undefined, defaultMsg), false, { at: this.Cfg.isAt })
    }
    if ((ret += this.Cfg.img) > random) {
      return this.reply(segment.image(_.sample(UCPr.temp.apiList) + this.userId), true)
    }
    if ((ret += this.Cfg.poke) > random) {
      return this.group.pokeMember(this.userId)
    }
    if (this.UC.botIsPow_user && (ret += this.Cfg.mute) > random) {
      return this.group.muteMember(this.userId, this.Cfg.muteTime * 60)
    }
  }

}
