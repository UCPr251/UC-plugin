import { file, log, Path } from '../../components/index.js'
import UCDealEvent from './UCDealEvent.js'

export default async function EventLoader() {
  if (!UCPr.isWatch) {
    const _files = file.readdirSync(Path.Event, { type: '.js' })
    _files.forEach(file => import(`file:///${Path.Event}/${file}`).catch(err => log.error(err)))
    const files = file.readdirSync(Path.groupAdmin, { type: '.js' })
    files.forEach(file => import(`file:///${Path.groupAdmin}/${file}`).catch(err => log.error(err)))
  }
  if (!global.Bot?.on) return log.warn('非正常启动流程，跳过监听事件注册')
  log.debug('开始注册事件监听')
  Bot.on('message', (e) => {
    if (e.message_type === 'group') UCDealEvent('message.group', e)
    else if (e.message_type === 'private') UCDealEvent('message.private', e)
  })
  Bot.on('notice.group', (e) => {
    UCDealEvent('notice.group', e)
  })
  Bot.on('request.group', (e) => {
    UCDealEvent('request.group', e)
  })
}