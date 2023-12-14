/* eslint-disable no-labels */
import { Data, UCDate, common } from '../components/index.js'
import { UCPlugin, Sqtj } from '../model/index.js'
import _ from 'lodash'

const ing = {}
let todayData = {}
let yesterdayData = {}

// 由原版千羽水群统计改进而来

export default class UCSqtj extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-sqtj',
      dsc: '水群统计',
      Cfg: 'config.sqtj',
      event: 'message.group',
      rule: [
        {
          reg: /^#?(UC)?(昨|今)?(天|日)?水群统计/i,
          fnc: 'sqtj'
        }
      ]
    })
  }

  async sqtj(e) {
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (!this.Cfg.isOpen) return false
    if (ing[this.groupId]) {
      return e.reply('当前正在生成中，请等待……')
    }
    const isYesterday = /昨/.test(this.msg)
    ing[this.groupId] = true
    e.reply(`开始分析${isYesterday ? '昨' : '今'}日水群统计，请等待……`)
    const appointData = isYesterday ? yesterdayData : todayData
    appointData[this.groupId] = appointData[this.groupId] ?? { chatHistoryArr: [], seq: 0, count: 0 }
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)
    let end
    if (isYesterday) {
      end = currentDate.getTime() / 1000 - 1
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      end = Date.now() / 1000
    }
    const start = currentDate.getTime() / 1000
    // log.red(date)
    const tempData = []
    // 更新聊天记录
    uc:
    for (let i = e.seq; i > 0; i -= 20) {
      const chatHistoryArr20 = (await e.group.getChatHistory(i, 20)).reverse()
      if (_.isEmpty(chatHistoryArr20)) break
      for (const info of chatHistoryArr20) {
        if (_.isEmpty(info)) continue
        const { seq, time } = info
        // 对接之前数据
        if (seq <= appointData[this.groupId].seq) break uc
        // 筛选时间
        if (time > end) continue
        if (time < start) break uc
        tempData.push(info)
      }
    }
    const chatHistoryArr = [...tempData, ...appointData[this.groupId].chatHistoryArr]
    // 筛选聊天记录
    const filterData = {}
    let count = 0
    const { isSelf } = this.Cfg
    for (const info of chatHistoryArr) {
      const { user_id: userId, sender, raw_message } = info
      // 忽略Bot消息
      if (userId === this.qq && !isSelf) continue
      // 黑名单
      if (this.isB(userId)) continue
      const name = sender.card || sender.nickname || userId
      if (filterData[userId]) {
        filterData[userId].times++
        filterData[userId].name = name
      } else {
        filterData[userId] = {
          userId,
          name,
          times: 1,
          faces: 0
        }
      }
      if (raw_message === '[动画表情]') {
        filterData[userId].faces++
      }
      count++
    }
    // 缓存数据
    appointData[this.groupId] = { chatHistoryArr, seq: e.seq, count }
    if (_.isEmpty(filterData)) return e.reply('额(⊙o⊙)……暂时没有数据捏')
    const charArr = _.orderBy(_.values(filterData), ['times', 'faces', 'userId'], ['desc', 'desc', 'asc']).slice(0, 10)
    for (const i in charArr) {
      charArr[i].percentage = (charArr[i].times / count * 100).toFixed(2)
    }
    const dsw = charArr[0]
    const bqd = _.maxBy(charArr, 'faces')
    const memberDataArr = Array.from((await e.group.getMemberMap()).values())
    const shwz = _.minBy(memberDataArr, 'last_sent_time')
    shwz.lastmsgtime = UCDate.diff(Date.now() - shwz.last_sent_time * 1000).toStr() + '前'
    const date = isYesterday ? UCDate.getdate_time(-1)[0] : UCDate.date_time[0]
    const data = Sqtj.get(e, { charArr, dsw, bqd, shwz, count, date })
    ing[this.groupId] = false
    return await common.render(e, data)
  }
}

Data.loadTask({
  cron: '0 0 0 * * ?',
  name: 'UC-sqtj',
  fnc: () => {
    yesterdayData = todayData
    todayData = {}
  }
})