import { Path, Check, Data, UCDate, common, file } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

export default class UCRandomWife extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-randomWife',
      dec: '随机二次元老婆',
      event: 'message',
      Cfg: 'config.randomWife',
      rule: [
        {
          reg: /^#?(随机|今日)(二次元)?(老婆|纸片人|wife)$/i,
          fnc: 'randomwife'
        },
        {
          reg: /^#?随机老婆列表$/,
          fnc: 'randomWifeList'
        },
        {
          reg: /^#?(增加|加|新增|上传)(随机)?老婆(.+)/,
          fnc: 'addWife'
        },
        {
          reg: /^#?删除随机老婆/,
          fnc: 'delWife'
        },
        {
          reg: /^#?内定老婆/,
          fnc: 'chooseWife'
        },
        {
          reg: /^#?取消内定老婆\d*$/,
          fnc: 'cancelWife'
        }
      ]
    })
    this.redisData = '[UC]randomWife'
    this.redisData2 = '[UC]todayWifesList'
    this.setFnc = '_imgContext'
  }

  async randomwife() {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyLevel()) return
    if (!this.checkUnNecRes()) return
    if (!this.isGroup) return this.reply('请在群聊中使用本功能哦~')
    const userData = await Data.redisGet(this.redisData + this.userId, {})
    const data_wifes = await Data.redisGet(this.redisData2, [])
    let now_times = userData.now_times ?? 0
    if (now_times && now_times >= this.Cfg.wifeLimits) {
      const msg = [`你已经取过老婆了哦\n你今天的老婆是：\n${userData.wife_name}`]
      const imgPath = Path.get('wife', userData.wife_img)
      if (!Check.file(imgPath)) {
        msg.push(`\n[${userData.wife_name}](图片已被删除)`)
      } else {
        msg.push(segment.image(imgPath))
      }
      msg.push(this.Cfg.limitedReply)
      return this.reply(msg, true)
    }
    now_times++
    const wifes = getWifes()
    if (!wifes.length) return this.reply('未正确拉取UC资源，请使用#UC更新资源 获取图片资源')
    const chooseWifeData = getChooseWifeData()
    let wife_img = chooseWifeData[this.userId]
    if (!wife_img) {
      const choosedWifesList = Object.values(chooseWifeData)
      const imgFiles = wifes.filter(wife => !data_wifes.includes(wife) && !choosedWifesList.includes(wife))
      if (!imgFiles.length) {
        return this.reply('今日所有的老婆已经被娶完了哦，明天早点来吧！')
      }
      wife_img = _.sample(imgFiles)
    }
    data_wifes.push(wife_img)
    const wife_name = Path.parse(wife_img).name
    const new_data = {
      now_times,
      wife_img,
      wife_name
    }
    Data.redisSet(this.redisData + this.userId, new_data, UCDate.EXsecondes)
    Data.redisSet(this.redisData2, data_wifes, UCDate.EXsecondes)
    const msg = [`你今天的老婆是：${wife_name}`]
    const imgPath = Path.join(Path.wife, wife_img)
    if (!Check.file(imgPath)) {
      msg.push(`\n[${wife_name}](图片已被删除)`)
    } else {
      msg.push(segment.image(imgPath))
    }
    if (this.isGroup) {
      msg.unshift('\n')
      msg.unshift(segment.at(this.userId))
    }
    return this.reply(msg, true)
  }

  async randomWifeList(e) {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyLevel()) return
    if (!this.checkUnNecRes()) return
    const wifes = getWifes(true)
    if (!wifes.length) {
      return this.reply('随机老婆列表为空')
    }
    const replyArr = Data.makeArrStr(wifes, { length: 3000, chunkSize: 100 })
    const title = '随机老婆列表'
    const replyMsg = await common.makeForwardMsg(e, [title, ...replyArr, '可用#删除随机老婆XXX 删除指定老婆图片'], title)
    return this.reply(replyMsg)
  }

  async addWife(e) {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyPermission(this.Cfg.add)) return
    if (!this.checkUnNecRes()) return
    const wifeName = this.msg.match(/老婆(.*)/)[1]
    const wifes = getWifes(true)
    if (Check.str(wifes, wifeName)) {
      return this.reply(wifeName + '已经存在于随机老婆图库中，不能重复添加哦~')
    }
    const url = await common.getPicUrl(e)
    if (!url) {
      e.wifeName = wifeName
      this.setUCcontext()
      return this.reply(`老婆名：${wifeName}\n请发送图片（可取消）`)
    }
    await Data.download(url, Path.wife, wifeName)
    return this.reply('新增随机老婆成功：' + wifeName)
  }

  async _imgContext() {
    if (this.isCancel()) return
    const url = await common.getPicUrl(this.e)
    if (!url) return this.reply('请发送图片或取消')
    const wifeName = this.getUCcontext().wifeName
    await Data.download(url, Path.wife, wifeName)
    return this.finishReply('新增随机老婆成功：' + wifeName)
  }

  async chooseWife() {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyLevel(3)) return
    if (!this.checkUnNecRes()) return
    this.userId = this.at || this.msg.match(/\d{5,10}/)?.[0] || this.userId
    const _wifeName = this.msg.replace(/#?内定老婆/, '').replace(this.userId, '').trim()
    return this.searchWife(_wifeName, '_chooseWife')
  }

  async delWife() {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyPermission(this.Cfg.del)) return
    if (!this.checkUnNecRes()) return
    const _wifeName = this.msg.replace(/#?(删|减|删除)(随机)?老婆/, '').trim()
    return this.searchWife(_wifeName, '_delWife')
  }

  async searchWife(_wifeName, fnc) {
    const userId = this.userId
    if (!_wifeName) {
      const wifes = getWifes()
      this.e.data = {
        fnc,
        list: wifes,
        userId
      }
      this.setUCcontext('__chooseContext')
      const title = '请选择老婆序号'
      const replyMsg = [title]
      replyMsg.push(...Data.makeArrStr(wifes, { chunkSize: 100, length: 3000 }))
      const reply = await common.makeForwardMsg(this.e, replyMsg, title)
      return this.reply(reply)
    }
    const search = await file.searchFiles(Path.wife, _wifeName)
    if (search.length === 0) return this.reply('未找到相关老婆图片')
    if (search.length !== 1) {
      const list = _.map(search, 'file').filter(v => Path.extname(v))
      this.e.data = {
        fnc,
        list,
        userId
      }
      this.setUCcontext('__chooseContext')
      return this.reply('找到多个相关老婆图片，请选择老婆序号：\n' + Data.makeArrStr(list, { length: 3000 }))
    }
    const wifeFile = search[0].file
    return this[fnc]([wifeFile], { userId })
  }

  _chooseWife([wifeFile], { userId }) {
    const chooseWifeData = getChooseWifeData()
    const choosed = _.findKey(chooseWifeData, v => v === wifeFile)
    if (choosed) {
      if (chooseWifeData[userId] === wifeFile) return this.reply(`${userId}已内定老婆：${wifeFile}`)
      return this.reply(`操作失败：${wifeFile}已被${choosed}内定`)
    }
    chooseWifeData[userId] = wifeFile
    saveChooseWifeData(chooseWifeData)
    return this.reply(`成功内定${userId}老婆：${wifeFile}`)
  }

  _delWife(wifeFiles) {
    return this.reply('删除随机老婆成功：\n' + Data.makeArrStr(file.unlinkSync(Path.wife, ...wifeFiles), { length: 3000 }))
  }

  async cancelWife() {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyLevel(3)) return
    if (!this.checkUnNecRes()) return
    const userId = this.at || this.msg.match(/\d{5,10}/)?.[0] || this.userId
    const chooseWifeData = getChooseWifeData()
    const choosedWife = chooseWifeData[userId]
    if (!choosedWife) return this.reply(`${userId}未内定老婆`)
    delete chooseWifeData[userId]
    saveChooseWifeData(chooseWifeData)
    return this.reply(`成功取消内定${userId}老婆：${choosedWife}`)
  }

}

function getWifes(basename = false) {
  return file.readdirSync(Path.wife, { basename, type: 'File' })
}

function getChooseWifeData() {
  return file.JSONreader(Path.get('data', 'chooseWife.json'), {})
}

function saveChooseWifeData(data) {
  return file.JSONsaver(Path.get('data', 'chooseWife.json'), data)
}