import { Path, Data, file, common, UCPr } from '../components/index.js'
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
          reg: /^#?UC全部(强制)?更新$/i,
          fnc: 'updateAll'
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
      await Update_Plugin.runUpdate(Path.Plugin_Name)
      Data.refresh()
      if (Update_Plugin.isUp) {
        this.reply('UC-plugin更新成功，重启生效')
        Data.execSync('pnpm i --filter=uc-plugin', Path.UC)
      }
    }
    return true
  }

  async updateAll(e) {
    if (!this.GM) return false
    const Update_All = new update()
    Update_All.e = e
    Update_All.reply = this.reply
    const oriVersion = UCPr.version
    Update_All.UCupdateAll = async function () {
      const dirs = file.readdirSync(Path.plugins, { removes: ['chatgpt-plugin', 'ji-plugin'] })
      await this.runUpdate()
      for (let plu of dirs) {
        plu = this.getPlugin(plu)
        if (plu === false) continue
        await common.sleep(2)
        await this.runUpdate(plu)
      }
    }
    await Update_All.UCupdateAll()
    await common.sleep(1)
    const command = this.msg.replace(/UC/i, '')
    if (Update_All.isUp) {
      const nowVersion = UCPr.version
      if (oriVersion !== nowVersion) {
        Data.refresh()
        Data.execSync('pnpm i --filter=uc-plugin', Path.UC)
      }
      return e.reply(`${command}执行成功，重启生效\n可使用#UC重启 前台重启机器人`)
    } else {
      return e.reply(`本次${command}未更新插件，无需重启`)
    }
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