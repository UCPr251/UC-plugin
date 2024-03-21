import { Path, Data, file, common } from '../components/index.js'
import { UCPlugin, ImgManager, MsgManager } from '../models/index.js'
import _ from 'lodash'

const folderPath = Path.get('data', 'chuoMaster')

export default class UCChuoyichuoM extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-chuoyichuoM',
      dsc: '戳一戳管理器',
      Cfg: 'config.chuoyichuo',
      event: 'message',
      rule: [
        {
          reg: /^#?(UC)?(切换)?戳一戳图包(列表)?$/i,
          fnc: 'switchPicPath'
        },
        {
          reg: /^#?(UC)?查看戳一戳文本$/i,
          fnc: 'textList'
        },
        {
          reg: /^#?(UC)?(新增|增加|添加|删除)戳一戳文本/i,
          fnc: 'manageText'
        },
        {
          reg: /^#?(UC)?(新增|增加|添加|创建|删除)戳一戳图包/i,
          fnc: 'managePicPath'
        },
        {
          reg: /^#?(UC)?(新增|增加|上传|添加|查看|删除)戳一戳图片/i,
          fnc: 'manageImg'
        },
        {
          reg: /^#?(UC)?(新增|添加|增加|删除|查看)戳主人回复$/i,
          fnc: 'manageChuoMaster'
        }
      ]
    })
  }

  async switchPicPath() {
    if (!this.verifyPermission()) return
    if (!this.checkUnNecRes()) return
    const picPaths = file.readdirSync(Path.chuoyichuo, { type: 'Directory' })
    return this.reply(`可选的戳一戳图包：\n${Data.makeArrStr(picPaths)}\n当前使用：${this.Cfg.picPath}\n使用#UC设置戳一戳图包+图包名 切换图包`)
  }

  async textList() {
    if (!this.verifyPermission()) return
    const oriData = file.readFileSync(Path.get('resdata', 'chuoyichuo.txt'), 'utf8') || ''
    const list = oriData.split('\n').map(v => v.trim()).filter(Boolean)
    if (!list.length) return this.reply('戳一戳文本为空，请先添加文本')
    const title = 'UC戳一戳文本列表'
    const replyMsg = [title, ...Data.makeArrStr(list, { chunkSize: 50 }), '删除：#UC删除戳一戳文本+文本\n新增：#UC添加戳一戳文本+文本']
    return this.reply(await common.makeForwardMsg(this.e, replyMsg, title))
  }

  async managePicPath() {
    if (!this.verifyPermission()) return
    if (!this.checkUnNecRes()) return
    const picPaths = file.readdirSync(Path.chuoyichuo, { type: 'Directory' })
    const picPath = this.msg.match(/图包(.*)/)[1].trim()
    if (this.msg.includes('删除')) {
      if (picPath) {
        if (!picPaths.includes(picPath)) return this.reply('不存在该戳一戳图包：' + picPath)
        return this._delPicPath([picPath])
      }
      this.e.data = {
        fnc: '_delPicPath',
        list: picPaths
      }
      this.setUCcontext()
      return this.reply('请选择要删除的戳一戳图包：\n' + Data.makeArrStr(picPaths))
    }
    if (!picPath) return this.reply('请同时输入要创建的戳一戳图包名')
    if (picPaths.includes(picPath)) return this.reply('已存在该戳一戳图包：' + picPath)
    file.mkdirSync(Path.get('chuoyichuo', picPath))
    return this.reply('成功创建戳一戳图包：' + picPath + '\n若需添加图片请先切换至该图包#UC设置戳一戳图包\n然后使用#UC添加戳一戳图片')
  }

  _delPicPath(picPaths) {
    picPaths.forEach(picPath => file.unlinkFilesRecursively(Path.get('chuoyichuo', picPath)))
    return this.reply('成功删除戳一戳图包：\n' + Data.makeArrStr(picPaths))
  }

  async manageText() {
    if (!this.verifyPermission()) return
    const newLine = this.msg.match(/戳一戳文本(.*)/)[1].trim()
    const oriData = file.readFileSync(Path.get('resdata', 'chuoyichuo.txt'), 'utf8') || ''
    const list = oriData.split('\n').map(v => v.trim()).filter(Boolean)
    if (this.msg.includes('删除')) {
      if (!newLine) {
        if (!list.length) return this.reply('戳一戳文本为空，请先添加文本')
        this.e.data = {
          fnc: '_delText',
          list
        }
        this.setUCcontext()
        const title = '请选择要删除的UC戳一戳文本'
        const replyMsg = [title, '提示：戳一戳ai文本转语音会从戳一戳文本中，连续的汉字数大于等于3的文本中挑选', ...Data.makeArrStr(list, { chunkSize: 50 })]
        return this.reply(await common.makeForwardMsg(this.e, replyMsg, title))
      }
      if (!list.includes(newLine)) return this.reply('不存在该戳一戳文本：' + newLine)
      return this._delText([newLine], { list })
    }
    if (!newLine) return this.reply('请同时输入要添加的戳一戳文本')
    if (list.includes(newLine)) return this.reply('已存在该戳一戳文本：\n' + newLine)
    file.appendFileSync(Path.get('resdata', 'chuoyichuo.txt'), '\n' + newLine)
    return this.reply('成功添加戳一戳文本：\n' + newLine)
  }

  _delText(dels, { list }) {
    const newOriArr = _.difference(list, dels)
    file.writeFileSync(Path.get('resdata', 'chuoyichuo.txt'), newOriArr.join('\n'), 'utf8')
    return this.reply('成功删除戳一戳文本：\n' + Data.makeArrStr(dels))
  }

  async manageImg() {
    if (!this.verifyPermission()) return
    if (!this.checkUnNecRes()) return
    const name = /戳一戳图片(.*)/.exec(this.msg)[1]
    const manager = ImgManager.create(Path.get('chuoyichuo', this.Cfg.picPath), this, this.Cfg.picPath + '戳一戳')
    const type = this.msg.includes('删除') ? 'del' : this.msg.includes('查看') ? 'view' : 'add'
    if (type === 'add') return manager.add(name || this.Cfg.picPath)
    return manager[type](name)
  }

  async manageChuoMaster() {
    if (!this.verifyLevel(3)) return
    const manager = new MsgManager(folderPath, this, '戳主人回复', 'UC-chuoMaster')
    if (/新增|添加|增加/.test(this.msg)) {
      return manager.add()
    }
    if (this.msg.includes('查看')) {
      return manager.view()
    }
    return manager.del()
  }

}