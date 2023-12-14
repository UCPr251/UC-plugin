import { Path, Data, Check, common, UCPr } from '../components/index.js'
import { loadJs, unloadJs } from './reloadJSs.js'
import { UCPlugin } from '../model/index.js'

export default class UCAddJS extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-addJS',
      dsc: '安装新的插件',
      rule: [
        {
          reg: /^#?UC安装(插件|JS)$/i,
          fnc: 'addJS'
        }
      ]
    })
    this.setFnc = 'getFile'
    this.setFnc2 = 'makeSure'
  }

  async addJS(e) {
    if (!this.GM) return false
    e.isUCJS = /插件/.test(e.msg)
    if (e.isUCJS && e.isGroup) return e.reply('请私聊安装UC插件')
    this.setContext(this.setFnc, false, 60)
    return e.reply('请在60s内发送js文件')
  }

  async getFile() {
    if (this.isCancel()) return false
    if (!this.e.friend) return this.finishReply('请先添加好友')
    if (!this.e.file) return this.reply('请发送js文件')
    else {
      const { isUCJS } = this.getContext().getFile
      const [fileUrl, filename] = await common.getFileUrl(this.e)
      const filePath = Path.get(isUCJS ? 'apps' : 'example', filename)
      const dirPath = isUCJS ? 'plugins/UC-plugin/apps/' : 'plugins/example/'
      if (Check.file(filePath)) {
        this.e.filePath = filePath
        this.e.fileUrl = fileUrl
        this.e.isUCJS = isUCJS
        this.e.filename = filename
        this.e.dirPath = dirPath
        this.finish(this.setFnc)
        this.setContext(this.setFnc2)
        return this.reply(`你已经安装过${dirPath}${filename}插件了，是否覆盖原插件？[是|否]`)
      }
      if (await Data.download(fileUrl, isUCJS ? Path.apps : Path.example, filename)) {
        if (!UCPr.isWatch) loadJs(Path.get('apps', filename))
        this.reply(`操作成功，新增${dirPath}${filename}，已自动载入该插件`)
        Data.refresh()
      } else {
        this.errorReply()
      }
      this.finish(this.setFnc)
    }
  }

  async makeSure() {
    if (this.isSure()) {
      const { isUCJS, filePath, fileUrl, filename, dirPath } = this.getContext().makeSure
      if (!UCPr.isWatch && isUCJS) unloadJs(filePath)
      if (await Data.download(fileUrl, Path.apps, filename)) {
        if (!UCPr.isWatch && isUCJS) loadJs(filePath)
        this.reply(`操作成功，已覆盖${dirPath}${filename}，${isUCJS ? '已自动载入该UC插件' : '可能需要重启'}`)
        Data.refresh()
      } else {
        this.errorReply()
      }
      return this.finish(this.setFnc2)
    }
    this.finishReply(this, undefined, this.setFnc2)
  }

}