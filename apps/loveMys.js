import { Path, Data, UCPr, Check, file } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import path from 'path'

const loveMys = path.join(Path.plugins, 'loveMys-plugin')
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
          reg: /^#?UC安装(过码|loveMys)$/i,
          fnc: 'installLoveMys'
        },
        {
          reg: /^#?UC注入过码(api|tk)(.*)/i,
          fnc: 'insertApiToken'
        },
        {
          reg: /^#?UC(验证码?|yzm)查询$/i,
          fnc: 'queryToken'
        }
      ]
    })
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
    return e.reply(`注入${isApi ? 'Api' : 'Token'}成功`)
  }

  async queryToken(e) {
    if (!this.verify()) return false
    const { api, token } = file.YAMLreader(apiyaml)
    if (!token) return e.reply('请先注入token，#UC注入过码tk加你的token')
    if (!api) return e.reply('请先注入api，#UC注入过码api加你的api')
    return await e.reply(`剩余次数：${await times(api, token)}`)
  }

}

async function times(api, token) {
  return (await fetch(`${api}?token=${token}`).then(res => res.json())).times
}