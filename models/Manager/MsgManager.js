import { file, Path, Data, common, Check, UCDate } from '../../components/index.js'
import Base from './Base.js'

/** 消息管理器 */
export default class MsgManager extends Base {
  constructor(folderPath, thisArg, note = '回复', saveId, saveDir) {
    super(folderPath, thisArg, note)
    /** 默认回复 */
    this.defaultMsg = [{ type: 'text', text: '[UC]默认回复' }]
    /** 目标目录名 */
    this.saveDir = saveDir || UCDate.NowTimeNum
    /** 目标文件名 */
    this.saveId = saveId || this.saveDir
  }

  /** 新增自定义消息   */
  add() {
    this.e.data = {
      transferFnc: this._add.bind(this)
    }
    this.arg.setUCcontext(this.transferFnc)
    return this.reply('请发送需要添加的' + this.note)
  }

  async _add(thisArg) {
    thisArg.setFnc = this.transferFnc
    if (thisArg.isCancel()) return
    // To do 转发消息的处理
    if (thisArg.e.message[0].type === 'node') {

    }
    if (!thisArg.message) return thisArg.reply('接收消息为空，请重试')
    thisArg.finishUCcontext()
    const dirPath = Path.join(this.folderPath, this.saveDir)
    Check.folder(dirPath, true)
    const message = common.getMsg(thisArg.message)
    let imgCount = 0
    for (const v of message) {
      if (v.type !== 'image') continue
      v.path = await Data.download(v.url, dirPath, this.saveId + ++imgCount)
      if (!v.path) return thisArg.reply('图片下载失败：' + v.url + '\n请重试')
      for (const key of Reflect.ownKeys(v)) {
        if (key !== 'path' && key !== 'type') {
          Reflect.deleteProperty(v, key)
        }
      }
    }
    /** 消息数据文件 */
    this.jsonPath = Path.join(dirPath, `${this.saveId}.json`)
    file.JSONsaver(this.jsonPath, message)
    await common.sleep(0.02)
    thisArg.reply([`添加${this.note}成功：${this.saveDir}\n效果如下：\n`, ...this.makeMessage()])
  }

  async Del_View() {
    this.dirs ??= file.readdirSync(this.folderPath, { type: 'Directory' })
    if (!this.dirs.length) return this.reply('当前未设置自定义' + this.note)
    const reply = this.dirs.reduce((arr, v, i) => {
      arr.push(`第${i + 1}个【${v}】`, this.makeMessage(v))
      return arr
    }, [])
    const replMsg = await common.makeForwardMsg(this.e, [this.title, ...reply], this.title)
    return this.reply(replMsg)
  }

  /** 默认回复 */
  view(defaultMsg) {
    defaultMsg && (this.defaultMsg = defaultMsg)
    this.title = `请查看${this.note}列表`
    return this.Del_View()
  }

  del() {
    this.dirs = file.readdirSync(this.folderPath, { type: 'Directory' })
    if (!this.dirs.length) return this.reply('当前未设置自定义' + this.note)
    this.title = `请选择要删除的${this.note}`
    this.e.data = {
      list: this.dirs,
      fnc: this._del.bind(this)
    }
    this.arg.setUCcontext(this.chooseFnc)
    return this.Del_View()
  }

  async _del(dirs) {
    dirs.forEach(dir => file.unlinkFilesRecursively(Path.join(this.folderPath, dir)))
    return this.reply(`成功删除${this.note}：\n` + Data.makeArrStr(dirs))
  }

  /** 制作消息，不指定目录则随机一个 */
  makeMessage(saveDir, defaultMsg) {
    defaultMsg && (this.defaultMsg = defaultMsg)
    if (saveDir) this.jsonPath = Path.join(this.folderPath, saveDir, `${this.saveId || saveDir}.json`)
    else if (!this.jsonPath) {
      const dirs = file.readdirSync(this.folderPath, { type: 'Directory' })
      if (!dirs.length) return common.makeMsg(this.defaultMsg)
      saveDir = dirs[Math.floor(Math.random() * dirs.length)]
      this.jsonPath = Path.join(this.folderPath, saveDir, `${this.saveId || saveDir}.json`)
    }
    return common.makeMsg(file.JSONreader(this.jsonPath, this.defaultMsg))
  }

}
