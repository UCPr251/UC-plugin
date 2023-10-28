import { Path, Check, Data, log, UCPr, UCDate, common } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import { exec } from 'child_process'
import net from 'net'

/** 定时器变量，勿动 */
let intervalId

// 以下配置按自身情况修改
/** 监听host */
const host = '127.0.0.1'
/** 监听port */
const port = 801
/** qsign路径 */
const qsignPath = Path.resolve(Path._path, '..', 'unidbg-fetch-qsign')
/** qsign启动器名称 */
const qsingRunner = '一键startAPI.bat'

async function checkPort(host, port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => {
        resolve(true)
      })
    })
    server.listen(port, host)
  })
}

async function check() {
  const output = await checkPort(host, port)
  if (output) {
    log.red('检测到签名已关闭，尝试再启动签名')
    exec(`start ${qsingRunner}`, { cwd: qsignPath })
    const time = UCDate.NowTime
    await common.sleep(3)
    return await common.sendMsgTo(UCPr.Master[0], time + '\n自动重启签名成功', 'Private')
  } else {
    log.whiteblod('签名正常运行ing')
  }
}

export class UCQsignRestart extends plugin {
  constructor() {
    super({
      name: 'UC-qsignRestart',
      dsc: '监听qsign端口自动重启',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?UC(开启|关闭)签名自动重启$/i,
          fnc: 'restart'
        }
      ]
    })
    this.setFnc = 'verify'
  }

  async restart(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    const isOpen = /开启/.test(e.msg)
    if (isOpen) {
      if (intervalId) {
        return e.reply('当前已经开启签名自动重启')
      }
      this.setContext('verify')
      return e.reply(`请确认签名配置：\n监听host：${host}\n监听port：${port}\n签名路径：${qsignPath}\n签名启动器名称：${qsingRunner}\n\n请确保以上配置和你本地配置一致，否则本功能无法发挥作用，如有不一致，请于UC-plugin/apps/qsignRestart.js中修改后重启\n\n确认开启？[确认|取消]`)
    } else {
      if (!intervalId) {
        return e.reply('当前未启动签名自动重启')
      }
      clearInterval(intervalId)
      return e.reply('已关闭签名自动重启，将不再自动重启签名')
    }
  }

  async verify() {
    if (Data.isCancel.call(this)) return false
    if (/确认/.test(this.e.msg)) {
      intervalId = setInterval(check, 60000)
      Data.finish.call(this, '已开启签名自动重启，每一分钟检测一次签名状态，请确保端口、路径等配置正确，并留意一分钟后控制台是否出现报错')
    }
  }
}
