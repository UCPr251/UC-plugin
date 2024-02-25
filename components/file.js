import path from 'node:path'
import fs from 'node:fs'
import yaml from 'yaml'
import _ from 'lodash'

/** 文件读写 */
const file = {
  /** 读取yaml */
  YAMLreader(_path, defaultValue = null) {
    if (!_path || !this.existsSync(_path)) return defaultValue
    return yaml.parse(fs.readFileSync(_path, 'utf8'))
  },

  /** 保存yaml */
  YAMLsaver(_path, newData) {
    fs.writeFileSync(_path, yaml.stringify(newData), 'utf8')
    return newData
  },

  /** 读取json */
  JSONreader(_path, defaultValue = null) {
    if (!_path || !this.existsSync(_path)) return defaultValue
    return JSON.parse(fs.readFileSync(_path, 'utf8'))
  },

  /** 保存json */
  JSONsaver(_path, newData) {
    fs.writeFileSync(_path, JSON.stringify(newData, null, 2), 'utf8')
    return newData
  },

  /**
   * 获取文件夹内文件名数组
   * @param {path} _path
   * @param {object} [option]
   * @param {string|Array} [option.removes] 要排除的文件的全名
   * @param {boolean} [option.withFileTypes] 同时读取文件types，true则不会筛选类型或只保留文件名
   * @param {'.js'|'.yaml'|'.json'|'.txt'|'.epub'|'.png'|'Directory'|'File'} [option.type] 筛选文件类型
   * @param {boolean} [option.basename] 只保留文件名
   * @returns {string[]} 符合要求的文件名数组
   */
  readdirSync(_path, option = {
    type: null,
    basename: false,
    removes: null,
    withFileTypes: false
  }) {
    if (!_path || !this.existsSync(_path)) return []
    let files = fs.readdirSync(_path, option)
    if (option.removes) {
      const removes = _.castArray(option.removes)
      if (option.withFileTypes) {
        removes.forEach(remove => _.remove(files, file => file.name == remove))
      } else {
        removes.forEach(remove => _.remove(files, file => file == remove))
      }
    }
    if (option.withFileTypes) return files
    if (option.type) {
      if (option.type === 'Directory' || option.type === 'File') {
        files = files.filter(_file => this[`is${option.type}`](path.join(_path, _file)))
      } else if (Array.isArray(option.type)) {
        if (option.type.includes('File')) {
          files = files.filter(_file => this.isFile(path.join(_path, _file)))
        }
        files = files.filter(_file => option.type.includes(path.extname(_file).toLowerCase()))
      } else {
        files = files.filter(_file => option.type === path.extname(_file).toLowerCase())
      }
    }
    if (option.basename) {
      files = files.map(_file => path.parse(_file).name)
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

  /** 移动文件 */
  renameSync(oriFilePath, targetFilePath) {
    return fs.renameSync(oriFilePath, targetFilePath)
  },

  /** 创建文件夹 */
  mkdirSync(_path, recursive) {
    return fs.mkdirSync(_path, { recursive })
  },

  /** 文件是否存在 */
  existsSync(_path) {
    return fs.existsSync(_path)
  },

  /** 路径是否是文件夹 */
  isDirectory(_path) {
    return fs.lstatSync(_path).isDirectory()
  },

  /** 路径是否是文件 */
  isFile(_path) {
    return fs.lstatSync(_path).isFile()
  },

  unlink(_path) {
    return fs.unlink(_path, (err) => {
      if (err) throw err
    })
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
    if (file.existsSync(_path)) {
      try {
        fs.unlinkSync(_path)
      } catch (err) {
        log.error(err)
      }
    }
    return path.parse(_path).name
  },

  unlinkFilesRecursively(dir, removes = [], glbalRemoves = []) {
    const files = file.readdirSync(dir, { withFileTypes: true })
    for (const _file of files) {
      const currentPath = path.join(dir, _file.name)
      if (_file.isDirectory()) {
        if (removes.includes(_file.name)) continue
        if (glbalRemoves.includes(_file.name)) continue
        this.unlinkFilesRecursively(currentPath, [], glbalRemoves)
      } else {
        fs.unlinkSync(currentPath)
      }
    }
    try { fs.rmdirSync(dir) } catch (e) { }
  },

  /** 递归复制文件夹 */
  copyFolderRecursively(orlFilePath, targetFilePath, removes = [], glbalRemoves = []) {
    fs.mkdirSync(targetFilePath, { recursive: true })
    fs.readdirSync(orlFilePath).forEach(element => {
      if (this.isFile(path.join(orlFilePath, element))) {
        fs.copyFileSync(path.join(orlFilePath, element), path.join(targetFilePath, element))
      } else {
        if (removes.includes(element)) return
        if (glbalRemoves.includes(element)) return
        this.copyFolderRecursively(path.join(orlFilePath, element), path.join(targetFilePath, element), [], glbalRemoves)
      }
    })
  },

  /** 复制文件 */
  copyFileSync(orlFilePath, targetFilePath) {
    return fs.copyFileSync(orlFilePath, targetFilePath)
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
    keywords = _.castArray(keywords)
    for (const i in keywords) searchLevelArr[i] = []
    const len = keywords.length
    option.type &&= _.castArray(option.type)
    const reg = new RegExp(keywords.join('|'), 'gi')
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
        files = files.filter(_file => {
          const ext = path.parse(_file.name).ext
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