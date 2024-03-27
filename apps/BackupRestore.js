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
  }

  async backup() {
    if (!this.GM) return false
    const folderName = UCDate.today
    this.backupPath = Path.join(_backupPath, folderName)
    if (Check.folder(this.backupPath)) return this.reply('今日已备份，若需重新备份请先删除原今日备份数据：\n#UC删除备份')
    await this.reply('开始备份云崽数据，备份期间机器人不可用，备份时长视文件数量而定，请关注控制台')
    await common.sleep(1)
    let backed
    try {
      this.backupYunzaiData()
      backed = this.backupPluginsData()
    } catch (err) {
      const errInfo = log.error('备份云崽数据失败', err)
      return this.reply(errInfo)
    }
    const replyMsg = ['云崽数据备份完成', '已备份本体：config、data、example']
    replyMsg.push('备份的插件数据：', ...Data.makeArrStr(backed, { chunkSize: 20 }))
    replyMsg.push(`备份数据位于UC-plugin/data/backup/${folderName}/内\n请自行留存\n还原：#UC还原备份\n删除：#UC删除备份`)
    const title = '备份完成，请查看备份数据'
    const reply = await common.makeForwardMsg(this.e, replyMsg, title)
    return this.reply(reply)
  }

  backupYunzaiData() {
    log.red('开始备份云崽本体数据')
    log.purple('备份' + Path.botConfig)
    file.copyFolderRecursively(Path.botConfig, Path.join(this.backupPath, 'config', 'config'))
    log.purple('备份' + Path.get('_path', 'data'))
    file.copyFolderRecursively(Path.get('_path', 'data'), Path.join(this.backupPath, 'data'))
    log.purple('备份' + Path.example)
    file.copyFolderRecursively(Path.example, Path.join(this.backupPath, 'plugins', 'example'))
    log.red('云崽本体数据备份完成')
  }

  backupPluginsData() {
    log.red('开始备份云崽插件数据')
    const plugins = file.readdirSync(Path.plugins, { type: 'Directory', removes: ['exmaple', 'system', 'other', 'bin', 'temp'] })
    const backed = []
    for (const plugin of plugins) {
      const pluginPath = Path.join(Path.plugins, plugin)
      const pluginConfigPath = Path.join(pluginPath, 'config')
      const backupPluginPath = Path.join(this.backupPath, 'plugins', plugin)
      if (Check.folder(pluginConfigPath)) {
        log.purple('备份' + pluginConfigPath)
        file.copyFolderRecursively(pluginConfigPath, Path.join(backupPluginPath, 'config'))
        backed.push(plugin + '/config')
      }
      const pluginDataPath = Path.join(pluginPath, 'data')
      if (Check.folder(pluginDataPath)) {
        if (plugin.endsWith('Admin')) continue
        log.purple('备份' + pluginDataPath)
        file.copyFolderRecursively(pluginDataPath, Path.join(backupPluginPath, 'data'), plugin === 'UC-plugin' ? ['backup'] : [], ['.git'])
        backed.push(plugin + '/data')
      }
    }
    log.red('云崽插件数据备份完成')
    return backed
  }

  async restore() {
    if (!this.GM) return false
    const backups = file.readdirSync(_backupPath, { type: 'Directory' })
    if (!backups.length) return this.reply('请先备份或将由UC插件备份的数据置于UC-plugin/data/backup后重试')
    if (backups.length === 1) return this._restore(backups)
    this.e.data = {
      fnc: '_restore',
      list: backups
    }
    this.setUCcontext()
    return this.reply('请选择要还原的备份数据日期：\n' + Data.makeArrStr(backups, { length: 2000 }))
  }

  async _restore([folderName]) {
    this.backupPath = Path.join(_backupPath, folderName)
    await this.reply('开始还原云崽数据，还原期间机器人不可用，还原时长视文件数量而定，请关注控制台')
    await common.sleep(1)
    let restored, uninstalled
    try {
      this.restoreYunzaiData();
      [restored, uninstalled] = this.restorePluginsData()
    } catch (err) {
      const errInfo = log.error('还原云崽数据失败', err)
      return this.reply(errInfo)
    }
    const replyMsg = ['云崽数据成功还原至：' + folderName, '已还原本体：config、data、example']
    uninstalled.length && replyMsg.push('未安装的插件：', ...Data.makeArrStr(uninstalled, { chunkSize: 20 }))
    replyMsg.push('还原的插件数据：')
    replyMsg.push(...Data.makeArrStr(restored, { chunkSize: 20 }))
    replyMsg.push('建议重启以应用还原的数据')
    const title = '还原完成，请查看还原数据'
    const reply = await common.makeForwardMsg(this.e, replyMsg, title)
    return this.reply(reply)
  }

  restoreYunzaiData() {
    log.red('开始还原云崽本体数据')
    log.purple('还原' + Path.botConfig)
    file.copyFolderRecursively(Path.join(this.backupPath, 'config', 'config'), Path.botConfig)
    log.purple('还原' + Path.get('_path', 'data'))
    file.copyFolderRecursively(Path.join(this.backupPath, 'data'), Path.get('_path', 'data'))
    log.purple('还原' + Path.example)
    file.copyFolderRecursively(Path.join(this.backupPath, 'plugins', 'example'), Path.example)
    log.red('云崽本体数据还原完成')
  }

  restorePluginsData() {
    log.red('开始还原云崽插件数据')
    const plugins = file.readdirSync(Path.join(this.backupPath, 'plugins'), { type: 'Directory' })
    const restored = []
    const uninstalled = []
    for (const plugin of plugins) {
      const pluginPath = Path.join(Path.plugins, plugin)
      if (!Check.folder(pluginPath)) {
        uninstalled.push(plugin)
        continue
      }
      const backupPluginPath = Path.join(this.backupPath, 'plugins', plugin)
      const backupConfigPath = Path.join(backupPluginPath, 'config')
      if (Check.folder(backupConfigPath)) {
        const pluginConfigPath = Path.join(pluginPath, 'config')
        log.purple('还原' + pluginConfigPath)
        file.copyFolderRecursively(backupConfigPath, pluginConfigPath)
        restored.push(plugin + '/config')
      }
      const backupDataPath = Path.join(backupPluginPath, 'data')
      if (Check.folder(backupDataPath)) {
        const pluginDataPath = Path.join(pluginPath, 'data')
        log.purple('还原' + pluginDataPath)
        file.copyFolderRecursively(backupDataPath, pluginDataPath, [], ['.git'])
        restored.push(plugin + '/data')
      }
    }
    log.red('云崽插件数据还原完成')
    return [restored, uninstalled]
  }

  unlink() {
    const backups = file.readdirSync(_backupPath, { type: 'Directory' })
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
    return this.reply('请选择要删除的备份数据日期：\n' + Data.makeArrStr(backups, { length: 3000 }))
  }

  _unlink(foldersName) {
    foldersName.forEach(folderName => file.unlinkFilesRecursively(Path.join(_backupPath, folderName)))
    return this.reply('已删除备份数据：\n' + Data.makeArrStr(foldersName))
  }

}

Data.loadTask({
  cron: '0 59 23 * * *',
  name: 'autoBackup',
  fnc: () => {
    if (!UCPr.autoBackup) return
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
      log.red(today + `自动备份结束，退出码${code}：${['正常退出', '路径错误', '备份过程中发生错误'][code]}`)
    })
    child.stdin.write('1\n', () => child.stdin.write('end\n'))
  }
})