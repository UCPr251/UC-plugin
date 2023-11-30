import { Path, Data, Check, common } from '../components/index.js'
import { UCPlugin } from '../model/index.js'

export default class UCAddJS extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-addJS',
      dsc: '安装新的插件',
      rule: [
        {
          reg: /^#?UC安装插件$/i,
          fnc: 'addJS'
        }
      ]
    })
    this.setFnc = 'getFile'
    this.setFnc2 = 'makeSure'
  }

  async addJS(e) {
    if (!this.GM) return false
    if (e.isGroup) return e.reply('请私聊安装')
    this.setContext(this.setFnc, false, 60)
    e.reply('请在60s内发送js文件')
    return true
  }

  async getFile() {
    if (this.isCancel()) return false
    if (!this.e.friend) return this.finishReply('请先添加好友')
    if (!this.e.file) return this.reply('请发送js文件')
    else {
      const [fileUrl, filename] = await common.getFileUrl(this.e)
      if (Check.file(Path.get('apps', filename))) {
        this.e.filename = filename
        this.e.fileUrl = fileUrl
        this.finish(this.setFnc)
        this.setContext(this.setFnc2)
        return this.reply(`你已经安装过[UC]${filename}插件了，是否覆盖原插件？[是|否]`)
      }
      if (await Data.download(fileUrl, Path.apps, filename)) {
        this.reply(`操作成功，新增UC-plugin/apps/${filename}，重启后生效`)
        Data.refresh()
      } else {
        this.reply(this.errorReply)
      }
      this.finish(this.setFnc)
    }
  }

  async makeSure() {
    if (this.e.msg === '是') {
      const { fileUrl, filename } = this.getContext().makeSure
      if (await Data.download(fileUrl, Path.apps, filename)) {
        this.reply(`操作成功，已覆盖UC-plugin/apps/${filename}，重启后生效`)
        Data.refresh()
      } else {
        this.reply(this.errorReply)
      }
      return this.finish(this.setFnc2)
    }
    this.finishReply(this, undefined, this.setFnc2)
  }

}