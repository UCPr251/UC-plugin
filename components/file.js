import fs from 'node:fs'
import yaml from 'yaml'
import path from 'node:path'

/** 文件读写 */
const file = {
  /** 读取yaml */
  YAMLreader(path) {
    return yaml.parse(fs.readFileSync(path, 'utf8'))
  },

  /** 保存yaml */
  YAMLsaver(path, newData) {
    return fs.writeFileSync(path, yaml.stringify(newData), 'utf8')
  },

  /** 读取json */
  JSONreader(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'))
  },

  /** 保存json */
  JSONsaver(path, newData) {
    return fs.writeFileSync(path, JSON.stringify(newData, null, 2), 'utf8')
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
  readFileSync(path) {
    return fs.readFileSync(path, 'utf8')
  },

  /** 写入数据 */
  writeFileSync(path, data) {
    return fs.writeFileSync(path, data)
  },

  /** 创建文件夹 */
  mkdirSync(path, recursive) {
    return fs.mkdirSync(path, { recursive })
  },

  /** 文件是否存在 */
  existsSync(path) {
    return fs.existsSync(path)
  },

  /** 删除文件 */
  unlinkSync(path) {
    return fs.unlinkSync(path)
  },

  /** 复制文件 */
  copyFileSync(orlFilePath, targetFilPath) {
    return fs.copyFileSync(orlFilePath, targetFilPath)
  },

  /** 文件信息 */
  lstatSync(path) {
    return fs.lstatSync(path)
  },

  /** 创建可读流 */
  createReadStream(path) {
    return fs.createReadStream(path)
  },

  /** 创建可写流 */
  createWriteStream(path) {
    return fs.createWriteStream(path)
  }
}

export default file