/* eslint-disable indent */
import { Path, Data, log, UCPr, file } from './components/index.js'
import { EventLoader } from './model/UCEvent.js'

/** 日志 */
global.log = log
/** 数据 */
global.UCPr = UCPr

const files = await Data.init()

if (Array.isArray(UCPr.permission.Master)) {
    file.copyFileSync(Path.get('defSet', 'permission.yaml'), Path.permissionyaml)
}

log.blue('---------------------')
log.purple(`----${UCPr.Plugin_Name} ${UCPr.version}载入中-----`)

let ret = []

files.forEach((file) => ret.push(import(`file:///${Path.apps}/${file}`)))

ret = await Promise.allSettled(ret)

const apps = {}
let status = true
for (const i in files) {
    const name = files[i].replace('.js', '')
    if (ret[i].status !== 'fulfilled') {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        status = false
        continue
    }
    apps[name] = ret[i].value.default ?? ret[i].value[Object.keys(ret[i].value)[0]]
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
    log.purple(`----${UCPr.Plugin_Name} ${UCPr.version}载入成功-----`)
    log.blue('---------------------')
}

export { apps }