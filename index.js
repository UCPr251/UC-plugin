/* eslint-disable indent */
import { Path, Data, log, file, common, UCPr } from './components/index.js'
import path from 'path'

const files = await Data.init()

log.blue('-------------------')
log.purple(`-----${Path.Plugin_Name}载入中-----`)

/** 适配UC-plugin */
const jsfiles = file.readdirSync(Path.example, { type: '.js' })
const list = ['blivepush', 'configset', 'randomwife']
const dels = []
for (let _file of jsfiles) {
    for (let js of list) {
        if (_file.toLowerCase().startsWith(js)) {
            file.unlinkSync(path.join(Path.example, _file))
            dels.push(_file)
        }
    }
}
if (dels.length > 0) {
    common.sendMsgTo(UCPr.Master[0], `检测到UC-plugin旧版js插件：${dels.join('，')}，已自动删除`, 'Private')
}

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