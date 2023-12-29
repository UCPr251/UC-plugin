import { Path, Data, file, common, UCPr } from '../components/index.js'
import { update } from '../../other/update.js'
import { UCPlugin } from '../model/index.js'
import _ from 'lodash'

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
          reg: /^#?UC(强制)?更新.+/i,
          fnc: 'updatePlugin'
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
        this.reply('UC-plugin更新成功，重启生效\n可使用#UC重启以前台重启云崽')
        Data.execSync('pnpm i --filter=UC-plugin', Path.UC)
      }
    }
    return true
  }

  async updatePlugin(e) {
    if (!this.GM) return false
    const plugin = this.msg.match(/更新(.*)/)[1].trim()
    const alias = file.YAMLreader(Path.get('resdata', 'pluginsAlias.yaml'))
    let name = plugin
    for (const info of alias) {
      if (new RegExp(info.reg, 'i').test(plugin)) {
        name = info.name
        break
      }
    }
    const Update_Plugin = new update()
    Update_Plugin.e = e
    Update_Plugin.reply = this.reply
    if (Update_Plugin.getPlugin(name)) {
      await Update_Plugin.runUpdate(name)
      if (Update_Plugin.isUp) {
        await common.sleep(2.51)
        return this.reply('更新成功，重启生效\n可使用#UC重启 前台重启机器人')
      }
    } else if (name === '') {
      await Update_Plugin.runUpdate(name)
      if (Update_Plugin.isUp) {
        await common.sleep(2.51)
        return this.reply('云崽更新成功，重启生效\n可使用#UC重启 前台重启机器人')
      }
    } else {
      return e.reply(`不匹配的插件名称：${name}`)
    }
  }

  async updateAll(e) {
    if (!this.GM) return false
    const Update_All = new update()
    Update_All.e = e
    Update_All.reply = this.reply
    const oriDependencies = UCPr.package.dependencies
    Update_All.UCupdateAll = async function () {
      const dirs = file.readdirSync(Path.plugins, { removes: ['chatgpt-plugin', 'ji-plugin', 'xiuxian@2.0.0', 'xiuxian-home-plugin', 'xiuxian-association-plugin'] })
      await this.runUpdate()
      for (let plu of dirs) {
        plu = this.getPlugin(plu)
        if (plu === false) continue
        await common.sleep(2.51)
        await this.runUpdate(plu)
      }
    }
    await Update_All.UCupdateAll()
    await common.sleep(1)
    const command = this.msg.replace(/UC/i, '')
    if (Update_All.isUp) {
      const nowDependencies = UCPr.package.dependencies
      if (!_.isEqual(oriDependencies, nowDependencies)) {
        Data.refresh()
        Data.execSync('pnpm i --filter=UC-plugin', Path.UC)
      }
      await common.sleep(2.51)
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