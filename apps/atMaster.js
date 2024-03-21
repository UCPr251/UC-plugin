import { Path, UCPr } from '../components/index.js'
import { UCPlugin, MsgManager } from '../models/index.js'

const folderPath = Path.get('data', 'atMaster')

const defaultMsg = [{ type: 'text', text: '艾特主人有何贵干呐？' }]

export default class UCAtMaster extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-atMaster',
      dsc: '艾特主人回复',
      event: 'message',
      Cfg: 'config.atMaster',
      rule: [
        {
          fnc: 'atMaster',
          event: 'message.group',
          log: false
        },
        {
          reg: /^#?(UC)?(新增|添加|增加|删除|查看)艾特主人回复$/i,
          fnc: 'manageAtMaster'
        }
      ]
    })
  }

  async atMaster() {
    if (!this.Cfg.isOpen || !this.at) return false
    if (this.userId === this.qq || this.userId === UCPr.GlobalMaster[0]) return false
    if (!this.atRet.some(qq => this.isM(qq))) return false
    if (!this.verifyPermission(this.Cfg.use, { isReply: false })) return false
    this.reply(new MsgManager(folderPath, this, this.dsc, this.name).makeMessage(undefined, defaultMsg), false, { at: this.Cfg.isAt })
    return false
  }

  async manageAtMaster() {
    if (!this.verifyLevel(3)) return
    const manager = new MsgManager(folderPath, this, this.dsc, this.name)
    if (/新增|添加|增加/.test(this.msg)) {
      return manager.add()
    }
    if (this.msg.includes('查看')) {
      return manager.view(defaultMsg)
    }
    return manager.del()
  }

}