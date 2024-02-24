import fs from 'fs'
import path from 'path'

/**
 * node运行
 * 请保证此脚本在以UC-plugin/tools/为工作目录的情况下运行
 * 一键重命名戳一戳图包
 * 遍历工作目录下的每一个文件夹
 * 以文件夹的名称为名
 * 为此文件夹内的每一个图片自动重命名为：文件夹名称序号.后缀
 * 当文件夹内已经存在此序号的图片时，自增序号重复此操作
 */

const _path = path.resolve(process.cwd(), '..', 'resources', 'unNecRes', 'chuoyichuo')

function rename(charName) {
  const pics = fs.readdirSync(path.join(_path, charName))
  const picNames = pics.map(pic => path.parse(pic).name)
  const reg = new RegExp(`^${charName}\\d+$`)
  const existedNames = picNames.filter(name => reg.test(name))
  const existedNums = existedNames.map(name => parseInt(name.slice(charName.length)))
  let count = 0
  for (const i in pics) {
    const picName = picNames[i]
    if (existedNames.includes(picName)) continue
    const pic = pics[i]
    const filePath = path.join(_path, charName, pic)
    do {
      count++
    } while (existedNums.includes(count))
    const ext = path.parse(pic).ext
    const newPath = path.join(_path, charName, `${charName}${count}${ext}`)
    fs.renameSync(filePath, newPath)
  }
  return [pics.length, existedNames.length]
}

fs.readdirSync(_path).forEach(charName => {
  if (fs.statSync(path.join(_path, charName)).isDirectory()) {
    console.log(`正在重命名文件夹：\x1b[31m${charName}\x1b[0m`)
    const [count, existed] = rename(charName)
    console.log(`重命名完成，共\x1b[33m${count}\x1b[0m个图片，新增\x1b[33m${count - existed}\x1b[0m个图片\n`)
  }
})