import UCReDealEvent from './UCReDealEvent.js'
import _ from 'lodash'

export default async function UCdealEvent(type, e) {
  const msg = _.filter(e.message, { type: 'text' }).map(v => v.text).join(' ').trim()
  if (msg && (e.group_id || e.group?.gid) && !e.isUCSwitchBot) {
    const result = await (new UCReDealEvent(e, type).deal(type))
    if (result !== 0) return true // 返回值不是0则正常处理
  }
  const events = UCPr.event[type].filter(({ sub_type }) => sub_type === 'all' || sub_type === e.sub_type)
  /** 处理hook */
  for (const event of events) {
    const key = `${event.name}.${e.sender?.user_id ?? e.user_id}`
    const userHook = _.find(UCPr.hook, { key })
    if (userHook) {
      log.white(`执行hook方法：${event.name} ${userHook.fnc}`)
      const app = new event.class(e)
      try {
        await app[userHook.fnc](e)
      } catch (err) {
        e.reply?.(log.error(`执行${event.name}上下文${userHook.fnc}错误`, err))
      }
      return true
    }
  }
  /** 处理accept */
  for (const event of events) {
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
  }
  /** 处理消息 */
  for (const event of events) {
    // log.debug('检查插件：' + event.name)
    if (!_.isArray(event.rule)) continue
    // log.debug('检查插件正则' + event.name)
    for (const rule of event.rule) {
      // log.debug('检查功能正则' + rule.reg)
      if (new RegExp(rule.reg).test(msg)) {
        const start = Date.now()
        const logInfo = `[${event.name}][${rule.fnc}]${_.truncate(msg, { length: 50 })}`
        const app = new event.class(e)
        if (msg && app.isUCGA && app.GAconfig.isPrefix && !app.checkPrefix()) return false // 开启了UC群管前缀
        log.white(logInfo)
        try {
          const result = await app[rule.fnc](e)
          if (result !== false) {
            log.white(`${logInfo} 处理完成 ${Date.now() - start}ms`)
            return true
          }
        } catch (err) {
          e.reply?.(log.error(`执行${logInfo}错误`, err))
        }
        log.debug(`${logInfo} 向下传递`)
      }
    }
  }
  return false
}