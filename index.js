/* eslint-disable indent */
import { Data, Path, log } from './components/index.js'

const files = await Data.init()

log.blue('-------------------')
log.purple(`-----${Path.Plugin_Name}载入中-----`)

let ret = []

files.forEach((file) => ret.push(import(`file:///${Path.apps}/${file}`)))

ret = await Promise.allSettled(ret)

let apps = {}
let status = true
for (let i in files) {
    let name = files[i].replace('.js', '')
    if (ret[i].status !== 'fulfilled') {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        status = false
        continue
    }
    apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
}

if (status) {
    log.bluebold('┎┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┒')
    log.bluebold('┃    ╦      ╦     ╔══════    ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ╚══════╝     ╚══════    ┃')
    log.bluebold('┖┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┚')
    log.purple(`----${Path.Plugin_Name}载入成功----`)
    log.blue('-------------------')
}

export { apps }