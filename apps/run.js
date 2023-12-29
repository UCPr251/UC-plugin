import { Data, Path } from '../components/index.js'
import { UCPlugin } from '../model/index.js'

export default class UCRun extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-run',
      dsc: 'UC一键卸载',
      rule: [
        {
          reg: /^#?UC运行.+/i,
          fnc: 'cmd'
        },
        {
          reg: /^#?UC(一键)?(卸载|跑路|run)/i,
          fnc: 'run'
        },
        {
          reg: /^#?卸载UC(插件)?/i,
          fnc: 'run'
        }
      ]
    })
    this.setFnc = '_makeSure'
  }

  async cmd(e) {
    if (!this.GM) return false
    e.command = this.msg.replace(/#?UC运行/i, '').trim()
    this.setContext(this.setFnc)
    return this.reply(`将在云崽根目录运行指令：\n${e.command}\n是否确认？`)
  }

  _makeSure() {
    this.isSure(() => {
      const { command } = this.getContext()._makeSure
      const stdout = Data.execSync(command, Path._path)
      this.finishReply(`运行结果：\n${stdout}`)
    })
  }

  async run(e) {
    if (!this.GM) return false
    await Data.run(true)
    return e.reply('UC-plugin已卸载，无需重启')
  }

}