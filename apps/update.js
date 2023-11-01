/* eslint-disable new-cap */
import { Path, Data, UCPr, Check } from '../components/index.js'
import { update } from '../../other/update.js'
import plugin from '../../../lib/plugins/plugin.js'

export class UCUpdate extends plugin {
  constructor() {
    super({
      name: 'UC-update',
      dsc: '更新UC-plugin',
      event: 'message',
      priority: UCPr.priority,
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
    if (!Check.permission(e.sender.user_id, 2)) return false
    let Update_Plugin = new update()
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
    if (!Check.permission(e.sender.user_id, 2)) return false
    if (/强制/.test(e.msg)) {
      Data.execSync('git reset --hard', Path.UC_plugin_decrypt)
    }
    const output = Data.refresh()
    return e.reply('刷新成功，当前授权项：\n' + Data.empty(Data.makeArrStr(output)))
  }
}