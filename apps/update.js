/* eslint-disable new-cap */
import { Path, Data, UCPr } from '../components/index.js'
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
          fnc: 'update',
          permission: 'master'
        }
      ]
    })
  }

  async update() {
    let Update_Plugin = new update()
    Update_Plugin.e = this.e
    Update_Plugin.reply = this.reply
    if (Update_Plugin.getPlugin(Path.Plugin_Name)) {
      if (this.e.msg.includes('强制')) {
        Data.execute(Path.UC, 'git reset --hard')
      }
      await Update_Plugin.runUpdate(Path.Plugin_Name)
      if (Update_Plugin.isUp) {
        this.reply('更新成功，请手动重启')
      }
    }
    return true
  }
}