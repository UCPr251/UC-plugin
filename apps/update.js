import { Path, Data, file, common, UCPr, Check } from '../components/index.js'
import { update } from '../../other/update.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

const notice = '成功，重启生效' + (process.platform === 'win32' ? '\n可使用#UC重启 前台重启机器人' : '')

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
          reg: /^#?UC(强制)?更新资源$/i,
          fnc: 'updateUnNecRes'
        },
        {
          reg: /^#?UC(强制)?更新(?!资源).+/i,
          fnc: 'updatePlugin'
        },
        {
          reg: /^#?UC全部(强制)?更新$/i,
          fnc: 'updateAll'
        },
        {
          reg: /^#?UC(更新|刷新)授权$/i,
          fnc: 'refresh'
        },
        {
          reg: /^#?UC切换分支(dev|master)$/i,
          fnc: 'switchBranch'
        }
      ]
    })
  }

  async update(e) {
    if (!this.GM) return false
    let updated = false
    if (UCPr.branch === 'master') {
      const Update_Plugin = new update()
      Update_Plugin.e = e
      Update_Plugin.reply = this.reply
      if (Update_Plugin.getPlugin(UCPr.Plugin_Name)) {
        await Update_Plugin.runUpdate(UCPr.Plugin_Name)
        Data.refresh()
        updated = Update_Plugin.isUp
      }
    } else {
      const result = Data.execSync('git pull origin dev', Path.UC)
      if (!result) return this.reply('更新UC插件dev分支失败，请查看控制台报错信息手动处理')
      if (/Already/i.test(result)) {
        return this.reply('当前UC插件dev分支已是最新')
      }
      updated = true
    }
    if (updated) {
      this.reply(`UC-plugin更新${notice}`)
      Data.exec(`pnpm i --filter=${UCPr.Plugin_Name}`, Path.UC)
    }
  }

  async updateUnNecRes() {
    if (!this.GM) return false
    if (!Check.folder(Path.unNecRes)) {
      this.reply('开始拉取UC资源')
      return Data.updateRes(true, (err) => {
        if (err) {
          const errInfo = log.error('拉取UC资源失败', err)
          return this.reply(errInfo)
        }
        return this.reply('拉取UC资源成功')
      })
    }
    if (/强制/.test(this.msg)) {
      if (!Data.execSync('git reset --hard', Path.unNecRes)) {
        return this.reply('强制更新UC资源失败，请查看控制台手动处理冲突')
      }
    }
    return Data.updateRes(false, (err, stdout) => {
      if (err) {
        const errInfo = log.error(this.msg + '失败', err)
        return this.reply(errInfo)
      }
      if (/Already/.test(stdout)) {
        return this.reply('UC资源已是最新')
      }
      return this.reply(this.msg + '成功')
    })
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
        return this.reply(`更新${notice}`)
      }
    } else if (name === '') {
      await Update_Plugin.runUpdate(name)
      if (Update_Plugin.isUp) {
        await common.sleep(2.51)
        return this.reply(`云崽更新${notice}`)
      }
    } else {
      return this.reply(`不匹配的插件名称：${name}`)
    }
  }

  async updateAll(e) {
    if (!this.GM) return false
    const Update_All = new update()
    Update_All.e = e
    Update_All.reply = this.reply
    const symbol = Symbol('[UC]updateAll')
    Update_All[symbol] = async function () {
      await this.runUpdate()
      const dirs = file.readdirSync(Path.plugins, { removes: ['chatgpt-plugin', 'ji-plugin', 'xiuxian@2.0.0', 'qianyu-plugin', 'xiuxian-home-plugin', 'xiuxian-association-plugin'] })
      for (let plu of dirs) {
        plu = this.getPlugin(plu)
        if (plu === false) continue
        await common.sleep(1)
        await this.runUpdate(plu)
      }
    }
    await Update_All[symbol]()
    await common.sleep(1)
    const command = this.msg.replace(/UC/i, '')
    if (Update_All.isUp) {
      const nowDependencies = file.JSONreader(Path.packagejson).dependencies
      if (!_.isEqual(UCPr.package.dependencies, nowDependencies)) {
        Data.refresh()
        Data.exec(`pnpm i --filter=${UCPr.Plugin_Name}`, Path.UC)
      }
      await common.sleep(2.51)
      return this.reply(`${command}执行${notice}`)
    } else {
      return this.reply(`本次${command} 没有插件更新，无需重启`)
    }
  }

  async refresh() {
    if (!this.GM) return false
    const output = await Data.refresh()
    UCPr.getConfig(5)
    UCPr.getConfig(6)
    return this.reply('刷新成功，当前授权项：\n' + Data.empty(Data.makeArrStr(output)))
  }

  async switchBranch() {
    if (!this.GM) return
    let result, branch = 'master'
    if (/dev/i.test(this.msg)) {
      if (UCPr.branch === 'dev') {
        return this.reply('当前UC插件已处于dev分支，无需切换')
      }
      branch = 'dev'
      result = Data.execSync('git pull && git checkout origin/dev', Path.UC)
    } else {
      if (UCPr.branch === 'master') {
        return this.reply('当前UC插件已处于master分支，无需切换')
      }
      result = Data.execSync('git checkout master', Path.UC)
    }
    if (result) {
      return this.reply(`成功切换分支至${branch}，重启生效`)
    }
    return this.reply('切换分支失败，请查看控制台报错信息手动处理')
  }

}

Data.loadTask({
  // 每3天检查更新一次UC资源
  cron: '0 0 4 */3 * ?',
  name: 'UC-updateUnNecRes',
  fnc: Data.updateRes.bind(Data, false, (err) => err && log.error('UC自动更新资源失败', err))
})