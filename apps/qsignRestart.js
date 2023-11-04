import { Path, Check, Data, log, UCPr, UCDate } from '../components/index.js'
import loader from '../../../lib/plugins/loader.js'
import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import lodash from 'lodash'

/** 全局变量 */
let intervalId, isCheckMsg, ing
/** 异常次数计数 */
let errorTimes = 0

const redisData = '[UC]restartLog'

function startQsign() {
  Data.exec(`start ${UCPr.qsignRestart.qsingRunner}`, UCPr.qsignRestart.qsign || Path.qsign)
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

async function checkMsg(msg) {
  if (ing || !isCheckMsg) return false
  if (/签名api异常/i.test(msg)) {
    if (++errorTimes >= (UCPr.qsignRestart?.errorTimes ?? 3)) {
      ing = true
      log.red(`检测到签名异常${errorTimes}次，尝试重启签名`)
      killQsign()
      startQsign()
      addLog('签名异常')
      setTimeout(() => {
        ing = false
        errorTimes = 0
      }, 120000)
    }
  }
}

async function checkQsignPort() {
  if (ing) return false
  const output = await Data.checkPort(UCPr.qsignRestart.port, UCPr.qsignRestart.host)
  if (output) {
    ing = true
    log.red('检测到签名已关闭，尝试启动签名')
    startQsign()
    addLog('签名关闭')
    setTimeout(() => (ing = false), 120000)
  } else {
    log.whiteblod('签名运行ing')
  }
}

const cfg = UCPr.qsignRestart

if (cfg.isAutoOpen) {
  if (Check.file(Path.join(cfg.qsign || Path.qsign, cfg.qsingRunner))) {
    if (cfg.switch1) intervalId = setInterval(checkQsignPort, UCPr.qsignRestart.sleep * 1000)
    if (cfg.switch2) {
      replaceReply()
      isCheckMsg = true
    }
  }
}

export class UCQsignRestart extends plugin {
  constructor() {
    super({
      name: 'UC-qsignRestart',
      dsc: '监听qsign端口和消息回复报错自动重启签名',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?(UC)?(开启|关闭)签名自动重启$/i,
          fnc: 'restart'
        },
        {
          reg: /^#?(UC)?签名重启(日志|记录)$/i,
          fnc: 'restartLog'
        },
        {
          reg: /^#?(UC)?签名测试$/i,
          fnc: 'test'
        }
      ]
    })
    this.setFnc = 'verify'
  }

  async restart(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    const isOpen = /开启/.test(e.msg)
    const cfg = UCPr.qsignRestart
    if (isOpen) {
      if (!Check.file(Path.join(cfg.qsign || Path.qsign, cfg.qsingRunner))) {
        return e.reply('请根据本地配置在锅巴，UC-plugin配置中修改签名启动器路径及名称')
      }
      if (intervalId || isCheckMsg) {
        return e.reply('当前已经开启签名自动重启')
      }
      this.setContext(this.setFnc)
      return e.reply(`请确认签名配置：\n监听host：${cfg.host}\n监听port：${cfg.port}\n签名路径：${cfg.qsign || Path.qsign}\n签名启动器名称：${cfg.qsingRunner}\n\n请确保以上配置和你本地配置一致，否则本功能无法发挥作用，如有不一致，请于 锅巴 → UC-plugin → 配置 修改\n\n确认开启？[确认|取消]`)
    } else {
      if (!intervalId && !isCheckMsg) {
        return e.reply('当前未启动签名自动重启')
      }
      if (cfg.switch1) clearInterval(intervalId)
      if (cfg.switch2) isCheckMsg = false
      return e.reply('已关闭签名自动重启，将不再自动重启签名')
    }
  }

  async verify() {
    if (Data.isCancel.call(this)) return false
    const cfg = UCPr.qsignRestart
    if (/确认|确定/.test(this.e.msg)) {
      const choices = []
      if (cfg.switch1) {
        intervalId = setInterval(checkQsignPort, cfg.sleep * 1000)
        choices.push('签名崩溃检测')
      }
      if (cfg.switch2) {
        replaceReply()
        isCheckMsg = true
        choices.push('签名异常检测')
      }
      Data.finish.call(this, `已开启${choices.join('、')}，\n可通过#签名重启记录 查看今日签名重启记录`)
    }
  }

  async restartLog(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    const data = await Data.redisGet(redisData, []) || []
    return e.reply('今日签名重启记录：\n\n' + Data.empty(Data.makeArrStr(data)), true)
  }

  async test(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    checkMsg('签名api异常')
  }
}

function replaceReply() {
  loader.reply = function (e) {
    if (e.reply) {
      e.replyNew = e.reply

      /**
       * @param msg 发送的消息
       * @param quote 是否引用回复
       * @param data.recallMsg 群聊是否撤回消息，0-120秒，0不撤回
       * @param data.at 是否at用户
       */
      e.reply = async (msg = '', quote = false, data = {}) => {
        if (!msg) return false

        /** 禁言中 */
        if (e.isGroup && e?.group?.mute_left > 0) return false

        let { recallMsg = 0, at = '' } = data

        if (at && e.isGroup) {
          let text = ''
          if (e?.sender?.card) {
            text = lodash.truncate(e.sender.card, { length: 10 })
          }
          if (at === true) {
            at = Number(e.user_id) || e.user_id
          } else if (!isNaN(at)) {
            if (e.isGuild) {
              text = e.sender?.nickname
            } else {
              let info = e.group.pickMember(at).info
              text = info?.card ?? info?.nickname
            }
            text = lodash.truncate(text, { length: 10 })
          }

          if (Array.isArray(msg)) {
            msg = [segment.at(at, text), ...msg]
          } else {
            msg = [segment.at(at, text), msg]
          }
        }

        let msgRes
        try {
          msgRes = await e.replyNew(msg, quote)
        } catch (err) {
          if (typeof msg != 'string') {
            if (msg.type == 'image' && Buffer.isBuffer(msg?.file)) msg.file = {}
            msg = lodash.truncate(JSON.stringify(msg), { length: 300 })
          }
          logger.error(`发送消息错误:${msg}`)
          logger.error(err)

          // 改动
          checkMsg(err.message)

        }

        // 频道一下是不是频道
        if (!e.isGuild && recallMsg > 0 && msgRes?.message_id) {
          if (e.isGroup) {
            setTimeout(() => e.group.recallMsg(msgRes.message_id), recallMsg * 1000)
          } else if (e.friend) {
            setTimeout(() => e.friend.recallMsg(msgRes.message_id), recallMsg * 1000)
          }
        }

        this.count(e, msg)
        return msgRes
      }
    } else {
      e.reply = async (msg = '', quote = false, data = {}) => {
        if (!msg) return false
        this.count(e, msg)
        if (e.group_id) {
          return await e.group.sendMsg(msg).catch((err) => {
            logger.warn(err)
          })
        } else {
          let friend = e.bot.fl.get(e.user_id)
          if (!friend) return
          return await e.bot.pickUser(e.user_id).sendMsg(msg).catch((err) => {
            logger.warn(err)
          })
        }
      }
    }
  }
}