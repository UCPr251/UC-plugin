import { Data, Path } from '../components/index.js'
import { UCPlugin } from '../models/index.js'

export default class UCRun extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-run',
      dsc: '根目录执行指令等',
      rule: [
        {
          reg: /^#?UC(确认)?(运|执)行.+/i,
          fnc: 'cmd'
        },
        {
          reg: /^#UC(一键)?(卸载|跑路|run)$/i,
          fnc: 'run'
        },
        {
          reg: /^#卸载UC(插件)?$/i,
          fnc: 'run'
        }
      ]
    })
    this.setFnc = '_makeSure'
  }

  async cmd(e) {
    if (!this.GM) return false
    const command = this.msg.match(/行(.*)/)[1].trim()
    if (/确认/.test(this.msg)) {
      return this.runCommand(command)
    }
    e.command = command
    this.setUCcontext()
    return this.reply(`将在云崽根目录运行指令：\n${e.command}\n是否确认？`)
  }

  _makeSure() {
    if (this.isCancel()) return
    this.isSure(async () => {
      const { command } = this.getUCcontext()
      this.finishUCcontext()
      this.runCommand(command)
    })
  }

  runCommand(command) {
    command && Data.exec(command, Path._path, true, {}, (err, stdout) => {
      if (err) {
        const errorInfo = log.error(err)
        return this.reply(`${command}执行失败：\n${errorInfo}`)
      }
      return this.reply(`${command}执行成功：\n${stdout}`)
    })
  }

  async run() {
    if (!this.GM) return false
    await Data.run(true)
    return this.reply('UC-plugin已卸载，无需重启')
  }

}