import { Path, Check, Data, UCDate, common, log, UCPr } from '../components/index.js'
import { UCPlugin } from '../models/index.js'

export default class UCRestart extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-restart',
      dsc: '重启机器人，不转后台运行',
      rule: [
        {
          reg: /^#?UC重启$/i,
          fnc: 'restart'
        }
      ]
    })
    this.redisData = '[UC]restart'
  }

  async init() {
    const data = await Data.redisGet(this.redisData)
    if (data) {
      if (UCPr.qsignRestart.isAutoOpen) {
        const output = await Data.checkPort(UCPr.qsignRestart.port, UCPr.qsignRestart.host)
        if (output) {
          const path = UCPr.qsignRestart.qsign || Path.qsign
          Data.exec(`start ${UCPr.qsignRestart.qsingRunner}`, path)
        }
      }
      const { start, type, loc, isPM2 } = data
      if (isPM2) {
        Data.exec(`${this.checkPnpm()} stop`, Path._path, true)
      }
      const time = UCDate.diff(Date.now() - start).toStr()
      await common.sleep(3)
      common.sendMsgTo(loc, `[UC]前台重启成功，耗时${time}`, type)
      redis.del(this.redisData)
    }
  }

  async restart() {
    if (!this.GM) return false
    if (process.platform !== 'win32') return this.reply('此功能只能在Windows系统中使用')
    if (!Check.file(Path.get('UC', 'restart.bat'))) {
      return this.reply('[UC]restart.bat文件丢失，无法重启')
    }
    if (!Check.file(Path.get('_path', 'app.js'))) {
      return this.reply('[UC]云崽根目录app.js文件丢失，无法重启')
    }
    let isPM2 = false
    if (process.argv[1].includes('pm2') || process.env.app_type == 'pm2') {
      isPM2 = true
      const warnInfo = '当前云崽正在后台运行，重启后将尝试关闭云崽pm2进程，请关注控制台'
      log.warn(warnInfo)
      await this.reply(warnInfo, true)
    } else {
      await this.reply('开始进行前台重启，请关注控制台')
    }
    const start = Date.now()
    const data = {
      start,
      type: this.groupId ? 'Group' : 'Private',
      loc: this.groupId ?? this.userId,
      isPM2
    }
    if (UCPr.qsignRestart.windowsHide) {
      Data.killPort(UCPr.qsignRestart.port)
    }
    await Data.redisSet(this.redisData, data, 251)
    const delayTime = 4
    Data.exec(`start restart.bat ${delayTime}`, Path.UC)
    setTimeout(() => process.exit(+UCPr.isTrss), delayTime * 500)
  }

  checkPnpm() {
    const result = Data.execSync('pnpm -v')
    if (result) return 'pnpm'
    return 'npm'
  }

}