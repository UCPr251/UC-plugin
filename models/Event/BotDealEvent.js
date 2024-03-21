import Runtime from '../../../../lib/plugins/runtime.js'
import loader from '../../../../lib/plugins/loader.js'
import _ from 'lodash'

export default async function BotDealEvent(e) {
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
    if (!loader.checkDisable(p, p)) return
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