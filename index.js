/* eslint-disable indent */
import { Path, Data, log, UCPr } from './components/index.js'
import UCPlugin from './model/UCPlugin.js'

/** UC插件类 */
global.UCPlugin = UCPlugin
/** 日志 */
global.log = log

let files = await Data.init()

log.blue('---------------------')
log.purple(`-------${Path.Plugin_Name}载入中--------`)

let ret = []

if (UCPr.isWatch) {
    files = ['reloadJSs.js']
}

files.forEach((file) => ret.push(import(`file:///${Path.apps}/${file}`)))

ret = await Promise.allSettled(ret)

const apps = {}
let status = true
let jsCount = 0
for (const i in files) {
    const name = files[i].replace('.js', '')
    if (ret[i].status !== 'fulfilled') {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        status = false
        continue
    }
    jsCount++
    apps[name] = ret[i].value.default ?? ret[i].value[Object.keys(ret[i].value)[0]]
}

if (status) {
    log.bluebold('┎┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┒')
    log.bluebold('┃    ╦      ╦     ╔══════    ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ╚══════╝     ╚══════    ┃')
    log.bluebold('┖┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┚')
    log.purple(`-------成功载入${jsCount}个js-------`)
    log.blue('---------------------')
}

export { apps }