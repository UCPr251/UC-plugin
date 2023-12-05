import { UCPr, file, Path } from '../components/index.js'
import { UCPlugin } from './index.js'
import _ from 'lodash'

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
  }

}

async function dealMsg(type, e) {
  const msg = _.filter(e.message, { type: 'text' }).map(v => v.text).join(' ')
  const events = UCPr.temp.event[type]
  for (const event of events) {
    log.debug('检查方法：' + event.name)
    if (event.sub_type !== 'all' && !event.sub_type === e.sub_type) continue
    if (event.accept) {
      log.debug('执行accept方法：' + event.name)
      const app = new event.class(e)
      if (app.accept(e) === 'return') {
        return
      }
    }
    if (!_.isArray(event.rule)) continue
    for (const rule of event.rule) {
      if (new RegExp(rule.reg).test(msg)) {
        const start = Date.now()
        const logInfo = `[${event.name}][${rule.fnc}] ${_.truncate(msg, { length: 50 })}`
        log.white(logInfo)
        const app = new event.class(e)
        const result = await app[rule.fnc]
        if (result !== false) {
          return log.white(`${logInfo} 处理完成 ${Date.now() - start}ms`)
        }
      }
    }
  }
}

export async function eventLoader() {
  let count = 0
  if (!UCPr.isWatch) {
    const files = file.readdirSync(Path.groupAdmin, { type: '.js' })
    for (const file of files) {
      import(`file:///${Path.groupAdmin}/${file}`)
      count++
    }
  }
  Bot.on('message.group', (e) => {
    log.debug('接收事件：message.group')
    dealMsg('message.group', e)
  })
  Bot.on('notice.group', (e) => {
    log.debug('接收事件：notice.group')
    dealMsg('notice.group', e)
  })
  Bot.on('request.group', (e) => {
    log.debug('接收事件：request.group')
    dealMsg('request.group', e)
  })
  return count
}