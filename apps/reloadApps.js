import { Path, Check, file, UCPr, log, Data, common } from '../components/index.js'
import loader from '../../../lib/plugins/loader.js'
import _ from 'lodash'

let apps = [], tasks = {}, watcher = {}, timer

export default class UCReloadApps extends plugin {
  constructor() {
    super({
      name: 'UC-reloadApps',
      dsc: '重载UC插件',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?UC(一|总)览$/i,
          fnc: 'generalView'
        },
        {
          reg: /^#?UC功能$/i,
          fnc: 'apps'
        },
        {
          reg: /^#?UC定时任务$/i,
          fnc: 'tasks'
        },
        {
          reg: /^#?UC监听项$/i,
          fnc: 'watcher'
        },
        {
          reg: /^#?UC系统载入$/i,
          fnc: 'viewloader'
        }
      ]
    })
    this.redisData = '[UC]reloadPlugins'
  }

  async init(mode) {
    if (mode || UCPr.config.isWatch) {
      const _apps = file.readdirSync(Path.apps, { type: '.js', removes: 'reloadApps.js' })
      for (const app of _apps) {
        const appPath = Path.join(Path.apps, app)
        await loadApp(appPath)
        apps.push(app)
        const watch = Data.watch(appPath, reloadApp.bind(loader, appPath))
        watcher[app] = watch
      }
      const watch = await Data.watchDir(Path.apps, async (newAppPath) => {
        const jsName = Path.basename(newAppPath)
        log.yellow('新增插件：' + jsName)
        await loadApp(newAppPath)
        apps.push(jsName)
        const watch = Data.watch(newAppPath, reloadApp.bind(loader, newAppPath))
        watcher[jsName] = watch
        await common.sleep(500)
      })
      watch.on('unlink', (delAppPath) => {
        const jsName = Path.basename(delAppPath)
        log.yellow('删除插件：' + jsName)
        delApp(delAppPath)
        delTask(jsName)
        watcher[jsName].close()
        delete watcher[jsName]
        Data.remove(apps, jsName)
      })
      const plugins = loader.priority.map(v => v.name).filter(name => name.startsWith('UC'))
      plugins.forEach(name => log.yellow(name))
      log.red(`总计载入UC插件${plugins.length}项功能`)
    }
  }

  async generalView(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    if (!UCPr.config.isWatch) return e.reply('当前非开发环境')
    let msg = '【UC开发环境总览】\n'
    msg += `总计载入${apps.length + 1}个功能\n`
    msg += `总计载入${Object.keys(tasks).length}个定时任务\n`
    msg += `总计监听${Object.keys(watcher).length}个js\n`
    msg += `Bot总计${loader.priority.length}个插件`
    log.yellow(msg)
    return e.reply(msg)
  }

  async apps(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    const msg = apps.join('\n')
    log.yellow(msg)
    log.red(`总计${apps.length}个功能`)
  }

  async tasks(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    const msg = Object.keys(tasks).join('\n')
    log.yellow(msg)
    log.red(`总计${Object.keys(tasks).length}个定时任务`)
  }

  async watcher(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    const msg = Object.keys(watcher).join('\n')
    log.yellow(msg)
    log.red(`总计监听${Object.keys(watcher).length}个js`)
  }

  async viewloader(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    const names = loader.priority.map(v => v.name)
    names.forEach(name => log.yellow(name))
    log.red(`Bot总计：${loader.priority.length}个插件`)
  }

}

async function loadApp(appPath) {
  const temp = await import(`file:///${appPath}?${Date.now()}`)
  const app = temp.default ?? temp[Object.keys(temp)[0]]
  const plugin = new app()
  log.purple('[载入插件]' + '名称：' + plugin.name ?? '无', '优先级：' + plugin.priority ?? '无')
  if (plugin.task.name) {
    const jsName = Path.basename(appPath)
    delete tasks[jsName]
    const newTak = Data.reLoadTask(plugin)
    const taskName = plugin.task.name ?? plugin.name
    log.blue('[载入定时任务]' + taskName)
    tasks[jsName] = {
      name: taskName,
      job: newTak.job
    }
  }
  plugin.init && plugin.init()
  loader.priority.push({
    class: app,
    key: Path.Plugin_Name,
    name: plugin.name,
    priority: plugin.priority
  })
  order()
}

function delApp(appPath) {
  const name = 'UC-' + Path.parse(appPath).name
  const del = Data.remove(loader.priority, name, 'name')[0]
  if (del) log.purple('[卸载插件]' + '名称：' + del.name ?? '无', '优先级：' + del.priority ?? '无')
}

function delTask(jsName) {
  const taskInfo = tasks[jsName]
  if (taskInfo) {
    log.blue('[取消定时任务]' + taskInfo.name)
    taskInfo.job.cancel()
    delete tasks[jsName]
  }
}

async function reloadApp(appPath) {
  delApp(appPath)
  await loadApp(appPath)
}

function order() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    loader.priority = _.orderBy(loader.priority, ['priority'], ['asc'])
    log.red('刷新插件优先级排序')
  }, 3000)
}