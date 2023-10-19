import { Path, Data, UCPr, Check } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import path from 'path'

export class UCAddJS extends plugin {
  constructor() {
    super({
      name: 'UC-addJS',
      dsc: '安装新的插件',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?UC安装插件$/i,
          fnc: 'addJS'
        }
      ]
    })
    this.setFnc = 'getFile'
  }

  async addJS(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    if (e.isGroup) return e.reply('请私聊安装')
    this.setContext(this.setFnc, false, 60)
    e.reply('请在60s内发送js文件')
    return true
  }

  async getFile() {
    if (Data.isCancel.call(this)) return false
    if (!this.e.friend) return Data.finish.bind(this, '请先添加好友')
    if (!this.e.file) return this.reply('请发送js文件')
    else {
      const fileUrl = await this.e.friend.getFileUrl(this.e.file.fid)
      const filename = this.e.file.name
      if (Check.file(path.join(Path.apps, filename))) {
        this.reply(`你已经安装过${filename}插件了~`)
        this.finish(this.setFnc)
        return
      }
      if (await Data.addJS(fileUrl, Path.apps, filename)) {
        this.reply(`操作成功，新增UC-plugin/apps/${filename}，重启后生效`)
        Data.update()
      } else {
        this.reply(UCPr.error)
      }
      this.finish(this.setFnc)
    }
  }
}