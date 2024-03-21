import { Path, Data, UCPr, Check, file, common } from '../components/index.js'
import { UCPlugin } from '../models/index.js'

const Plugin_Name = 'loveMys-plugin'
const loveMys = Path.get('plugins', Plugin_Name)
const apiyaml = Path.join(loveMys, 'config', 'api.yaml')

/** 该功能不再深入维护 */

export default class UCLoveMys extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-loveMys',
      dsc: '安装loveMys等',
      rule: [
        {
          reg: /^#?UC安装loveMys$/i,
          fnc: 'installLoveMys'
        },
        {
          reg: /^#?UC注入loveMys(api|tk)(.*)/i,
          fnc: 'insertApiToken'
        },
        {
          reg: /^#?UCloveMys查询$/i,
          fnc: 'queryToken'
        }
      ]
    })
    if (Check.folder(loveMys)) {
      this.redisData = '[UC]loveMys'
      this.task = {
        name: 'UC-loveMys',
        fnc: this.refresh.bind(this),
        cron: '0 0 0 * * ?'
      }
    }
  }

  _verify() {
    if (!Check.folder(loveMys)) {
      this.reply('请先安装loveMys插件，指令：#UC安装过码')
      return false
    }
    if (!Check.file(apiyaml)) {
      this.reply('请先重启Bot再使用本功能')
      return false
    }
    return true
  }

  async installLoveMys() {
    if (!this.verifyLevel(4)) return
    if (Check.folder(loveMys)) return this.reply('你已安装该插件，无需再次安装')
    Data.execSync('git clone https://gitee.com/bbaban/loveMys.git loveMys-plugin', Path.plugins)
    return this.reply('安装成功，重启后生效')
  }

  async insertApiToken() {
    if (!this.verifyLevel(4)) return
    if (!this._verify()) return
    const yamlData = file.YAMLreader(apiyaml)
    const isApi = /api/i.test(this.msg)
    const str = this.msg.match(/注入loveMys(?:api|tk)(.*)/i)[1].trim()
    if (!str) return this.reply(`请一同填写${isApi ? 'Api' : 'Token'}后重试`)
    if (isApi) {
      yamlData.api = str
    } else {
      yamlData.token = str
      if (!yamlData.api) {
        yamlData.api = 'https://api.loquat.eu.org/validate/get'
      }
    }
    file.YAMLsaver(apiyaml, yamlData)
    this.reply(`注入${isApi ? 'Api' : 'Token'}成功`)
    const { api, token } = file.YAMLreader(apiyaml)
    const times = await remainingTimes(api, token)
    if (!Number(times)) return this.reply(`无效api或tk：${str}\n剩余次数${times}\n请检查注入的api或者tk是否有误`)
    Data.redisSet(this.redisData, times)
    return this.reply('剩余次数：' + times)
  }

  async queryToken() {
    if (!this.verifyLevel(4)) return
    if (!this._verify()) return
    const { api, token } = file.YAMLreader(apiyaml)
    if (!token) return this.reply('请先注入token，#UC注入loveMystk加你的token')
    if (!api) return this.reply('请先注入api，#UC注入loveMysapi加你的api')
    const yes_times = await Data.redisGet(this.redisData, 0) || 0
    const now_times = await remainingTimes(api, token)
    let todayUsed = yes_times - now_times
    if (todayUsed < 0) {
      todayUsed = 0
      Data.redisSet(this.redisData, now_times)
    }
    return this.reply(`剩余次数：${now_times}次\n今日已用${todayUsed}次`)
  }

  async refresh() {
    const { api, token } = file.YAMLreader(apiyaml)
    if (!api || !token) return false
    const now_times = await remainingTimes(api, token)
    if (UCPr.loveMysNotice && now_times <= UCPr.loveMysNotice) {
      common.sendMsgTo(UCPr.GlobalMaster[0], `主淫，过码次数只剩下${now_times}次了哦~`)
    }
    await Data.redisSet(this.redisData, now_times)
  }

}

async function remainingTimes(api, token) {
  return (await fetch(`${api}?token=${token}`).then(res => res.json())).times
}