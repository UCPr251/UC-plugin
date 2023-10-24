import fs from 'node:fs'
import yaml from 'yaml'
import path from 'node:path'

/** 文件读写 */
const file = {
  /** 读取yaml */
  YAMLreader(_path) {
    return yaml.parse(fs.readFileSync(_path, 'utf8'))
  },

  /** 保存yaml */
  YAMLsaver(_path, newData) {
    return fs.writeFileSync(_path, yaml.stringify(newData), 'utf8')
  },

  /** 读取json */
  JSONreader(_path) {
    return JSON.parse(fs.readFileSync(_path, 'utf8'))
  },

  /** 保存json */
  JSONsaver(_path, newData) {
    return fs.writeFileSync(_path, JSON.stringify(newData, null, 2), 'utf8')
  },

  /**
   * 获取文件夹内文件信息
   * @param {path} _path
   * @param {object} option
   * @param {'.js'|'.yaml'|'.json'} option.type 筛选文件类型
   * @param {boolean} option.basename 只保留文件名
   * @returns {string[]}
   */
  readdirSync(_path, option = {
    type: null,
    basename: false
  }) {
    let files = fs.readdirSync(_path)
    if (option.type) {
      files = files.filter(file => path.extname(file).toLowerCase() === option.type)
    }
    if (option.basename) {
      files = files.map(file => path.parse(file).name)
    }
    return files
  },

  /** 读取文件 */
  readFileSync(_path) {
    return fs.readFileSync(_path, 'utf8')
  },

  /** 写入数据 */
  writeFileSync(_path, data) {
    return fs.writeFileSync(_path, data)
  },

  /** 创建文件夹 */
  mkdirSync(_path, recursive) {
    return fs.mkdirSync(_path, { recursive })
  },

  /** 文件是否存在 */
  existsSync(_path) {
    return fs.existsSync(_path)
  },

  /** 删除文件 */
  unlinkSync(_path) {
    return fs.unlinkSync(_path)
  },

  /** 复制文件 */
  copyFileSync(orlFilePath, targetFilPath) {
    return fs.copyFileSync(orlFilePath, targetFilPath)
  },

  /** 文件信息 */
  lstatSync(_path) {
    return fs.lstatSync(_path)
  },

  /** 创建可读流 */
  createReadStream(_path) {
    return fs.createReadStream(_path)
  },

  /** 创建可写流 */
  createWriteStream(_path) {
    return fs.createWriteStream(_path)
  }
}

export default file