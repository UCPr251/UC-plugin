import { Path, Data, Check, common, UCPr, file, UCDate } from '../components/index.js'
import { UCPlugin } from '../models/index.js'

export default class UCJSsystem extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-JSsystem',
      dsc: 'JS插件管理系统',
      Cfg: 'config.JSsystem',
      rule: [
        {
          reg: /^#?(UC)?安装(插件|JS)$/i,
          fnc: 'addJS'
        },
        {
          reg: /^#?(UC)?(启用)?JS列表$/i,
          fnc: 'enabledJSsList'
        },
        {
          reg: /^#?(UC)?停用JS列表$/i,
          fnc: 'disabledJSsList'
        },
        {
          reg: /^#?(UC)?搜索JS/i,
          fnc: 'searchJS'
        },
        {
          reg: /^#?(UC)?(查看|停用|启用|卸载|删除)JS(?!列表)/i,
          fnc: 'controller'
        },
        {
          reg: /^#?(UC)?重新查看JS$/i,
          fnc: 'resendJS'
        }
      ]
    })
    this.redisData = '[UC]JSsystem-viewJS'
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
    if (this.isCancel()) return
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
        this.finishUCcontext()
        this.setUCcontext(this.setFnc2)
        return this.reply(`你已经安装过${dirPath}${filename}插件了，是否覆盖原插件？[是|否]`)
      }
      if (await Data.download(fileUrl, isUCJS ? Path.apps : Path.example, filename)) {
        if (!UCPr.isWatch) UCPr.function.loadJs(Path.get('apps', filename))
        this.reply(`操作成功，新增${dirPath}${filename}，已自动载入该插件`)
        Data.refresh()
      } else {
        this.errorReply()
      }
      this.finishUCcontext()
    }
  }

  async _makeSure() {
    if (this.isCancel(this.setFnc2)) return
    if (this.isSure()) {
      const { isUCJS, filePath, fileUrl, filename, dirPath } = this.getUCcontext(this.setFnc2)
      if (!UCPr.isWatch && isUCJS) UCPr.function.unloadJs(filePath)
      file.unlinkSync(filePath)
      await common.sleep(0.2)
      if (await Data.download(fileUrl, isUCJS ? Path.apps : Path.example, filename)) {
        if (!UCPr.isWatch && isUCJS) UCPr.function.loadJs(filePath)
        this.reply(`操作成功，已覆盖${dirPath}${filename}，${isUCJS ? '已自动载入该UC插件' : '可能需要重启'}`)
        Data.refresh()
      } else {
        this.errorReply()
      }
      return this.finishUCcontext(this.setFnc2)
    }
  }

  async enabledJSsList() {
    if (!this.GM) return false
    const JSs = file.readdirSync(Path.example, { type: '.js' })
    const info = Data.makeArrStr(JSs, { chunkSize: 100 })
    const title = '已启用的JS插件列表'
    const replyMsg = await common.makeForwardMsg(this.e, [title, ...info, '未启用的JS插件列表：#UC停用JS列表\n搜索：#UC搜索JS\n查看：#UC查看JS\n停用：#UC停用JS\n启用：#UC启用JS\n删除：#UC删除JS'], title)
    return this.reply(replyMsg)
  }

  async disabledJSsList() {
    if (!this.GM) return false
    const JSs = file.readdirSync(Path.get('recycleBin', 'example'), { type: '.js' })
    if (!JSs.length) return this.reply('没有已停用的JS')
    const info = Data.makeArrStr(JSs, { chunkSize: 100 })
    const title = '已停用的JS插件列表'
    const replyMsg = await common.makeForwardMsg(this.e, [title, ...info, '已启用的JS插件列表：#UC启用JS列表\n搜索：#UC搜索JS\n查看：#UC查看JS\n停用：#UC停用JS\n启用：#UC启用JS\n删除：#UC删除JS'], title)
    return this.reply(replyMsg)
  }

  async searchJS() {
    if (!this.GM) return false
    const jsName = this.msg.match(/JS(.*)/i)[1].trim()
    if (!jsName) return this.reply('请同时指定要搜索的JS关键词')
    const search = await file.searchFiles(Path.example, jsName.replace(/\.js$/, ''), { type: '.js' })
    if (!search.length) return this.reply(`未找到【${jsName}】及其相关文件`)
    return this.reply(`搜索到以下js：\n${Data.makeArrStr(search, { property: 'file' })}\n\n可通过#UC查看JS+文件名 发送文件查看`)
  }

  async controller() {
    if (!this.GM) return false
    const newMsg = this.msg.replace(/#?(UC)?/i, '')
    const [oepration, jsName] = newMsg.split(/JS/i).map(v => v.trim())
    let type = '', path = Path.example
    switch (oepration) {
      case '查看':
        type = '_viewJS'
        break
      case '停用':
        type = '_disableJS'
        break
      case '启用':
        type = '_enableJS'
        path = Path.get('recycleBin', 'example')
        break
      case '卸载':
      case '删除':
        type = '_delJS'
        break
    }
    return this.searchFiles(path, jsName, type, { type: '.js', note: `要${oepration}的JS文件`, basename: true })
  }

  _viewJS(JSsArr, re = false) {
    const recallFile = this.isGroup ? this.Cfg.recallFileGroup : this.Cfg.recallFilePrivate
    const JSsPath = re === true ? JSsArr : JSsArr.map(JS => Path.get('example', JS))
    re === true || Data.redisSet(this.redisData + this.userId, JSsPath, UCDate.EXsecondes)
    re === true && (JSsArr = file.getFilesBase(JSsArr))
    if (JSsArr.length > 1 && this.Cfg.isZip) {
      return Data.zipBuffer(JSsPath, (err, buffer) => {
        if (err) return this.reply(log.error('压缩失败：', err))
        const zipName = this.userId + '-' + UCDate.NowTimeNum + '.zip'
        return common.sendFile(this.e, buffer, zipName, `已压缩JS文件\n${Data.makeArrStr(JSsArr)}\n为${zipName}并发送，可在今日内发送#重新查看js 重新发送`, { recallMsg: recallFile, recallFile })
      })
    }
    JSsArr.forEach((JS, i) => common.sendFile(this.e, JSsPath[i], JS, '', { recallFile }))
    return this.reply(`成功发送JS：\n${Data.makeArrStr(JSsArr)}\n可在今日内发送#重新查看js 重新发送`, false, { recallMsg: recallFile })
  }

  _disableJS(JSsArr) {
    Check.folder(Path.get('recycleBin', 'example'), true)
    JSsArr.forEach(JS => file.renameSync(Path.get('example', JS), Path.get('recycleBin', 'example', JS)))
    return this.reply(`成功停用JS：\n${Data.makeArrStr(JSsArr)}`)
  }

  _enableJS(JSsArr) {
    JSsArr.forEach(JS => file.renameSync(Path.get('recycleBin', 'example', JS), Path.get('example', JS)))
    return this.reply(`成功启用JS：\n${Data.makeArrStr(JSsArr)}`)
  }

  _delJS(JSsArr) {
    return this.reply(`成功删除JS：\n${Data.makeArrStr(file.unlinkSync(Path.example, ...JSsArr))}`)
  }

  async resendJS() {
    if (!this.GM) return false
    const data = await Data.redisGet(this.redisData + this.userId)
    if (!data) return this.reply('今日未使用#UC查看JS 获取JS，无法使用本功能')
    return this._viewJS(data, true)
  }

}