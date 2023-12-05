import { Path, Data } from '../components/index.js'
import { update } from '../../other/update.js'
import { UCPlugin } from '../model/index.js'

export default class UCUpdate extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-update',
      dsc: '更新UC-plugin',
      rule: [
        {
          reg: /^#?UC(强制)?更新$/i,
          fnc: 'update'
        },
        {
          reg: /^#?(UC)?(强制)?(更新|刷新)授权$/i,
          fnc: 'refresh'
        }
      ]
    })
  }

  async update(e) {
    if (!this.GM) return false
    const Update_Plugin = new update()
    Update_Plugin.e = e
    Update_Plugin.reply = this.reply
    if (Update_Plugin.getPlugin(Path.Plugin_Name)) {
      if (/强制/.test(e.msg)) {
        Data.execSync('git reset --hard', Path.UC)
      }
      await Update_Plugin.runUpdate(Path.Plugin_Name)
      Data.refresh()
      if (Update_Plugin.isUp) {
        this.reply('UC-plugin更新成功，重启生效')
      }
    }
    return true
  }

  async refresh(e) {
    if (!this.GM) return false
    if (/强制/.test(e.msg)) {
      Data.execSync('git reset --hard', Path.UC_plugin_decrypt)
    }
    const output = Data.refresh()
    return e.reply('刷新成功，当前授权项：\n' + Data.empty(Data.makeArrStr(output)))
  }
}