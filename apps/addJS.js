import { Path, Data, Check, common, UCPr, file } from '../components/index.js'
import { loadJs, unloadJs } from './reloadJSs.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

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
        },
        {
          reg: /^#?UC搜索JS.+/i,
          fnc: 'searchJS'
        },
        {
          reg: /^#?UC(卸载|删除)JS/i,
          fnc: 'delJS'
        }
      ]
    })
    this.setFnc = '_fileContext'
    this.setFnc2 = '_makeSure'
  }

  async addJS(e) {
    if (!this.GM) return false
    e.isUCJS = /插件/.test(this.msg)
    // if (e.isUCJS && e.isGroup) return this.reply('请私聊安装UC插件')
    this.setUCcontext(60)
    return this.reply('请在60s内发送js文件')
  }

  async _fileContext() {
    if (this.isCancel()) return false
    if (!this.isGroup && !this.e.friend) return this.finishReply('请先添加好友')
    if (!this.e.file) return this.reply('请发送js文件')
    else {
      const { isUCJS } = this.getUCcontext()
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
        this.setUCcontext(this.setFnc2)
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

  async _makeSure() {
    if (this.isCancel()) return
    if (this.isSure()) {
      const { isUCJS, filePath, fileUrl, filename, dirPath } = this.getUCcontext(this.setFnc2)
      if (!UCPr.isWatch && isUCJS) unloadJs(filePath)
      file.unlinkSync(filePath)
      await common.sleep(0.2)
      if (await Data.download(fileUrl, isUCJS ? Path.apps : Path.example, filename)) {
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

  async searchJS() {
    if (!this.GM) return false
    const jsName = this.msg.match(/JS(.+)/i)[1].trim()
    const search = await file.searchFiles(Path.example, jsName.replace(/\.js$/, ''), { type: '.js' })
    if (!search.length) return this.reply(`未找到${jsName}及其相关文件`)
    return this.reply(`搜索到以下js：\n${Data.makeArrStr(search, { property: 'file' })}`)
  }

  async delJS(e) {
    if (!this.GM) return false
    let jsName = this.msg.match(/JS(.+)/i)?.[1].trim()
    if (!jsName) {
      const JSs = file.readdirSync(Path.example, { type: '.js' })
      e.data = {
        fnc: '_delJS',
        list: JSs
      }
      this.setUCcontext('__chooseContext')
      const title = '请选择要删除的JS'
      const info = Data.makeArrStr(JSs, { chunkSize: 100, length: 2000 })
      const replyMsg = await common.makeForwardMsg(e, [title, '请选择要删除的js的序号\n间隔可一次删除多个\n也可使用1-10可一次删除多个', ...info], title)
      return this.reply(replyMsg)
    }
    if (!jsName.endsWith('.js')) jsName += '.js'
    if (Check.file(Path.get('example', jsName))) {
      file.unlinkSync(Path.example, jsName)
      return this.reply(`删除成功：${jsName}`)
    }
    const search = await file.searchFiles(Path.example, jsName.replace(/\.js$/, ''), { type: '.js' })
    if (!search.length) return this.reply(`未找到${jsName}及其相关文件`)
    e.data = {
      fnc: '_delJS',
      list: _.map(search, 'file')
    }
    this.setUCcontext('__chooseContext')
    const info = Data.makeArrStr(search, { chunkSize: 100, length: 2000, property: 'name' })
    const title = '请选择要删除的JS'
    const replyMsg = await common.makeForwardMsg(e, [`未找到${jsName}插件，自动搜索相关文件，请选择要删除的js的序号`, ...info], title)
    return this.reply(replyMsg)
  }

  _delJS(JSsArr) {
    return this.reply(`删除成功：\n${Data.makeArrStr(file.unlinkSync(Path.example, ...JSsArr))}`)
  }

}