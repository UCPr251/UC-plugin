/* eslint-disable import/first */
/* eslint-disable indent */
logger.info(logger.chalk.bold('[UC]开始载入UC插件'))
import { Data, log, UCPr } from './components/index.js'
import applyErrorDecorator from './components/ErrorDecorator.js'
import EventLoader from './models/Event/EventLoader.js'

// if (!global.segment) {
//     try {
//         const { segment } = await import('icqq')
//         global.segment = segment
//     } catch (e) {
//         try {
//             const { segment } = await import('@icqqjs/icqq')
//             global.segment = segment
//         } catch (err) {
//             logger.error('segment加载失败，部分功能可能无法正常使用', err)
//         }
//     }
// }

/** 数据 */
global.UCPr = UCPr

/** 日志 */
setTimeout(() => (global.log = log))

const files = await Data.init()

log.blue('---------------------')
log.purple(`----${UCPr.Plugin_Name} ${UCPr.version} 载入中-----`)

let ret = files.map(app => import(`./apps/${app}.js`))

ret = await Promise.allSettled(ret)

const apps = {}

let status = true

for (const i in files) {
    if (ret[i].status !== 'fulfilled') {
        log.error(`载入插件错误：${files[i]}`, ret[i].reason)
        status = false
        continue
    }
    apps[files[i]] = applyErrorDecorator(ret[i].value.default)
}

await EventLoader()

if (status) {
    log.bluebold('┎┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┒')
    log.bluebold('┃    ╦      ╦     ╔══════    ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ╚══════╝     ╚══════    ┃')
    log.bluebold('┖┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┚')
    log.purple(`----${UCPr.Plugin_Name} ${UCPr.version} 载入成功-----`)
    log.blue('---------------------')

    logger.info(logger.chalk.bold('[UC]UC插件载入成功'))
}

export { apps }