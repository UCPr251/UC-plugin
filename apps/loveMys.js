/* eslint-disable new-cap */
import { Path, Data, UCPr, Check, file, common } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import { update } from '../../other/update.js'
import path from 'path'

const Plugin_Name = 'loveMys-plugin'
const loveMys = path.join(Path.plugins, Plugin_Name)
const apiyaml = path.join(loveMys, 'config', 'api.yaml')

export class UCLoveMys extends plugin {
  constructor() {
    super({
      name: 'UC-loveMys',
      dsc: '安装loveMys等',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?UC(过码|验证码?|yzm)帮助$/i,
          fnc: 'loveMysHelp'
        },
        {
          reg: /^#?UC安装(过码|loveMys)$/i,
          fnc: 'installLoveMys'
        },
        {
          reg: /^#?UC注入过码(api|tk)(.*)/i,
          fnc: 'insertApiToken'
        },
        {
          reg: /^#?UC(过码|验证码?|yzm)查询$/i,
          fnc: 'queryToken'
        },
        {
          reg: /^#?UC更新(过码|验证码?|yzm)$/i,
          fnc: 'gitpull'
        }
      ]
    })
    if (Check.floder(loveMys)) {
      this.task = {
        name: '刷新loveMys验证码统计',
        fnc: this.refresh.bind(this),
        cron: '0 0 0 * * ?'
      }
      this.redisData = '[UC]loveMysTokenQuery'
    }
  }

  verify() {
    if (!Check.permission(this.e.sender.user_id, 2)) return false
    if (!Check.floder(loveMys)) {
      this.reply('请先安装loveMys插件，指令：#UC安装过码')
      return false
    }
    if (!Check.file(apiyaml)) {
      this.reply('请先重启Bot再使用本功能')
      return false
    }
    return true
  }

  async loveMysHelp(e) {
    const hlepMsg = 'UC-plugin过码管理\n安装过码：#UC安装过码\n注入token：#UC注入过码tk你的tk\n查询剩余次数：#UC验证码查询\n更新过码插件：#UC更新过码'
    return e.reply(hlepMsg)
  }

  async installLoveMys(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    if (Check.floder(loveMys)) return e.reply('你已安装该插件，无需再次安装')
    Data.execute(Path.plugins, 'git clone https://gitee.com/bbaban/loveMys.git loveMys-plugin/')
    return e.reply('安装成功，重启后生效')
  }

  async insertApiToken(e) {
    if (!this.verify()) return false
    const yamlData = file.YAMLreader(apiyaml)
    const isApi = /api/i.test(e.msg)
    const str = e.msg.match(/注入过码(?:api|tk)(.*)/)[1].trim()
    if (!str) return e.reply(`请一同填写${isApi ? 'Api' : 'Token'}后重试`)
    if (isApi) {
      yamlData.api = str
    } else {
      yamlData.token = str
      if (!yamlData.api) {
        yamlData.api = 'https://api.loquat.eu.org/validate/get'
      }
    }
    file.YAMLsaver(apiyaml, yamlData)
    e.reply(`注入${isApi ? 'Api' : 'Token'}成功`)
    const { api, token } = file.YAMLreader(apiyaml)
    const times = await remainingTimes(api, token)
    if (!Number(times)) return e.reply(`无效api或tk：${str}\n剩余次数${times}\n请检查注入的api或者tk是否有误`)
    Data.redisSet(this.redisData, times)
    return e.reply('剩余次数：' + times)
  }

  async queryToken(e) {
    if (!this.verify()) return false
    const { api, token } = file.YAMLreader(apiyaml)
    if (!token) return e.reply('请先注入token，#UC注入过码tk加你的token')
    if (!api) return e.reply('请先注入api，#UC注入过码api加你的api')
    const yes_times = Number(await Data.redisGet(this.redisData)) || 0
    const now_times = await remainingTimes(api, token)
    let todayUsed = yes_times - now_times
    if (todayUsed < 0) {
      todayUsed = 0
      Data.redisSet(this.redisData, now_times)
    }
    return await e.reply(`剩余次数：${now_times}次\n今日已用${todayUsed}次`)
  }

  async gitpull(e) {
    if (!this.verify()) return false
    let Update_Plugin = new update()
    Update_Plugin.e = e
    Update_Plugin.reply = e.reply
    if (Update_Plugin.getPlugin(Plugin_Name)) {
      if (/强制/.test(e.msg)) {
        Data.execute(loveMys, 'git reset --hard')
      }
      await Update_Plugin.runUpdate(Plugin_Name)
      if (Update_Plugin.isUp) {
        this.reply('更新过码插件成功，重启生效')
      }
    }
    return true
  }

  async refresh() {
    const { api, token } = file.YAMLreader(apiyaml)
    if (!api || !token) return false
    const now_times = await remainingTimes(api, token)
    if (UCPr.loveMysNotice && now_times <= UCPr.loveMysNotice) {
      common.sendMsgTo(UCPr.Master[0], `主淫，过码次数只剩下${now_times}次了哦~`)
    }
    await Data.redisSet(this.redisData, now_times)
  }

}

async function remainingTimes(api, token) {
  return (await fetch(`${api}?token=${token}`).then(res => res.json())).times
}