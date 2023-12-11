import { UCPr, file, Path, Check, Data } from '../components/index.js'
import { UCPlugin } from './index.js'
import _ from 'lodash'

const hook = []

/** UC插件Event类 */
export default class UCEvent extends UCPlugin {
  constructor({
    e,
    name = 'UC插件·事件',
    dsc = 'UC插件·事件',
    event = 'message.group',
    rule,
    Cfg
  }) {
    super({ e, name, dsc, event, rule, Cfg })
    /**
     * message.group: normal anonymous
     *
     * notice.group: increase decrease recall sign admin ban transfer poke
     *
     * request.froup: invite add
     */
    this.sub_type = 'normal'
    this.isOpen = UCPr.GAconfig.isOpen && this.Cfg?.isOpen
    /** bot是否为管理员 */
    this.botIsAdmin = this.e.group?.is_admin
    /** bot是否为群主 */
    this.botIsOwner = this.e.group?.is_owner
    /** bot是否管理员或群主 */
    this.botIsAdminOrOwner = this.botIsAdmin || this.botIsOwner
  }

  /** 检查是否全局主人 */
  isGM(userId) {
    return Check.Master(userId)
  }

  /** 检查是否主人 */
  isM(userId, groupId) {
    if (this.isGM(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.Master, userId)
    return Check.str(this.groupCFG.permission?.Master, userId)
  }

  /** 检查是否全局管理 */
  isGA(userId) {
    return Check.Admin(userId)
  }

  /** 检查是否管理 */
  isA(userId, groupId) {
    if (this.isGA(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.Admin, userId)
    return Check.str(this.groupCFG.permission?.Admin, userId)
  }

  /** 检查是否全局黑名单 */
  isGB(userId) {
    return Check.BlackQQ(userId)
  }

  /** 检查是否黑名单 */
  isB(userId, groupId) {
    if (this.isGB(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.BlackQQ, userId)
    return Check.str(this.groupCFG.permission?.BlackQQ, userId)
  }

  /** 检查开关、use权限?、Bot群权限 */
  defaultVerify(isVerifyPermission = true) {
    if (!this.isOpen) return false
    if (isVerifyPermission && !this.verifyPermission(this.Cfg.use)) return false
    if (!this.botIsAdminOrOwner) return this.noPowReply()
    return true
  }

  getMemInfo(memId) {
    const memClient = this.e.group.pickMember(memId)
    if (!memClient?.info) return null
    return memClient.info
  }

  /** Bot和待操作群员群权限对比 */
  checkBotPower(memId) {
    if (this.botIsOwner) return true
    if (memId == this.qq) return true
    if (!this.botIsAdmin) return false
    if (!memId) return false
    const memInfo = this.getMemInfo(memId)
    if (!memInfo) return false
    if (memInfo.role === 'admin' || memInfo.role === 'owner') return false
    return true
  }

  /** 用户和待操作群员插件权限对比 */
  checkUserPower(memId) {
    return this.level >= Check.level(memId, this.groupId)
  }

  getMemName(memId) {
    const memberInfo = this.getMemInfo(memId)
    if (!memberInfo) return memId
    const { card, nickname } = memberInfo
    return card || nickname || memId
  }

  async reply(msg, quote, data = { recallMsg: 0, at: false }) {
    if (_.isEmpty(msg)) return
    if (!this.e.reply) return log.warn('[UCEvent.reply]发送消息错误，e.reply不存在')
    if (this.e.group?.mute_left > 0) return log.mark(`Bot在群${this.groupId}内处于禁言状态，取消发送`)
    let { recallMsg = 0, at = false } = data
    if (at) {
      msg = _.castArray(msg)
      if (isNaN(at)) at = this.userId
      msg = [segment.at(at), '\n', ...msg]
    }
    const msgRes = await this.e.reply(msg, quote).catch(err => {
      log.error('[UCEvent.reply]发送消息错误', err)
    })
    if (recallMsg) setTimeout(() => this.e.group.recallMsg(msgRes.message_id), recallMsg * 1000)
    return msgRes
  }

  /** 创建上下文 */
  setFunction(type = this.setFnc, time = UCPr.GAconfig.overTime) {
    const key = this.conKey()
    if (_.some(hook, { key })) return
    hook.push({
      key,
      type
    })
    this.setContext(type, false, time)
  }

}

async function dealMsg(type, e) {
  const msg = _.filter(e.message, { type: 'text' }).map(v => v.text).join(' ').trim()
  const events = UCPr.temp.event[type]
  for (const event of events) {
    // log.debug('检查方法：' + event.name)
    if (event.sub_type !== 'all' && !event.sub_type === e.sub_type) continue
    const key = `${event.name}.${e.sender?.user_id ?? e.user_id}`
    const userHook = _.find(hook, { key })
    if (userHook) {
      log.debug(`执行hook方法：${event.name} ${userHook.type}`)
      const app = new event.class(e)
      try {
        await app[userHook.type](e)
      } catch (err) {
        log.error(`执行${event.name} 上下文${userHook.type}错误`, err)
      }
      Data.remove(hook, userHook)
      return
    }
    if (event.accept) {
      // log.debug('执行accept方法：' + event.name)
      const app = new event.class(e)
      try {
        const result = await app.accept(e)
        if (result === 'return') return
      } catch (err) {
        log.error(`执行${event.name} accept错误`, err)
      }
    }
    if (!_.isArray(event.rule)) continue
    for (const rule of event.rule) {
      if (new RegExp(rule.reg).test(msg)) {
        const start = Date.now()
        const logInfo = `[${event.name}][${rule.fnc}] ${_.truncate(msg, { length: 50 })}`
        log.white(logInfo)
        const app = new event.class(e)
        const result = await app[rule.fnc](e)?.catch?.(err => {
          log.error(`执行${logInfo}错误`, err)
          e.reply?.(logInfo + ' 执行错误，请查看错误日志')
        })
        if (result !== false) {
          return log.white(`${logInfo} 处理完成 ${Date.now() - start}ms`)
        }
      }
    }
  }
}

export async function EventLoader() {
  const files = file.readdirSync(Path.groupAdmin, { type: '.js' })
  files.forEach(file => import(`file:///${Path.groupAdmin}/${file}`).catch(err => log.error(err)))
  if (UCPr.isWatch) {
    files.forEach(file => Data.watch(Path.get('groupAdmin', file), (path) => {
      log.whiteblod(`修改群管插件${Path.basename(path)}`)
      import(`file:///${path}?${Date.now()}`).catch(err => log.error(err))
    }))
  }
  Bot.on('message.group', (e) => {
    // log.debug('接收事件：message.group')
    dealMsg('message.group', e)
  })
  Bot.on('notice.group', (e) => {
    // log.debug('接收事件：notice.group')
    dealMsg('notice.group', e)
  })
  Bot.on('request.group', (e) => {
    // log.debug('接收事件：request.group')
    dealMsg('request.group', e)
  })
  return _.flatMap(_.values(UCPr.temp.event)).length
}