import { Path, Check, Data, UCDate, common, file } from '../components/index.js'
import { UCPlugin, ImgManager } from '../models/index.js'
import _ from 'lodash'

/**
 * 此功能由
 * @三三 （2244891707）
 * 定制并自愿于UC中集成公开
 * 定制日期：2023.7.5
 */

export default class UCRandomWife extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-randomWife',
      dsc: '随机二次元老婆',
      event: 'message',
      Cfg: 'config.randomWife',
      rule: [
        {
          reg: /^#?(随机|今日)(二次元)?(老婆|纸片人|wife)$/i,
          fnc: 'randomWife'
        },
        {
          reg: /^#(增加|新增|上传|查看|删除)随机老婆(.*)/,
          fnc: 'manageWifeImg'
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

  async randomWife() {
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
    if (!wifes.length) return this.reply('老婆图片资源为空')
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
    return this.reply(msg, true, { at: true })
  }

  async manageWifeImg() {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyLevel()) return
    if (!this.checkUnNecRes()) return
    const name = this.msg.match(/老婆(.*)/)[1]
    const manager = ImgManager.create(Path.wife, this, '随机老婆')
    if (this.msg.includes('删除')) {
      if (!this.verifyPermission(this.Cfg.del)) return
      return manager.del(name)
    }
    const type = this.msg.includes('查看') ? 'view' : 'add'
    if (type === 'view') return manager.view(name)
    if (!this.verifyPermission(this.Cfg.add)) return
    return manager.add(name, { autoRename: false, solo: true })
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
    const userId = this.at || this.msg.match(/\d{5,10}/)?.[0] || this.userId
    const wifeName = this.msg.replace(/#?内定老婆/, '').replace(this.userId, '').trim()
    return this.searchFiles(Path.wife, wifeName, '_chooseWife', { data: { userId }, basename: true, note: '要内定的老婆' })
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