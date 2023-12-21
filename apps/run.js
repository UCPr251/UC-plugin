import { Data } from '../components/index.js'
import { UCPlugin } from '../model/index.js'

export default class UCRun extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-run',
      dsc: 'UC一键卸载',
      rule: [
        {
          reg: /^#?UC(一键)?(卸载|跑路)/i,
          fnc: 'run'
        },
        {
          reg: /^#?卸载UC(插件)?/i,
          fnc: 'run'
        }
      ]
    })
  }

  async run(e) {
    if (!this.GM) return false
    await Data.run()
    return e.reply('UC-plugin已卸载，无需重启')
  }

}