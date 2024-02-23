import { UCPr, file, Path, Check, common } from '../components/index.js'
import Runtime from '../../../lib/plugins/runtime.js'
import loader from '../../../lib/plugins/loader.js'
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
    priority,
    rule,
    Cfg
  }) {
    super({ e, name, dsc, event, priority, rule, Cfg })
    /**
     * message.group: normal anonymous
     *
     * message.private: group friend other self
     *
     * notice.group: increase decrease recall sign admin ban transfer poke
     *
     * request.group: invite add
     */
    this.sub_type = ''
    if (!e) return
    /** bot是否为管理员 */
    this.botIsAdmin = this.e.group?.is_admin
    /** bot是否为群主 */
    this.botIsOwner = this.e.group?.is_owner
    /** bot是否管理员或群主 */
    this.botIsAdminOrOwner = this.botIsAdmin || this.botIsOwner
    /** 群名 */
    this.groupName = this.e.group?.name
  }

  /** 是否启用群管及该功能 */
  get isOpen() {
    return this.GAconfig?.isOpen && _.get(this.Cfg, 'isOpen', true)
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
  checkBotPower(memId = this.userId) {
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

  /** 创建上下文，false再处理 */
  setFunction(type = this.setFnc, time = UCPr.GAconfig.overTime) {
    const key = this.conKey()
    if (_.some(hook, { key })) return
    const info = {
      key,
      type
    }
    hook.push(info)
    this.setContext(type, false, time)
    setTimeout(() => {
      if (_.remove(hook, info).length) {
        log.yellow(`${key}操作超时已取消`)
      }
    }, time * 1000)
  }

  async BotPluginsDeal(e = this.e) {
    return await BotPluginsDeal(e).catch(err => log.error('[UCEvent]执行消息处理错误', err))
  }

}

class UCSwitchBotEvent extends UCEvent {
  constructor(e) {
    super({
      e,
      name: 'UC-switchBotEvent',
      Cfg: 'config.switchBot'
    })
    if (!this.isGroup) return
    this.groupData = UCPr.defaultCfg.getConfig('group')
  }

  async deal(e, type) {
    if (e.isUCSwitchBot) {
      return await this.dealMsg(e, type)
    }
    if (!this.verifyPermission(this.Cfg.closedCommand, { isReply: false })) return false
    if (this.Cfg.isAt && e.atme) {
      e.isUCSwitchBot = true
      return await this.dealMsg(e, type)
    }
    const reg = new RegExp(`^\\s*${UCPr.BotName}`, 'i')
    if (this.Cfg.isPrefix && reg.test(this.msg)) {
      e.isUCSwitchBot = true
      e.message.forEach(v => (v.text &&= v.text.replace(reg, '')))
      return await this.dealMsg(e, type)
    }
    return false
  }

  async dealMsg(e, type) {
    _.unset(this.groupData, `${this.groupId}.enable`)
    let result = await UCdealMsg(type, e)
    await common.sleep(0.2) // 等待本体loader.deal执行完毕和本体CD
    if (result === false && type === 'message.group' && !e.atme) {
      result = await BotPluginsDeal(e).catch(err => log.error('执行消息处理错误', err))
    }
    _.set(this.groupData, `${this.groupId}.enable`, ['UC-switchBot'])
    return result
  }
}

async function UCdealMsg(type, e) {
  const groupId = e.group_id || e.group?.gid
  if (groupId && _.isEqual(_.get(UCPr.defaultCfg.getConfig('group'), `${groupId}.enable`), ['UC-switchBot'])) {
    if (type.startsWith('message')) {
      const a = new UCSwitchBotEvent(e)
      return await a.deal(e, type)
    }
    return
  }
  const msg = _.filter(e.message, { type: 'text' }).map(v => v.text).join(' ').trim()
  const events = UCPr.event[type]
  for (const event of events) {
    // log.debug('检查插件：' + event.name)
    if (event.sub_type !== 'all' && event.sub_type !== e.sub_type) continue
    const key = `${event.name}.${e.sender?.user_id ?? e.user_id}`
    const userHook = _.find(hook, { key })
    if (userHook) {
      log.white(`执行hook方法：${event.name} ${userHook.type}`)
      const app = new event.class(e)
      try {
        const result = await app[userHook.type](e)
        result !== false && _.remove(hook, userHook)
      } catch (err) {
        const errMsg = `执行${event.name}上下文${userHook.type}错误`
        const errInfo = log.error(errMsg, err)
        e.reply?.(errInfo)
      }
      return true
    }
    if (event.accept) {
      // log.debug('执行accept方法：' + event.name)
      const app = new event.class(e)
      try {
        const result = await app.accept(e)
        if (result === 'return') return true
      } catch (err) {
        log.error(`执行${event.name} accept错误`, err)
      }
    }
    if (!_.isArray(event.rule)) continue
    // log.debug('检查插件正则' + event.name)
    for (const rule of event.rule) {
      // log.debug('检查功能正则' + rule.reg)
      if (new RegExp(rule.reg).test(msg)) {
        // log.white(msg)
        const start = Date.now()
        const logInfo = `[${event.name}][${rule.fnc}]${_.truncate(msg, { length: 50 })}`
        log.white(logInfo)
        const app = new event.class(e)
        const result = await app[rule.fnc](e)?.catch?.(err => {
          const errInfo = log.error(`执行${logInfo}错误`, err)
          e.reply?.(errInfo)
        })
        if (result !== false) {
          log.white(`${logInfo} 处理完成 ${Date.now() - start}ms`)
          return true
        }
        log.white(`${logInfo} 向下传递`)
      }
    }
  }
  return false
}

export async function EventLoader() {
  if (!UCPr.isWatch) {
    const _files = file.readdirSync(Path.Event, { type: '.js' })
    _files.forEach(file => import(`file:///${Path.Event}/${file}`).catch(err => log.error(err)))
    const files = file.readdirSync(Path.groupAdmin, { type: '.js' })
    files.forEach(file => import(`file:///${Path.groupAdmin}/${file}`).catch(err => log.error(err)))
  }
  if (!Bot?.on) return log.warn('非正常启动流程，跳过监听事件注册')
  Bot.on('message', async (e) => {
    const result = await UCdealMsg('message', e)
    if (result === false) {
      if (e.message_type === 'group') UCdealMsg('message.group', e)
      else if (e.message_type === 'private') UCdealMsg('message.private', e)
    }
  })
  Bot.on('notice.group', (e) => {
    UCdealMsg('notice.group', e)
  })
  Bot.on('request.group', (e) => {
    UCdealMsg('request.group', e)
  })
}

async function BotPluginsDeal(e) {
  if (loader.checkGuildMsg(e)) return false
  if (!loader.checkLimit(e)) return false
  if (!loader.checkBlack(e)) return false
  const priority = []
  if (!e.runtime) await Runtime.init(e)
  if (e.msg === undefined && _.some(e.message, { type: 'text' })) loader.dealMsg(e)
  e.msg &&= e.msg.replace(new RegExp(`^\\s*(${UCPr.BotName})+`, 'i'), '')
  loader.priority.forEach(v => {
    const p = new v.class(e)
    p.e = e
    if (!loader.checkDisable(e, p)) return
    if (!loader.filtEvent(e, p)) return
    priority.push(p)
  })
  for (const plugin of priority) {
    if (plugin.getContext) {
      const context = plugin.getContext()
      if (!_.isEmpty(context)) {
        for (const fnc in context) {
          plugin[fnc](context[fnc])
        }
        return true
      }
    }
    if (plugin.getContextGroup) {
      const context = plugin.getContextGroup()
      if (!_.isEmpty(context)) {
        for (const fnc in context) {
          plugin[fnc](context[fnc])
        }
        return true
      }
    }
  }
  if (!loader.onlyReplyAt(e)) return false
  if (loader.srReg.test(e.msg)) {
    e.game = 'sr'
    e.msg = e.raw_message = e.original_msg = e.msg.replace(loader.srReg, '#星铁')
  }
  for (const plugin of priority) {
    if (plugin.accept) {
      const res = await plugin.accept(e)
      if (res === 'return') return true
      if (res) break
    }
  }
  for (const plugin of priority) {
    if (plugin.rule) {
      for (const v of plugin.rule) {
        if (v.event && !loader.filtEvent(e, v)) continue
        const regExp = new RegExp(v.reg)
        const messageOrApplet = e.msg || e.message?.[0]?.data
        if (regExp.test(messageOrApplet)) {
          e.logFnc = `[${plugin.name}][${v.fnc}]`
          if (v.log !== false) {
            log.white(`${e.logFnc}${e.logText} ${_.truncate(e.msg, { length: 50 })}`)
          }
          if (!loader.filtPermission(e, v)) return false
          try {
            const res = plugin[v.fnc] && (await plugin[v.fnc](e))
            const start = Date.now()
            if (res !== false) {
              loader.setLimit(e)
              if (v.log !== false) {
                log.white(`${e.logFnc} ${_.truncate(e.msg, { length: 50 })} 处理完成 ${Date.now() - start}ms`)
              }
              return true
            }
          } catch (err) {
            log.error(`${e.logFnc}`, err)
            return false
          }
        }
      }
    }
  }
  return false
}