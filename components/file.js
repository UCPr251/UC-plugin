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
   * 获取文件夹内文件名数组
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

  /**
   * (批量)删除文件，返回删除文件name
   * 支持一目录多文件 或 _path多文件路径数组
   */
  unlinkSync(_path, ...filesArr) {
    if (_.isArray(_path)) {
      const deleted = []
      _path.forEach(__path => {
        if (this.existsSync(__path)) {
          deleted.push(this.unlinkSync(__path))
        }
      })
      return deleted
    }
    if (!_.isEmpty(filesArr)) {
      const filesPath = filesArr.map(_file => path.join(_path, _file))
      return this.unlinkSync(filesPath)
    }
    fs.unlinkSync(_path)
    return path.parse(_path).name
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

  /** 格式化目录/文件名 */
  formatFilename(oriName) {
    return oriName.replace(/\\|\/|:|\*|\?|<|>|\|"/g, '')
  },

  /**
   * 搜索文件并返回文件数据数组，优先排序：匹配度高→文件名短
   * @param {string|Array} dirs 搜索根目录
   * @param {string|Array} keywords 关键词
   * @param {string|Array} option.type 文件类型
   * @param {boolean} option.recursive 是否递归查找子文件夹
   * @param {boolean} [isSort=true] 是否排序
   * @returns {Promise<object[]|Array[]>} 搜索结果
   */
  async searchFiles(dirs, keywords, option = {
    type: undefined,
    recursive: false
  }, isSort = true) {
    /** 下标越小匹配度越高 */
    let searchLevelArr = []
    for (const i in keywords) searchLevelArr[i] = []
    const len = keywords.length
    if (option.type) option.type = _.castArray(option.type)
    const reg = new RegExp(_.castArray(keywords).join('|'), 'gi')
    const processFile = async (dir, _file) => {
      const filePath = path.join(dir, _file)
      const stats = await fs.promises.stat(filePath)
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
      } else if (stats.isDirectory() && option.recursive) {
        const results = await this.searchFiles(filePath, keywords, option, false)
        searchLevelArr = _.zipWith(searchLevelArr, results, (a1, a2) => [...a1, ...a2])
      }
    }
    const processDir = async (dir) => {
      let files = await fs.promises.readdir(dir, { withFileTypes: true })
      if (option.type) {
        files = files.filter(file => {
          const ext = path.parse(file.name).ext
          if (ext === '') return true
          if (option.type.includes(ext)) return true
          return false
        })
      }
      const filePromises = files.map((file) => processFile(dir, file.name))
      await Promise.all(filePromises)
    }
    const dirPromises = _.castArray(dirs).map((dir) => processDir(dir))
    await Promise.all(dirPromises)
    if (!isSort) return searchLevelArr
    return _.flatMap(searchLevelArr.map((arr) => _.sortBy(arr, 'name.length')))
  }

}

export default file