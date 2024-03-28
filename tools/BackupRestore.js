import path from 'path'
import chalk from 'chalk'
import { log } from 'console'
import readline from 'readline'

// 请保证此脚本在以UC-plugin/tools/为工作目录的情况下运行

process.exitCode = 0 // 正常退出
process.exitCode = 1 // 路径错误
process.exitCode = 2 // 备份过程中发生错误
process.exitCode = 3 // 还原过程中发生错误
process.exitCode = 4 // 异常退出

const red = chalk.rgb(251, 50, 50)
log.red = (...args) => log(red(...args))
const yellow = chalk.rgb(255, 220, 20)
log.yellow = (...args) => log(yellow(...args))
const purple = chalk.rgb(180, 110, 255)
log.purple = (...args) => log(purple(...args))
log.error = (...args) => console.error(red(...args))

const file = await import('../components/file.js').then((module) => module.default).catch((err) => { log.error('file.js导入失败：\n', err); process.exit(1) })
const UCDate = await import('../components/UCDate.js').then((module) => module.default).catch((err) => { log.error('UCDate.js导入失败：\n', err); process.exit(1) })
const Path = await import('../components/Path.js').then((module) => module.createPath(path.resolve(process.cwd(), '..', '..', '..'))).catch((err) => { log.error('Path.js导入失败：\n', err); process.exit(1) })

if (!file.existsSync(Path.UC)) {
  log.error('错误路径')
  process.exit(1)
}

const UCPr = { ...file.YAMLreader(Path.get('defSet', 'config.yaml')), ...file.YAMLreader(Path.configyaml) }

const _backupPath = Path.get('data', 'backup')

/** 交互实例 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

/** 展示选项 */
function displayMenu(options, info = '') {
  log('\n请选择' + info)
  log('\n\tend：结束')
  log('\t0：返回')
  options.forEach((v, index) => log.yellow(`\t${index + 1}：${v}`))
}

/** 处理选择操作项 */
async function handleChoice(choice) {
  if (choice.toLowerCase() === 'e' || choice.toLowerCase() === 'end') {
    log('\n拜拜!\n')
    process.exit(0)
  }
  choice = parseInt(choice)
  if (choice === 0) {
    return main()
  } else if (choice === 1) {
    const folderName = UCDate.today
    if (file.existsSync(Path.join(_backupPath, folderName))) {
      log(`\n今日(${purple(folderName)})已备份，若需重新备份请先${purple('删除原今日备份数据')}`)
      return rl.question(`\n请输入选项${purple('序号')}：`, handleChoice)
    }
    await backup(folderName)
    return main()
  } else if (choice === 2 || choice === 3) {
    const backups = file.readdirSync(_backupPath, { type: 'Directory', removes: '.git' })
    if (!backups.length) {
      log.red('\n请先备份或将由UC插件备份的数据置于UC-plugin/data/backup后重试')
      return rl.question(`\n请输入选项${purple('序号')}：`, handleChoice)
    }
    displayMenu(backups, `要${red(choice === 2 ? '还原' : '删除')}的备份数据日期`)
    return rl.question(`\n请输入选项${purple('序号')}：`, (_choice) => chooseFolder(_choice, backups, choice === 2 ? 'restore' : 'unlink'))
  }
  return rl.question(`\n请输入正确的选项${purple('序号')}：`, handleChoice)
}

/** 处理选择文件夹 */
async function chooseFolder(choice, backups, type) {
  if (choice.toLowerCase() === 'e' || choice.toLowerCase() === 'end') {
    log('\n拜拜!\n')
    process.exit(0)
  }
  choice = parseInt(choice)
  if (choice === 0) {
    return main()
  }
  if (isNaN(choice) || choice < 1 || choice > backups.length) {
    return rl.question(`\n请输入正确的选项${purple('序号')}：`, (choice) => chooseFolder(choice, backups, type))
  }
  if (type === 'restore') {
    await restore(backups[choice - 1])
  } else if (type === 'unlink') {
    unlink(backups[choice - 1])
  }
  main()
}

/** 备份 */
async function backup(folderName) {
  log('\n开始备份：' + purple(folderName))
  const backupPath = Path.join(_backupPath, folderName)
  try {
    await backupYunzai(backupPath)
    await backupPlugins(backupPath)
    await backupExtra(backupPath)
  } catch (err) {
    log.error('\n备份云崽数据失败：\n', err)
    return process.exit(2)
  }
  log(`\n备份${purple(folderName)}成功！\n备份数据位于${purple(`UC-plugin/data/backup/${folderName}`)}/内\n请自行留存`)
}

/** 备份云崽本体数据 */
async function backupYunzai(backupPath) {
  log.red('\n开始备份云崽本体数据')
  log.purple('备份' + Path.botOriConfig)
  await copyDir(Path.botOriConfig, Path.join(backupPath, 'config'), UCPr.BackupRestore.removeDirectory)
  log.purple('备份' + Path.botData)
  await copyDir(Path.botData, Path.join(backupPath, 'data'), UCPr.BackupRestore.removeDirectory)
  log.purple('备份' + Path.example)
  await copyDir(Path.example, Path.join(backupPath, 'plugins', 'example'), UCPr.BackupRestore.removeDirectory)
  log.red('云崽本体数据备份完成')
}

/** 备份云崽插件数据 */
async function backupPlugins(backupPath) {
  log.red('\n开始备份云崽插件数据')
  const plugins = file.readdirSync(Path.plugins, { type: 'Directory', removes: ['exmaple', 'system', 'other', 'bin', 'temp'] })
  for (const plugin of plugins) {
    const pluginPath = Path.join(Path.plugins, plugin)
    const backupPluginPath = Path.join(backupPath, 'plugins', plugin)
    for (const dir of UCPr.BackupRestore.Directory) {
      if (dir === 'data' && plugin.endsWith('Admin')) continue
      const pluginDirPath = Path.join(pluginPath, dir)
      if (file.existsSync(pluginDirPath)) {
        log.purple('备份' + pluginDirPath)
        await copyDir(pluginDirPath, Path.join(backupPluginPath, dir), plugin === 'UC-plugin' ? [...UCPr.BackupRestore.removeDirectory, 'backup'] : UCPr.BackupRestore.removeDirectory)
      }
    }
  }
  log.red('云崽插件数据备份完成')
}

async function backupExtra(backupPath) {
  const paths = (UCPr.BackupRestore.extra).filter(Boolean)
  if (!paths.length) return false
  log.red('\n开始备份额外数据')
  for (const extra of paths) {
    if (extra.includes('UC-plugin')) continue
    const source = Path.get('_path', extra)
    if (!file.existsSync(source)) continue
    const target = Path.join(backupPath, extra)
    log.purple('备份' + source)
    await copyDir(source, target, UCPr.BackupRestore.removeDirectory)
  }
  log.red('额外数据备份完成')
}

/** 还原云崽 */
async function restore(folderName) {
  log.red('\n开始还原云崽数据为：' + folderName)
  const backupPath = Path.join(_backupPath, folderName)
  const uninstalled = []
  const plugins = file.readdirSync(Path.join(backupPath, 'plugins'), { type: 'Directory' })
  for (const plugin of plugins) {
    const pluginPath = Path.join(Path.plugins, plugin)
    if (!file.existsSync(pluginPath)) {
      uninstalled.push(plugin)
    }
  }
  await copyDir(backupPath, Path._path)
  uninstalled.length && log.purple(yellow('\n未安装的插件：\n') + uninstalled.join('\n'))
  log.red('\n云崽数据成功还原至：' + folderName)
}

async function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    const rd = file.createReadStream(source)
    rd.on('error', reject)
    const wr = file.createWriteStream(target)
    wr.on('error', reject)
    wr.on('finish', resolve)
    rd.pipe(wr)
  }).catch(error => {
    log.error(`复制${source}至${target}失败`)
    log.error(error)
  })
}

async function copyDir(sourceDir, targetDir, removes = []) {
  if (file.isFile(sourceDir)) return copyFile(sourceDir, targetDir)
  if (!file.existsSync(targetDir)) file.mkdirSync(targetDir, { recursive: true })
  const files = await file.promises.readdir(sourceDir)
  for (const _file of files) {
    const srcPath = Path.join(sourceDir, _file)
    const tgtPath = Path.join(targetDir, _file)
    const stats = await file.promises.stat(srcPath)
    if (stats.isFile()) {
      await copyFile(srcPath, tgtPath)
    } else if (stats.isDirectory()) {
      if (removes.includes(_file)) continue
      await copyDir(srcPath, tgtPath, removes)
      log('复制目录' + srcPath)
    }
  }
}

/** 删除备份数据 */
function unlink(folderName) {
  log.red('\n开始删除备份数据：' + folderName)
  file.unlinkFilesRecursively(Path.join(_backupPath, folderName))
  log.red('\n成功删除备份数据：' + folderName)
}

/** 程序入口 */
function main() {
  displayMenu(['备份数据', '还原备份', '删除备份'], red('操作项'))
  rl.question(`\n请输入选项${purple('序号')}：`, handleChoice)
}

console.clear()
process.stdout.write('\x1b]2;UC离线备份、还原工具\x1b\x5c')
log.red('\n欢迎使用UC离线备份、还原云崽数据工具\n')

main()