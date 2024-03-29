import { Path, Data, file, log } from '../components/index.js'
import { UCPlugin } from '../models/index.js'

export default class UCNoticeSet extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-noticeSet',
      dsc: '指令修改config/notice.yaml',
      rule: [
        {
          reg: /^#?(设置|注入|填写|查看)(iyuu|sct)\s*tk.*/i,
          fnc: 'setAview'
        }
      ]
    })
    this.setFnc = '_tokenContext'
  }

  async setAview(e) {
    if (!this.GM) return false
    const type = this.msg.match(/iyuu|sct/i)[0].toLowerCase()
    const path = Path.get('botConfig', 'notice.yaml')
    const noticeData = file.YAMLreader(path)
    if (/查看/.test(this.msg)) {
      log.purple(noticeData[type])
      return this.reply(Data.empty(noticeData[type]))
    }
    const tk = this.msg.match(/tk(.*)/i)[1].trim()
    if (!tk) {
      e.type = type
      e.path = path
      e.noticeData = noticeData
      this.setUCcontext()
      return this.reply('请发送要设置的token')
    }
    if (tk.length < 10) return this.reply('请输入正确的token')
    log.debug(`填写${type} Token：${tk}`)
    if (noticeData[type] === tk) {
      return this.reply(`当前${type} tk已为\n${tk}`)
    }
    noticeData[type] = tk
    file.YAMLsaver(path, noticeData)
    return this.reply(`修改${type} tk成功：\n${tk}`)
  }

  _tokenContext() {
    if (this.isCancel()) return
    const tk = this.msg.trim()
    if (tk.length < 10) return this.reply('请输入正确的token')
    const { type, noticeData, path } = this.getUCcontext()
    noticeData[type] = tk
    file.YAMLsaver(path, noticeData)
    return this.finishReply(`修改${type} tk成功：\n${tk}`)
  }

}