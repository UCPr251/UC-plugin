import path from 'path'
import chalk from 'chalk'
import { log } from 'console'
import readline from 'readline'

// 请保证此文件在UC插件根目录下运行

process.exitCode = 0 // 正常退出
process.exitCode = 1 // 路径错误
process.exitCode = 2 // 备份过程中发生错误
process.exitCode = 3 // 试图还原但不存在备份数据
process.exitCode = 4 // 还原过程中发生错误

const red = chalk.rgb(251, 50, 50)
log.red = (...args) => log(red(...args))
const yellow = chalk.rgb(255, 220, 20)
log.yellow = (...args) => log(yellow(...args))
const purple = chalk.rgb(180, 110, 255)
log.purple = (...args) => log(purple(...args))

const file = await import('./components/file.js').then((module) => module.default).catch((err) => { log.red('file.js导入失败：', err.message); process.exit(1) })
const UCDate = await import('./components/UCDate.js').then((module) => module.default).catch((err) => { log.red('UCDate.js导入失败：', err.message); process.exit(1) })
const Path = await import('./components/Path.js').then((module) => module.getPath(path.resolve(process.cwd(), '..', '..'))).catch((err) => { log.red('Path.js导入失败：', err.message); process.exit(1) })

if (!file.existsSync(Path.UC)) {
  log.red('错误路径')
  process.exit(1)
}

const _backupPath = Path.get('data', 'backup')

/** 交互实例 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

/** 展示选项 */
function displayMenu(options) {
  log('请选择')
  options.forEach((v, index) => log.yellow(`${index + 1}、${v}`))
}

/** 处理选择操作项 */
function handleChoice(choice) {
  choice = parseInt(choice)
  if (choice === 1) {
    const folderName = UCDate.today
    if (file.existsSync(Path.join(_backupPath, folderName))) {
      log(`今日(${purple(folderName)})已备份，若需重新备份请先删除原今日备份数据`)
      process.exit(0)
    }
    log('开始进行备份：' + purple(folderName))
    backup(folderName)
  } else if (choice === 2) {
    const backups = file.readdirSync(_backupPath, { type: 'Directory' })
    if (!backups.length) {
      log.red('请先备份或将由UC插件备份的数据置于UC-plugin/data/backup后重试')
      process.exit(3)
    }
    if (backups.length === 1) return restore(backups[0])
    log.yellow('存在多个备份数据，请选择要还原的备份数据日期')
    displayMenu(backups)
    rl.question('请输入选项序号：', (choice) => chooseFolder(choice, backups))
  } else if (choice === 3) {
    log('拜拜!')
    process.exit(0)
  } else {
    return rl.question('请输入正确的选项序号：', handleChoice)
  }
  rl.close()
}

/** 处理选择备份文件夹 */
function chooseFolder(choice, backups) {
  choice = parseInt(choice)
  if (isNaN(choice) || choice < 1 || choice > backups.length) {
    return rl.question('请输入正确的选项序号：', (choice) => chooseFolder(choice, backups))
  }
  restore(backups[choice - 1])
}

/** 备份 */
function backup(folderName) {
  const backupPath = Path.join(_backupPath, folderName)
  try {
    backupYunzaiData(backupPath)
    backupPluginsData(backupPath)
  } catch (err) {
    log.red('备份云崽数据失败：' + err.message)
    return process.exit(2)
  }
  log(`备份数据位于${purple(`UC-plugin/data/backup/${folderName}`)}/内\n请自行留存`)
  return true
}

/** 备份云崽本体数据 */
function backupYunzaiData(backupPath) {
  log.red('开始备份云崽本体数据')
  log.purple('备份' + Path.botConfig)
  file.copyFolderRecursively(Path.botConfig, Path.join(backupPath, 'config', 'config'))
  log.purple('备份' + Path.get('_path', 'data'))
  file.copyFolderRecursively(Path.get('_path', 'data'), Path.join(backupPath, 'data'))
  log.red('云崽本体数据备份完成')
}

/** 备份云崽插件数据 */
function backupPluginsData(backupPath) {
  log.red('开始备份云崽插件数据')
  const plugins = file.readdirSync(Path.plugins, { type: 'Directory', removes: ['exmaple', 'system', 'other', 'bin', 'temp'] })
  for (const plugin of plugins) {
    const pluginPath = Path.join(Path.plugins, plugin)
    const pluginConfigPath = Path.join(pluginPath, 'config')
    const backupPluginPath = Path.join(backupPath, 'plugins', plugin)
    if (file.existsSync(pluginConfigPath)) {
      log.purple('备份' + pluginConfigPath)
      file.copyFolderRecursively(pluginConfigPath, Path.join(backupPluginPath, 'config'))
    }
    const pluginDataPath = Path.join(pluginPath, 'data')
    if (file.existsSync(pluginDataPath)) {
      if (plugin.endsWith('Admin')) continue
      log.purple('备份' + pluginDataPath)
      file.copyFolderRecursively(pluginDataPath, Path.join(backupPluginPath, 'data'), plugin === 'UC-plugin' ? ['backup'] : [], ['.git'])
    }
  }
  log.red('云崽插件数据备份完成')
}

/** 还原云崽 */
function restore(folderName) {
  const backupPath = Path.join(_backupPath, folderName)
  let uninstalled
  try {
    restoreYunzaiData(backupPath)
    uninstalled = restorePluginsData(backupPath)
  } catch (err) {
    log.red('还原云崽数据失败：', err.message)
    process.exit(4)
  }
  uninstalled.length && log.purple('未安装的插件：\n', uninstalled.join('\n'))
  log.red('云崽数据成功还原至：' + folderName)
  return process.exit(0)
}

/** 还原云崽本体数据 */
function restoreYunzaiData(backupPath) {
  log.red('开始还原云崽本体数据')
  log.purple('还原' + Path.botConfig)
  file.copyFolderRecursively(Path.join(backupPath, 'config', 'config'), Path.botConfig)
  log.purple('还原' + Path.get('_path', 'data'))
  file.copyFolderRecursively(Path.join(backupPath, 'data'), Path.get('_path', 'data'))
  log.red('云崽本体数据还原完成')
}

/** 还原云崽插件数据 */
function restorePluginsData(backupPath) {
  log.red('开始还原云崽插件数据')
  const plugins = file.readdirSync(Path.join(backupPath, 'plugins'), { type: 'Directory' })
  const uninstalled = []
  for (const plugin of plugins) {
    const pluginPath = Path.join(Path.plugins, plugin)
    if (!file.existsSync(pluginPath)) {
      uninstalled.push(plugin)
      continue
    }
    const backupPluginPath = Path.join(backupPath, 'plugins', plugin)
    const backupConfigPath = Path.join(backupPluginPath, 'config')
    if (file.existsSync(backupConfigPath)) {
      const pluginConfigPath = Path.join(pluginPath, 'config')
      log.purple('还原' + pluginConfigPath)
      file.copyFolderRecursively(backupConfigPath, pluginConfigPath)
    }
    const backupDataPath = Path.join(backupPluginPath, 'data')
    if (file.existsSync(backupDataPath)) {
      const pluginDataPath = Path.join(pluginPath, 'data')
      log.purple('还原' + pluginDataPath)
      file.copyFolderRecursively(backupDataPath, pluginDataPath, [], ['.git'])
    }
  }
  log.red('云崽插件数据还原完成')
  return uninstalled
}

/** 运行 */
function main() {
  displayMenu(['备份', '还原', '退出'])
  rl.question('请输入选项序号：', handleChoice)
}

main()
