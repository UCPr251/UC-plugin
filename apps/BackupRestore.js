import { Path, Data, Check, file, common, log, UCDate, UCPr } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import { spawn } from 'child_process'

const _backupPath = Path.get('data', 'backup')

export default class UCBackupRestore extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-BackupRestore',
      dsc: '备份与还原数据',
      rule: [
        {
          reg: /^#?UC备份数据$/i,
          fnc: 'backup'
        },
        {
          reg: /^#?UC(还原|恢复|回档)备份(数据)?$/i,
          fnc: 'restore'
        },
        {
          reg: /^#?UC删除备份(数据)?(((\d{2}|\d{4})(-|年))?\d{1,2}(-|月)\d{1,2})?$/i,
          fnc: 'unlink'
        }
      ]
    })
    this.errorInfo = []
    this.backed = []
    this.uninstalled = []
  }

  async backup() {
    if (!this.GM) return false
    const folderName = UCDate.today
    this.backupPath = Path.join(_backupPath, folderName)
    if (Check.folder(this.backupPath)) return this.reply('今日已备份，若需重新备份请先删除原今日备份数据：\n#UC删除备份' + folderName)
    await this.reply('开始备份云崽数据，备份期间机器人不可用，备份时长视文件数量而定，请关注控制台')
    await common.sleep(1)
    try {
      await this.backupYunzai()
      await this.backupPlugins()
      await this.backupExtra()
    } catch (err) {
      const errInfo = log.error('备份云崽数据失败', err)
      return this.reply(errInfo)
    }
    const replyMsg = ['云崽数据备份完成', '已备份本体：config、data、example']
    replyMsg.push(...this.errorInfo, '备份的插件数据：', ...Data.makeArrStr(this.backed, { chunkSize: 20 }))
    replyMsg.push(`备份数据位于UC-plugin/data/backup/${folderName}/内\n请自行留存\n还原：#UC还原备份\n删除：#UC删除备份`)
    const title = '备份完成，请查看备份数据'
    const reply = await common.makeForwardMsg(this.e, replyMsg, title)
    return this.reply(reply)
  }

  async backupYunzai() {
    log.red('开始备份云崽本体数据')
    log.purple('备份' + Path.botOriConfig)
    await this.copyDir(Path.botOriConfig, Path.join(this.backupPath, 'config'), UCPr.BackupRestore.removeDirectory)
    log.purple('备份' + Path.botData)
    await this.copyDir(Path.botData, Path.join(this.backupPath, 'data'), UCPr.BackupRestore.removeDirectory)
    log.purple('备份' + Path.example)
    await this.copyDir(Path.example, Path.join(this.backupPath, 'plugins', 'example'), UCPr.BackupRestore.removeDirectory)
    log.red('云崽本体数据备份完成')
  }

  async backupPlugins() {
    log.red('开始备份云崽插件数据')
    const plugins = file.readdirSync(Path.plugins, { type: 'Directory', removes: ['exmaple', 'system', 'other', 'bin', 'temp'] })
    for (const plugin of plugins) {
      const pluginPath = Path.join(Path.plugins, plugin)
      const backupPluginPath = Path.join(this.backupPath, 'plugins', plugin)
      for (const dir of UCPr.BackupRestore.Directory) {
        if (plugin.endsWith('Admin')) continue
        const pluginDirPath = Path.join(pluginPath, dir)
        if (file.existsSync(pluginDirPath)) {
          log.purple('备份' + pluginDirPath)
          await this.copyDir(pluginDirPath, Path.join(backupPluginPath, dir), plugin === 'UC-plugin' ? [...UCPr.BackupRestore.removeDirectory, 'backup'] : UCPr.BackupRestore.removeDirectory)
          this.backed.push(`${plugin}/${dir}`)
        }
      }
    }
    log.red('云崽插件数据备份完成')
  }

  async backupExtra() {
    const paths = (UCPr.BackupRestore.extra).filter(Boolean)
    if (!paths.length) return false
    log.red('开始备份额外数据')
    for (const extra of paths) {
      if (extra.includes('UC-plugin')) continue
      const source = Path.get('_path', extra)
      if (!file.existsSync(source)) continue
      const target = Path.join(this.backupPath, extra)
      log.purple('备份' + source)
      await this.copyDir(source, target)
      this.backed.push(extra)
    }
    log.red('额外数据备份完成')
  }

  async restore() {
    if (!this.GM) return false
    const backups = file.readdirSync(_backupPath, { type: 'Directory', removes: '.git' })
    if (!backups.length) return this.reply('请先备份或将由UC插件备份的数据置于UC-plugin/data/backup后重试')
    this.e.data = {
      fnc: '_restore',
      list: backups
    }
    this.setUCcontext()
    return this.reply('请选择要还原的备份数据日期：\n' + Data.makeArrStr(backups))
  }

  async _restore([folderName]) {
    this.backupPath = Path.join(_backupPath, folderName)
    await this.reply('开始还原云崽数据，还原期间机器人不可用，还原时长视文件数量而定，请关注控制台')
    await common.sleep(1)
    try {
      await this.restoreData()
    } catch (err) {
      const errInfo = log.error('还原云崽数据失败', err)
      return this.reply(errInfo)
    }
    const replyMsg = ['云崽数据成功还原至：' + folderName, ...this.errorInfo, '\n已还原本体：config、data、example和各插件数据等']
    this.uninstalled.length && replyMsg.push('未安装无法还原的插件：', Data.makeArrStr(this.uninstalled))
    return this.reply(replyMsg.join('\n'))
  }

  async restoreData() {
    log.red('开始还原云崽数据')
    const plugins = file.readdirSync(Path.join(this.backupPath, 'plugins'), { type: 'Directory' })
    for (const plugin of plugins) {
      const pluginPath = Path.join(Path.plugins, plugin)
      if (!file.existsSync(pluginPath)) {
        this.uninstalled.push(plugin)
      }
    }
    await this.copyDir(this.backupPath, Path._path)
    log.red('云崽插件数据还原完成')
  }

  unlink() {
    const backups = file.readdirSync(_backupPath, { type: 'Directory', removes: '.git' })
    if (!backups.length) return this.reply('本地没有备份数据，请先#UC备份数据')
    const date = UCDate.getFormatedDate(this.msg)
    if (date) {
      if (!backups.includes(date)) return this.reply(`本地没有${date}的备份数据`)
      return this._unlink([date])
    }
    this.e.data = {
      fnc: '_unlink',
      list: backups
    }
    this.setUCcontext()
    return this.reply('请选择要删除的备份数据日期：\n' + Data.makeArrStr(backups))
  }

  _unlink(foldersName) {
    foldersName.forEach(folderName => file.unlinkFilesRecursively(Path.join(_backupPath, folderName)))
    return this.reply('已删除备份数据：\n' + Data.makeArrStr(foldersName))
  }

  async copyFile(source, target) {
    return new Promise((resolve, reject) => {
      const rd = file.createReadStream(source)
      rd.on('error', reject)
      const wr = file.createWriteStream(target)
      wr.on('error', reject)
      wr.on('finish', resolve)
      rd.pipe(wr)
    }).catch(error => {
      this.errorInfo.push(log.error(`复制${source}至${target}失败`, error))
    })
  }

  async copyDir(sourceDir, targetDir, removes = []) {
    if (file.isFile(sourceDir)) return this.copyFile(sourceDir, targetDir)
    if (!file.existsSync(targetDir)) file.mkdirSync(targetDir, { recursive: true })
    const files = await file.promises.readdir(sourceDir)
    for (const _file of files) {
      const srcPath = Path.join(sourceDir, _file)
      const tgtPath = Path.join(targetDir, _file)
      const stats = await file.promises.stat(srcPath)
      if (stats.isFile()) {
        await this.copyFile(srcPath, tgtPath)
      } else if (stats.isDirectory()) {
        if (removes.includes(_file)) continue
        await this.copyDir(srcPath, tgtPath, removes)
        log.white('复制目录' + srcPath)
      }
    }
  }

}

Data.loadTask({
  cron: UCPr.BackupRestore.cron,
  name: 'autoBackup',
  fnc: () => {
    if (!UCPr.BackupRestore.autoBackup) return
    const today = UCDate.today
    log.red(today + '自动备份开始')
    const child = spawn('node', ['BackupRestore.js'], { cwd: Path.tools })
    child.stdout.on('data', (data) => {
      log.purple(common.toString(data).trim?.())
    })
    child.stderr.on('data', (data) => {
      const errInfo = log.error(today + '自动备份失败', data)
      common.sendMsgTo(UCPr.GlobalMaster[0], errInfo, 'Friend')
    })
    child.on('exit', (code) => {
      log.red(today + `自动备份结束，退出码${code}：${['正常退出', '路径错误', '备份过程中发生错误', '还原过程中发生错误', '异常退出'][code]}`)
    })
    child.stdin.write('1\n', () => child.stdin.write('end\n'))
  }
})

Data.loadTask({
  cron: '0 1 0 * * ?',
  name: 'autoClearBackup',
  fnc: () => {
    if (!UCPr.BackupRestore.retentionDays) return
    const getDates = (n) => {
      const dates = []
      for (let i = 0; i <= n; i++) {
        dates.push(UCDate.calculateDDL(-i))
      }
      return dates
    }
    const dates = getDates(UCPr.BackupRestore.retentionDays)
    log.red(dates)
    const dateReg = /\d{4}-\d{2}-\d{2}/
    const backups = file.readdirSync(_backupPath, { type: 'Directory' }).filter(b => dateReg.test(b))
    const toDel = backups.filter(b => !dates.includes(b))
    if (!toDel.length) return
    log.red('开始清理过期备份数据：' + toDel.join('，'))
    toDel.forEach(folderName => file.unlinkFilesRecursively(Path.join(_backupPath, folderName)))
    log.red('过期备份数据清理完毕')
  }
})