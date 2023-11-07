import fs from 'node:fs'
import yaml from 'yaml'
import path from 'node:path'
import _ from 'lodash'

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
   * @param {'.js'|'.yaml'|'.json'|'.txt'|'.epub'} option.type 筛选文件类型
   * @param {boolean} option.basename 只保留文件名
   * @returns {string[]}
   */
  readdirSync(_path, option = {
    type: null,
    basename: false,
    withFileTypes: false
  }) {
    if (!this.existsSync(_path)) return []
    let files = fs.readdirSync(_path, option)
    if (option.type) {
      const type = _.castArray(option.type)
      files = files.filter(file => type.includes(path.extname(file).toLowerCase()))
    }
    if (option.basename) {
      files = files.map(file => path.parse(file).name)
    }
    return files
  },

  /** 读取文件 */
  readFileSync(_path, encoding = 'utf8', flag) {
    return fs.readFileSync(_path, { encoding, flag })
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

  /** (批量)删除文件 */
  unlinkSync(_path, ...filesArr) {
    if (!_.isEmpty(filesArr)) {
      const deleted = []
      filesArr.forEach(_file => {
        const filePath = path.join(_path, _file)
        if (this.existsSync(filePath)) {
          this.unlinkSync(filePath)
          deleted.push(_file)
        }
      })
      return deleted
    }
    return fs.unlinkSync(_path)
  },

  /** 复制文件 */
  copyFileSync(orlFilePath, targetFilPath) {
    return fs.copyFileSync(orlFilePath, targetFilPath)
  },

  /** 符号链接信息 */
  lstatSync(_path) {
    return fs.lstatSync(_path)
  },

  /** 文件信息 */
  statSync(_path) {
    return fs.statSync(_path)
  },

  /** 创建可读流 */
  createReadStream(_path) {
    return fs.createReadStream(_path)
  },

  /** 创建可写流 */
  createWriteStream(_path) {
    return fs.createWriteStream(_path)
  },

  /**
   * 搜索文件并返回文件数据数组，优先排序：匹配度高→文件名短
   * @param {*} dir 搜索根目录
   * @param {string|Array} keywords 关键词
   * @param {string|Array} option.type 文件类型
   * @param {boolean} option.recursive 是否递归查找子文件夹
   * @returns 搜索结果
   */
  searchFiles(dir, keywords, option = {
    type: undefined,
    recursive: false
  }) {
    /** 下标越小匹配度越高 */
    const searchLevelArr = []
    const files = this.readdirSync(dir, option)
    for (const i in keywords) searchLevelArr[i] = []
    const len = keywords.length
    const reg = new RegExp(_.castArray(keywords).join('|'), 'gi')
    for (const _file of files) {
      const filePath = path.join(dir, _file)
      const stats = this.statSync(filePath)
      if (stats.isFile()) {
        const matchLevel = _file.match(reg)?.length
        if (matchLevel) {
          const level = len - matchLevel
          searchLevelArr[level < 0 ? 0 : level].push({
            name: path.parse(_file).name,
            file: _file,
            ext: path.extname(_file),
            path: filePath
          })
        }
      } else if (stats.isDirectory()) {
        if (option.recursive) {
          this.searchFiles(filePath, keywords)
        }
      }
    }
    console.log(_.flatMap(searchLevelArr).length)
    return _.flatMap(searchLevelArr.map(arr => _.sortBy(arr, 'name.length')))
  }

}

export default file