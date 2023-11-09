import { Path, Check, Data, UCDate, common, file, UCPr, Permission } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'
import _ from 'lodash'

const err_reply = `请于${Path.wife}中添加图片，
并确保图片名为角色名`

let wifesList

Check.floder(Path.wife, true)

export default class UCRandomWife extends plugin {
  constructor() {
    super({
      name: 'UC-randomWife',
      dec: '随机二次元老婆',
      event: 'message.group',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?(娶|随机|今日)(二次元)?(老婆|wife)$/i,
          fnc: 'randomwife'
        },
        {
          reg: /^#?随机老婆列表$/,
          fnc: 'randomWifeList'
        },
        {
          reg: /^#?(删|删除|减)随机老婆(.+)/,
          fnc: 'delWife'
        },
        {
          reg: /^#?(增加|加|新增)(随机)?老婆(.+)/,
          fnc: 'addWife'
        }
      ]
    })
    this.redisData = '[UC]randomwife'
    this.redisData2 = '[UC]today_wife_list'
    this.setFnc = 'imgContent'
  }

  async randomwife(e) {
    if (!UCPr.randomWife.isOpen) return false
    const userData = await Data.redisGet(this.redisData + e.sender.user_id, {})
    const data_wifes = await Data.redisGet(this.redisData2, [])
    let now_times = userData.now_times ?? 0
    if (userData) {
      if (now_times >= UCPr.randomWife.wifeLimits) {
        const msg = [`你已经取过老婆了哦\n你今天的老婆是：\n${userData.wife_name}`]
        msg.push(segment.image(Path.join(Path.wife, userData.wife_img)))
        msg.push('\n老婆虽好，可不要贪多哦~')
        return e.reply(msg, true)
      }
    }
    now_times++
    const wifes = getWifes()
    if (wifes.length === 0) return e.reply(err_reply)
    const imgFiles = wifes.filter(wife => !data_wifes.includes(wife))
    if (imgFiles.length == 0) {
      return e.reply('今日所有的老婆已经被娶完了哦，明天早点来吧！')
    }
    const wife_img = _.sample(imgFiles)
    data_wifes.push(wife_img)
    const wife_name = Path.parse(wife_img).name
    const new_data = {
      now_times,
      wife_img,
      wife_name
    }
    Data.redisSet(this.redisData + e.sender.user_id, new_data, UCDate.EXsecondes)
    Data.redisSet(this.redisData2, data_wifes, UCDate.EXsecondes)
    const msg = [`你今天的老婆是：${wife_name}`, segment.image(Path.join(Path.wife, wife_img))]
    if (e.isGroup) {
      msg.unshift('\n')
      msg.unshift(segment.at(e.sender.user_id))
    }
    return e.reply(msg, true)
  }

  async delWife(e) {
    if (!UCPr.randomWife.isOpen) return false
    if (!Permission.verify(e, UCPr.randomWife)) return false
    let wifeName = e.msg.replace(/#?(删|减|删除)(随机)?老婆/, '').trim()
    if (!wifesList) {
      wifesList = getWifes()
    }
    if (!isNaN(wifeName)) {
      if (wifeName > wifesList.length) {
        return e.reply('超出可选范围：' + wifeName)
      }
      wifeName = wifesList[wifeName - 1]
    } else {
      const filterWife = wifesList.filter(name => name.startsWith(wifeName))
      if (_.isEmpty(filterWife)) {
        return e.reply(`随机老婆${wifeName}不存在`)
      }
      wifeName = filterWife[0]
    }
    const filePath = Path.join(Path.wife, wifeName)
    if (!Check.file(filePath)) {
      return e.reply(wifeName + '已经被删除过啦！')
    }
    file.unlinkSync(filePath)
    return e.reply('删除随机老婆成功：' + wifeName)
  }

  async randomWifeList(e) {
    if (!UCPr.randomWife.isOpen) return false
    let wifes = getWifes()
    wifesList = wifes
    if (_.isEmpty(wifes)) {
      return e.reply('无，' + err_reply)
    }
    wifes = wifes.map(file => Path.parse(file).name)
    const msgArr = _.chunk(wifes, 100)
    let index = 0
    const replyArr = msgArr.map(arr => {
      return arr.map(v => `${++index}、${v}`).join('\n')
    })
    const title = '随机老婆列表'
    const replyMsg = await common.makeForwardMsg(e, [title, ...replyArr, '可用#删除随机老婆+序号来便捷删除指定的老婆\n也可用#删除随机老婆XXX删除指定老婆'], title)
    return e.reply(replyMsg)
  }

  async addWife(e) {
    if (!UCPr.randomWife.isOpen) return false
    if (!Permission.verify(e, UCPr.randomWife)) return false
    const wifeName = e.msg.match(/老婆(.*)/)[1]
    const wifes = getWifes(true)
    if (Check.str(wifes, wifeName)) {
      return e.reply(wifeName + '已经存在于随机老婆图库中，请不要重复添加哦~')
    }
    const url = await common.getPicUrl(e)
    if (!url) {
      e.wifeName = wifeName
      this.setContext(this.setFnc)
      return this.reply(`老婆名：${wifeName}\n请发送图片（可取消）`)
    }
    await Data.download(url, Path.wife, wifeName + '.png')
    return e.reply('新增随机老婆成功：' + wifeName)
  }

  async imgContent() {
    if (Data.isCancel.call(this)) return false
    const url = await common.getPicUrl(this.e)
    if (!url) return this.reply('请发送图片或取消')
    const wifeName = this.getContext()[this.setFnc].wifeName
    await Data.download(url, Path.wife, wifeName + '.png')
    Data.finish.call(this, '新增随机老婆成功：' + wifeName)
  }

}

function getWifes(basename = false) {
  return file.readdirSync(Path.wife, { basename })
}
