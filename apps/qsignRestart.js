import { Path, Check, Data, log, UCPr, UCDate, common, file } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

/** 全局变量 */
let isCheckMsg, ing
/** 异常次数计数 */
let errorTimes = 0

const redisData = '[UC]restartLog'

function startQsign() {
  const path = UCPr.qsignRestart.qsign || Path.qsign
  if (UCPr.qsignRestart.windowsHide) {
    Data.exec(UCPr.qsignRestart.qsingRunner, path)
  } else {
    Data.exec(`start ${UCPr.qsignRestart.qsingRunner}`, path)
  }
  log.red('执行签名启动完毕')
}

function killQsign() {
  Data.killPort(UCPr.qsignRestart.port)
}

async function addLog(msg = '') {
  const data = await Data.redisGet(redisData, []) || []
  data.push(UCDate.date_time[1] + msg)
  Data.redisSet(redisData, data, UCDate.EXsecondes)
}

const checkMsg = _.throttle(async function (msg) {
  if (ing || !isCheckMsg) return
  if (/签名api异常/i.test(msg)) {
    if (++errorTimes >= (UCPr.qsignRestart?.errorTimes ?? 3)) {
      ing = true
      log.red(`检测到签名异常${errorTimes}次，尝试重启签名`)
      errorTimes = 0
      try {
        killQsign()
        startQsign()
        addLog('签名异常')
      } catch (e) {
        log.error(e)
      }
      setTimeout(() => (ing = false), 60000)
    }
  }
}, 100, { trailing: false })

async function checkQsignPort() {
  if (ing) return
  const output = await Data.checkPort(UCPr.qsignRestart.port, UCPr.qsignRestart.host)
  if (output) {
    ing = true
    log.red('检测到签名已关闭，尝试启动签名')
    try {
      startQsign()
      addLog('签名关闭')
    } catch (e) {
      log.error(e)
    }
    setTimeout(() => (ing = false), 60000)
  } else {
    log.white('签名运行ing')
  }
}

function clearQsignLog() {
  const files = file.readdirSync(UCPr.qsignRestart.qsign || Path.qsign, { type: ['.log', '.mdmp'] })
  if (files.length) {
    const deleted = file.unlinkSync(UCPr.qsignRestart.qsign || Path.qsign, ...files)
    log.yellow(`成功清理${deleted.length}个日志文件`)
    return deleted.length
  }
}

export default class UCQsignRestart extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-qsignRestart',
      dsc: '监听qsign端口和消息回复报错自动重启签名',
      rule: [
        {
          reg: /^#?(UC)?(开启|关闭)签名自动重启$/i,
          fnc: 'autoRestart'
        },
        {
          reg: /^#?(UC)?签名重启(日志|记录)$/i,
          fnc: 'restartLog'
        },
        {
          reg: /^#(UC)?重启签名$/i,
          fnc: 'restart'
        },
        {
          reg: /^#?(UC)?签名测试$/i,
          fnc: 'test'
        },
        {
          reg: /^#?(UC)?(清理|删除)签名日志$/i,
          fnc: 'clear'
        }
      ]
    })
    this.setFnc = '_makeSure'
    this.Cfg = UCPr.qsignRestart
  }

  init() {
    if (process.platform !== 'win32') return
    if (this.Cfg.isAutoOpen) {
      if (Check.file(Path.join(this.Cfg.qsign || Path.qsign, this.Cfg.qsingRunner))) {
        if (this.Cfg.switch1) UCPr.intervalId = setInterval(checkQsignPort, this.Cfg.sleep * 1000)
        if (this.Cfg.switch2) {
          this.proxyLogError()
          isCheckMsg = true
        }
      }
    }
    if (this.Cfg.isAutoClearLog) {
      Data.loadTask({
        cron: '0 0 0 * * ?',
        name: 'UC-qsignRestart',
        fnc: clearQsignLog
      })
    }
  }

  async autoRestart() {
    if (!this.GM) return false
    if (process.platform !== 'win32') return this.reply('此功能只能在Windows系统中使用')
    const isOpen = /开启/.test(this.msg)
    if (isOpen) {
      if (!Check.file(Path.join(this.Cfg.qsign || Path.qsign, this.Cfg.qsingRunner))) {
        return this.reply('请根据本地配置在锅巴，UC-plugin配置中修改签名启动器路径及名称')
      }
      if (UCPr.intervalId || isCheckMsg) {
        return this.reply('当前已经开启签名自动重启')
      }
      this.setUCcontext()
      return this.reply(`请确认签名配置：\n监听host：${this.Cfg.host}\n监听port：${this.Cfg.port}\n签名路径：${this.Cfg.qsign || Path.qsign}\n签名启动器名称：${this.Cfg.qsingRunner}\n\n请确保以上配置和你本地配置一致，否则本功能无法发挥作用，如有不一致，请于 锅巴 → UC-plugin → 配置 修改\n\n确认开启？[确认|取消]`)
    } else {
      if (!UCPr.intervalId && !isCheckMsg) {
        return this.reply('当前未启动签名自动重启')
      }
      if (this.Cfg.switch1) clearInterval(UCPr.intervalId)
      if (this.Cfg.switch2) isCheckMsg = false
      return this.reply('已关闭签名自动重启，将不再自动重启签名')
    }
  }

  _makeSure() {
    if (this.isCancel()) return false
    this.isSure(() => {
      const choices = []
      if (this.Cfg.switch1) {
        UCPr.intervalId = setInterval(checkQsignPort, this.Cfg.sleep * 1000)
        choices.push('签名崩溃检测')
      }
      if (this.Cfg.switch2) {
        this.proxyLogError()
        isCheckMsg = true
        choices.push('签名异常检测')
      }
      this.finishReply(`已开启${choices.join('、')}，\n可通过#签名重启记录 查看今日签名重启记录`)
    })
  }

  async restartLog() {
    if (!this.GM) return false
    const data = await Data.redisGet(redisData, []) || []
    return this.reply('今日签名重启记录：\n\n' + Data.empty(Data.makeArrStr(data)), true)
  }

  async restart() {
    if (!this.GM) return false
    killQsign()
    startQsign()
    await common.sleep(5)
    return this.reply('签名指令重启成功')
  }

  async test() {
    if (!this.GM) return false
    checkMsg('签名api异常')
  }

  async clear() {
    if (!this.GM) return false
    const count = clearQsignLog()
    if (!count) return this.reply('当前不存在可清理的日志文件')
    return this.reply(`成功清理${count}个日志文件`)
  }

  proxyLogError() {
    if (UCPr.proxy[this.name]) return
    if (global.logger?.error) {
      logger.error = UCPr.proxy[this.name] = new Proxy(logger.error, {
        apply(logger_error, thisArg, args) {
          checkMsg(args[0])
          logger_error.apply(thisArg, args)
        }
      })
    }
  }

}