/* eslint-disable prefer-const */
import { Path, Check, file, UCPr, log, Data, common } from '../components/index.js'
import { UCPlugin } from '../model/index.js'
import loader from '../../../lib/plugins/loader.js'

let JSs = ['reloadJSs.js'], watcher = {}, ing = false, timer

export default class UCReloadJSs extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-reloadJSs',
      dsc: '重载UC插件',
      rule: [
        {
          reg: /^#?UC开发者?(模式|环境)$/i,
          fnc: 'UCdeveloper'
        },
        {
          reg: /^#?UC重载插件(.*)/i,
          fnc: 'UCreloadJSs'
        },
        {
          reg: /^#?UC卸载插件(.+)/i,
          fnc: 'UCunloadJS'
        },
        {
          reg: /^#?UC删除插件(.+)/i,
          fnc: 'UCunlinkJS'
        },
        {
          reg: /^#?UC(一|总)览$/i,
          fnc: 'generalView'
        },
        {
          reg: /^#?UC载入插件$/i,
          fnc: 'viewJSs'
        },
        {
          reg: /^#?UC定时任务$/i,
          fnc: 'viewTasks'
        },
        {
          reg: /^#?UC插件监听$/i,
          fnc: 'viewWatcher'
        },
        {
          reg: /^#?UC系统载入插件$/i,
          fnc: 'viewloaderPlugin'
        },
        {
          reg: /^#?UC系统定时任务$/i,
          fnc: 'viewloaderTask'
        }
      ]
    })
    this.redisData = '[UC]reloadPlugins'
  }

  async init(isOpen) {
    if (UCPr.isWatch || isOpen) {
      ing = true
      await reloadJSs()
      await reloadEvents('Event')
      await reloadEvents('groupAdmin')
      const watch = await Data.watchDir(Path.apps, async (newAppPath) => {
        const parentDirName = Path.basename(Path.dirname(newAppPath))
        const jsName = Path.basename(newAppPath)
        let watch
        if (parentDirName === 'groupAdmin' || parentDirName === 'Event') {
          log.yellow(`新增${parentDirName}插件：${jsName}`)
          import(`file:///${newAppPath}?${Date.now()}`).catch(err => log.error(err))
          watch = Data.watch(newAppPath, (path) => {
            log.whiteblod(`修改${parentDirName}插件${Path.basename(path)}`)
            import(`file:///${path}?${Date.now()}`).catch(err => log.error(err))
          })
          JSs.push(jsName)
        } else {
          log.yellow('新增插件：' + jsName)
          await common.sleep(0.1)
          await loadJs(newAppPath)
          watch = Data.watch(newAppPath, reloadJS.bind(loader, newAppPath))
        }
        watcher[jsName] = watch
      })
      watch.on('unlink', async (delAppPath) => {
        const parentDirName = Path.basename(Path.dirname(delAppPath))
        const jsName = Path.basename(delAppPath)
        if (parentDirName === 'groupAdmin' || parentDirName === 'Event') {
          log.yellow(`删除${parentDirName}插件：${jsName}`)
          const name = 'UC-' + jsName.replace('.js', '')
          for (const event in UCPr.temp.event) {
            Data.remove(UCPr.temp.event[event], name, 'name')
          }
        } else {
          log.yellow('删除插件：' + jsName)
          await unloadJs(delAppPath)
          await cancelTask(delAppPath)
        }
        watcher[jsName].close()
        delete watcher[jsName]
        delete UCPr.temp.watcher[delAppPath]
        Data.remove(JSs, jsName)
      })
      // JSs.forEach(JS => log.yellow(JS))
      log.red(`总计载入UC插件${JSs.length}项功能`)
    }
  }

  getGeneralView() {
    let msg = '【UC开发环境总览】\n'
    msg += `UC载入${JSs.length}个功能\n`
    msg += `UC载入${UCPr.temp.task.length}个定时任务\n`
    msg += `UC载入${Object.values(UCPr.temp.event).reduce((ori, arr) => ori + arr.length, 0)}个Event\n`
    msg += `UC监听${Object.keys(watcher).length}个js\n`
    msg += `UC共监听${Object.keys(UCPr.temp.watcher).length}个文件(夹)\n`
    msg += `Bot本体总计${loader.priority.length}个插件功能\n`
    msg += `Bot本体总计${loader.task.length}个定时任务`
    log.yellow(msg)
    return msg
  }

  async UCdeveloper(e) {
    if (!this.GM) return e.reply('你想做甚？！', true, { at: true })
    if (ing) return e.reply('当前已处于开发模式，请勿重复开启')
    await this.init(true)
    const msg = this.getGeneralView()
    return e.reply('成功进入UC开发者模式\n' + msg)
  }

  async UCreloadJSs(e) {
    if (!this.GM) return e.reply('你想做甚？！', true, { at: true })
    if (ing) return e.reply('当前已处于开发模式，无需手动重载插件')
    const jsName = e.msg.match(/重载插件(.*)/)[1].trim() + '.js'
    if (jsName === '.js') {
      const num = await reloadJSs(false)
      const EventNum = await reloadEvents('Event', false)
      const GAnum = await reloadEvents('groupAdmin', false)
      return e.reply(`成功重载${num}个UC插件、${EventNum}个普通Event、${GAnum}个UC群管插件`)
    }
    const jsPath = Path.get('apps', jsName)
    if (!Check.file(jsPath)) return e.reply(jsName + '插件不存在，请检查')
    await reloadJS(jsPath)
    return e.reply('成功重载插件' + jsName)
  }

  async UCunloadJS(e) {
    if (!this.GM) return e.reply('你想做甚？！', true, { at: true })
    const jsName = e.msg.match(/卸载插件(.*)/)[1].trim() + '.js'
    const appPath = Path.get('apps', jsName)
    if (!Check.file(appPath)) return e.reply(jsName + '插件不存在，请检查')
    if (ing && !Check.str(JSs, jsName)) return e.reply('当前未载入' + jsName)
    await unloadJs(appPath)
    return e.reply(`成功卸载${jsName}插件。注意卸载非删除，重启机器人后仍会加载该插件，如需彻底删除，请使用#UC删除插件`)
  }

  async UCunlinkJS(e) {
    if (!this.GM) return e.reply('你想做甚？！', true, { at: true })
    const jsName = e.msg.match(/删除插件(.*)/)[1].trim() + '.js'
    const appPath = Path.get('apps', jsName)
    if (!Check.file(appPath)) return e.reply(jsName + '插件不存在，请检查')
    await unloadJs(appPath)
    file.unlinkSync(appPath)
    return e.reply(`成功卸载并删除${jsName}插件`)
  }

  async generalView(e) {
    if (!this.GM) return false
    if (JSs.length === 1) return e.reply('当前非开发环境')
    const msg = this.getGeneralView()
    return e.reply(msg)
  }

  async viewJSs() {
    if (!this.GM) return false
    const msg = Data.makeArrStr(JSs)
    log.yellow(msg)
    log.red(`总计${JSs.length}个功能`)
  }

  async viewTasks() {
    if (!this.GM) return false
    const msg = Data.makeArrStr(UCPr.temp.task, { property: 'name', property2: 'cron' })
    log.yellow(msg)
    log.red(`总计${UCPr.temp.task.length}个定时任务`)
  }

  async viewWatcher() {
    if (!this.GM) return false
    const msg = Object.keys(watcher).join('\n')
    log.yellow(msg)
    log.red(`总计监听${Object.keys(watcher).length}个js`)
    const all = Data.makeArrStr(Object.keys(UCPr.temp.watcher))
    log.yellow(all)
    log.red(`总计监听${Object.keys(UCPr.temp.watcher).length}个文件(夹)`)
  }

  async viewloaderPlugin() {
    if (!this.GM) return false
    const names = loader.priority.map(v => v.name)
    names.forEach(name => log.yellow(name))
    log.red(`Bot总计：${loader.priority.length}个插件`)
  }

  async viewloaderTask() {
    if (!this.GM) return false
    Data.makeArr(loader.task, { property: 'name', property2: 'cron' })
      .forEach(v => log.yellow(v))
    log.red(`Bot总计：${loader.task.length}个定时任务`)
  }

}

/**
 * 重载除reloadJSs.js以外全部JS
 * @param {boolean} [isWatch=true] 重载后是否监听，默认监听
 * @returns 重载JS个数
 */
async function reloadJSs(isWatch = true) {
  const _JSs = file.readdirSync(Path.apps, { type: '.js', removes: 'reloadJSs.js' })
  for (const _JS of _JSs) {
    const jsPath = Path.get('apps', _JS)
    await reloadJS(jsPath)
    if (isWatch) {
      const watch = Data.watch(jsPath, reloadJS.bind(loader, jsPath))
      watcher[_JS] = watch
    }
  }
  return _JSs.length
}

/**
 * 载入js并按照优先级重新排序
 * @param {string} jsPath 需要载入的JS路径
 */
export async function loadJs(jsPath) {
  try {
    const temp = await import(`file:///${jsPath}?${Date.now()}`)
    const app = temp.default ?? temp[Object.keys(temp)[0]]
    const plugin = new app()
    log.purple('[载入插件]' + '名称：' + plugin.name ?? '无', '优先级：' + plugin.priority ?? '无')
    const jsName = Path.basename(jsPath)
    if (plugin.task.name) {
      Data.loadTask(plugin.task)
      const taskName = plugin.task.name ?? plugin.name
      log.blue('[载入定时任务]' + taskName)
    }
    JSs.push(jsName)
    try {
      plugin.init && plugin.init()
    } catch (err) {
      log.error(err)
    }
    loader.priority.push({
      class: app,
      key: Path.Plugin_Name,
      name: plugin.name,
      priority: plugin.priority
    })
  } catch (err) {
    log.error('载入插件错误：', err)
  }
  order()
}

/**
 * 卸载JS并删除其定时任务
 * @param {string} jsPath 需要卸载的JS路径
 */
export async function unloadJs(jsPath) {
  const name = 'UC-' + Path.parse(jsPath).name
  const del = Data.remove(loader.priority, name, 'name')[0]
  if (del) {
    if (name === 'UC-qsignRestart' && UCPr.temp.intervalId) {
      log.blue('清除签名崩溃检测计时器')
      clearTimeout(UCPr.temp.intervalId)
    }
    log.purple('[卸载插件]' + '名称：' + del.name ?? '无', '优先级：' + del.priority ?? '无')
    const jsName = Path.basename(jsPath)
    Data.remove(JSs, jsName)
    await cancelTask(jsPath)
  }
}

/**
 * 取消JS对应的定时任务
 * @param {string} jsPath JS路径
 */
async function cancelTask(jsPath) {
  Data.cancelTask('UC-' + Path.parse(jsPath).name)
}

/**
 * 重载JS插件
 * @param {string} jsPath JS路径
 */
async function reloadJS(jsPath) {
  await unloadJs(jsPath)
  await loadJs(jsPath)
}

/** 插件优先级重新排序 */
function order() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    loader.priority = loader.priority.sort((a, b) => a.priority - b.priority)
    log.red('刷新插件优先级排序')
  }, 1500)
}

/**
 * 重载Event类插件
 * @param {'Event'|'groupAdmin'} type
 * @param {*} isWatch 是否监听
 * @returns 重载js个数
 */
async function reloadEvents(type, isWatch = true) {
  const _JSs = file.readdirSync(Path[type], { type: '.js' })
  _JSs.forEach(_JS => {
    import(`file:///${Path[type]}/${_JS}`).catch(err => log.error(err))
    JSs.push(_JS)
  })
  if (isWatch) {
    _JSs.forEach(_JS => {
      const watch = Data.watch(Path.get(type, _JS), (path) => {
        log.whiteblod(`修改${type}插件${Path.basename(path)}`)
        import(`file:///${path}?${Date.now()}`).catch(err => log.error(err))
      })
      watcher[_JS] = watch
    })
  }
  return _JSs.length
}