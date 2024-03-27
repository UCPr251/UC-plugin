import { file, Path, Data, common, Check, UCDate } from '../../components/index.js'
import Base from './Base.js'

/** 图片管理器 */
export default class ImgManager extends Base {
  constructor(folderPath, thisArg, note) {
    super(folderPath, thisArg, note)
    /** 当前页数 */
    this.nowPage = 0
    /** 当前操作标题 */
    this.title = ''
    /** 全部图片base */
    this.imgs = []
    /** 全部图片path */
    this.imgsPath = []
  }

  static create(folderPath, thisArg, note) {
    return new ImgManager(folderPath, thisArg, note)
  }

  /**
   * 上传文件，对目标文件夹内的文件永远不会执行覆盖操作
   * @param {string} name 文件名，不带ext
   * @param {Object} options 选项
   * @param {boolean} [options.autoRename] 是否自动重命名，关闭后，名称冲突时会放弃操作
   * @param {Function} [options.fnc] 上传完成后额外执行函数
   * @param {string|Array} [options.type] 文件类型，用于筛选防重
   * @param {string|Array} [options.solo] img时仅允许上传一张图片
   * @param {boolean} [options.zip] 是否允许接收zip
   */
  add(name, {
    fnc,
    solo,
    type = 'File',
    zip = true,
    autoRename = true
  } = { type: 'File', zip: true, autoRename: true }) {
    if (!Check.folder(this.folderPath)) return this.reply(`文件夹【${this.folderPath}】不存在，请检查UC资源状态是否正常`)
    if (name && !autoRename) {
      const files = file.readdirSync(this.folderPath, { type, basename: true })
      if (files.includes(name)) return this.reply(`${this.note}图片【${name}】已存在，请勿重复添加哦~`)
    }
    // To do引用添加，直接添加
    if (this.e.source) {

    } else if (this.arg.img) {

    }
    this.reply(`请发送需要上传的${this.note}图片` + (zip ? '或zip压缩包' : ''))
    /** 是否指定图片名称 */
    this.named = !!name
    /** 图片名称 */
    this.name = name || `${this.arg.userId}-${UCDate.NowTimeNum}`
    this.e.data = {
      fnc,
      zip,
      solo,
      autoRename,
      transferFnc: this._add.bind(this)
    }
    this.arg.setUCcontext(this.transferFnc, 300)
  }

  /** 获取图片、压缩包数据 */
  async _add(thisArg, data) {
    thisArg.setFnc = this.transferFnc
    if (thisArg.isCancel()) return
    const { autoRename, fnc, zip, solo } = data
    /** 制作上传结果消息 */
    const makeResultMsg = () => {
      const msg = [`上传${this.note}图片结果`]
      successed.length && msg.push(`成功${successed.length}：\n` + Data.makeArrStr(file.getFilesBase(successed)))
      failed.length && msg.push(`失败${failed.length}：\n` + Data.makeArrStr(failed))
      return msg
    }
    /** 纠正文件名称 */
    const correctName = (basename) => {
      let toPath = Path.join(this.folderPath, basename)
      if (file.existsSync(toPath)) {
        if (autoRename) {
          const { name, ext } = Path.parse(basename)
          let count = 2
          do { toPath = Path.join(this.folderPath, name + (count++ + '') + ext) }
          while (file.existsSync(toPath))
        } else {
          failed.push('图片已存在：' + basename)
          return false
        }
      }
      return toPath
    }
    /** 移动图片至目标文件夹并清理文件 */
    const moveImgFnc = (tempPath) => {
      const files = file.readdirSync(tempPath)
      for (const basename of files) {
        const imgPath = Path.join(tempPath, basename)
        if (file.isDirectory(imgPath)) {
          moveImgFnc(imgPath)
          continue
        }
        const toPath = correctName(basename)
        if (!toPath) continue
        file.renameSync(imgPath, toPath)
        successed.push(toPath)
      }
      file.rmSync(tempPath, { recursive: true })
    }
    /** 成功上传的文件的最终路径 */
    const successed = []
    /** 上传失败的图片、原因 */
    const failed = []
    thisArg.file && log.debug(thisArg.file)
    if (thisArg.img) {
      thisArg.finishUCcontext()
      if (solo) thisArg.img = [thisArg.img[0]]
      if (thisArg.img.length === 1) {
        const result = await Data.download(thisArg.img[0], Path.temp, this.name)
        if (result) {
          const toPath = correctName(Path.basename(result))
          if (toPath) {
            file.renameSync(result, toPath)
            successed.push(toPath)
          }
        } else {
          failed.push(result)
        }
      } else {
        const tempPath = Path.get('temp', `${thisArg.name}-${thisArg.userId}-${UCDate.NowTimeNum}`)
        Check.folder(tempPath, true)
        const imgs = await Promise.allSettled(thisArg.img.map((url, index) => Data.download(url, tempPath, this.name + (index + 1 + ''))))
        imgs.forEach((img, index) => {
          if (img.status !== 'fulfilled' || !img.value) {
            failed.push(`图${index + 1}下载失败`)
          }
        })
        moveImgFnc(tempPath)
      }
    } else if (thisArg.file) {
      thisArg.finishUCcontext()
      const [zipUrl, fileBase] = await common.getFileUrl(thisArg) ?? []
      if (!zipUrl || !fileBase) return thisArg.reply('获取文件下载链接失败')
      let { name: fileName, ext } = Path.parse(fileBase)
      ext = ext.toLowerCase()
      if (ext === '.zip') {
        if (!zip) return thisArg.reply('当前操作不支持上传压缩包')
        thisArg.finishUCcontext()
        // 下载压缩包
        const zipPath = await Data.download(zipUrl, Path.temp, fileBase)
        if (!zipPath) return thisArg.reply(`下载压缩包文件${fileBase}失败`)
        const tempPath = Path.get('temp', `${thisArg.name}-${fileName}-${UCDate.NowTimeNum}`)
        Check.folder(tempPath, true)
        // 解压压缩包
        return Data.unzipper(zipPath, tempPath, async (err) => {
          if (err) return thisArg.reply(log.error(`解压文件${fileBase}失败`, err))
          moveImgFnc(tempPath)
          file.unlink(zipPath)
          const msg = makeResultMsg()
          const replMsg = await common.makeForwardMsg(thisArg.e, msg, msg[0])
          fnc && thisArg[fnc](successed)
          return thisArg.reply(replMsg)
        })
      } else if (ext === '.7z' || ext === '.rar' || ext === '.gz' || ext === '.bz2') {
        if (!zip) return thisArg.reply('当前操作不支持上传压缩包且压缩包仅支持zip格式')
        return thisArg.reply('操作失败，压缩包仅支持zip格式')
      } else if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp' || ext === '.gif') {
        const toPath = correctName(fileBase)
        if (toPath) {
          const result = await Data.download(zipUrl, toPath)
          if (result) successed.push(result)
          else failed.push(result)
        }
      } else {
        return thisArg.reply('不支持的格式：' + ext)
      }
    } else {
      thisArg.reply('请发送图片、文件或zip压缩包，或取消操作')
      return false
    }
    fnc && thisArg[fnc](successed)
    return thisArg.reply(makeResultMsg().join('\n'))
  }

  async Del_View(name, { msgNum, imgNum }) {
    /** 一页展示的消息数量 */
    this.msgNum = msgNum ?? 50
    /** 一条消息包含的图片数量 */
    this.imgNum = imgNum ?? 1
    if (!name) {
      this.imgs = file.readdirSync(this.folderPath, { type: 'File' }).sort()
    } else {
      const search = await file.searchFiles(this.folderPath, name, undefined, false)
      this.imgs = search.flatMap(arr => arr).map(v => v.file).sort()
      if (this.imgs.length === 0) return this.reply(`未找到${this.note}【${name}】相关图片`)
      if (this.imgs.length === 1) return this.fnc(this.imgs)
    }
    if (!this.imgs.length) return this.reply(name ? `未搜索到符合【${name}】相关的${this.note}图片` : `当前${this.note}图片为空`)
    this.imgsPath = this.imgs.map(img => Path.join(this.folderPath, img)) // 文件路径
    /** 总页数 */
    this.totalPage = Math.ceil(this.imgs.length / (this.msgNum * this.imgNum))
    /** 消息生成器 */
    this.msgGenerator = this.imgMsgGenerator()
    this.setContextData(this.arg)
    const replyMsg = await common.makeForwardMsg(this.e, this.msgGenerator.next().value, this.title + (this.totalPage === 1 ? '' : `【${this.nowPage}】`))
    return this.reply(replyMsg)
  }

  del(name, { msgNum, imgNum } = {}) {
    this.title = `请选择要删除的${this.note}图片的序号`
    /** 调用 */
    this.fnc = this._del
    /** 当前操作模式 */
    this.mode = '删除'
    this.Del_View(name, { msgNum, imgNum })
  }

  _del(imgs) {
    const deled = file.unlinkSync(this.folderPath, ...imgs)
    return this.reply(`成功删除${imgs.length}张${this.note}图片：\n` + Data.makeArrStr(deled, { length: 3000 }), true, { recallMsg: 110 })
  }

  view(name, { msgNum, imgNum } = {}) {
    this.title = `请查看${this.note}图片列表`
    /** 调用 */
    this.fnc = this._view
    /** 当前操作模式 */
    this.mode = '查看'
    this.Del_View(name, { msgNum, imgNum })
  }

  _view(imgs) {
    const replMsg = imgs.map((img, index) => [`${index + 1}、${img}`, segment.image(Path.join(this.folderPath, img))])
    return this.reply(replMsg, true)
  }

  * imgMsgGenerator() {
    while (true) {
      const start = this.nowPage * this.msgNum
      const end = Math.min(this.imgsPath.length, (this.nowPage + 1) * this.msgNum * this.imgNum)
      // 一页消息
      const msg = [this.title, `请在5分钟内进行操作\n可发送“退出”以结束当前【${this.mode}】操作`, `第${this.nowPage + 1}页`]
      for (let i = start; i < end; i += this.imgNum) {
        // 一条消息
        const _msg = []
        for (let n = i; n < end && n < i + this.imgNum; n++) {
          // 一张图片
          _msg.push(`第${n + 1}张：【${this.imgs[n]}】`, segment.image(this.imgsPath[n]))
        }
        msg.push(_msg)
      }
      this.nowPage++
      msg.push(`当前展示为第${this.nowPage}页\n共计${this.totalPage}页${this.imgs.length}张图片`, (this.nowPage === this.totalPage ? '当前已为最后一页~' : '查看下一页：下一页') + '\n查看第n页：第n页')
      yield msg
    }
  }

  async page(thisArg) {
    if (!/第.+页|下一页/.test(thisArg.msg)) return 'continue'
    if (!thisArg.msg.includes('下一页')) {
      const numRet = /第(.+)页/.exec(thisArg.msg)[1]
      const num = UCDate.transformChineseNum(numRet)
      if (!num) return false
      this.nowPage = Math.min(this.totalPage, num) - 1
    } else if (this.nowPage >= this.totalPage) {
      this.nowPage = 0
    }
    thisArg.finishUCcontext(this.chooseFnc)
    this.setContextData(thisArg)
    const replyMsg = await common.makeForwardMsg(thisArg.e, this.msgGenerator.next().value, this.title + (this.totalPage === 1 ? '' : `【${this.nowPage}】`))
    thisArg.reply(replyMsg)
    return true
  }

  setContextData(thisArg) {
    thisArg.e.data = {
      fnc: this.fnc.bind(this),
      handler: this.page.bind(this),
      list: this.imgs,
      nowPage: this.nowPage
    }
    thisArg.setUCcontext(this.chooseFnc, 300, false)
  }

}
