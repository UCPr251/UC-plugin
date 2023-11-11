/* eslint-disable indent */
import { Path, Data, log, file, common, UCPr } from './components/index.js'

let files = await Data.init()

log.blue('---------------------')
log.purple(`-------${Path.Plugin_Name}载入中--------`)

/** 适配UC-plugin */
const jsfiles = file.readdirSync(Path.example, { type: '.js' })
const list = ['blivepush', 'configset', 'randomwife', 'vits语音', 'randommember']
const dels = []
for (let _file of jsfiles) {
    for (let js of list) {
        if (_file.toLowerCase().startsWith(js)) {
            file.unlinkSync(Path.join(Path.example, _file))
            dels.push(_file)
        }
    }
}

if (dels.length > 0) {
    const msg = `检测到UC-plugin旧版js插件：${dels.join('，')}，已自动删除`
    log.warn(msg)
    common.sendMsgTo(UCPr.Master[0], msg, 'Private')
}

let ret = []

// 开发环境
if (UCPr.config.isWatch) {
    files = ['reloadApps.js']
}

files.forEach((file) => ret.push(import(`file:///${Path.apps}/${file}`)))

ret = await Promise.allSettled(ret)

const apps = {}
let status = true
let count = 0
for (const i in files) {
    const name = files[i].replace('.js', '')
    if (ret[i].status !== 'fulfilled') {
        logger.error(`载入插件错误：${logger.red(name)}`)
        logger.error(ret[i].reason)
        status = false
        continue
    }
    count++
    if (!ret[i].value.default) {
        apps[name] = ret[i].value[Object.keys(ret[i].value)[0]]
        continue
    }
    apps[name] = ret[i].value.default
}

if (status) {
    log.bluebold('┎┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┒')
    log.bluebold('┃    ╦      ╦     ╔══════    ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ║      ║     ║          ┃')
    log.bluebold('┃    ╚══════╝     ╚══════    ┃')
    log.bluebold('┖┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┚')
    log.purple(`----${Path.Plugin_Name}成功载入${count}个js----`)
    log.blue('---------------------')
}

export { apps }