/* eslint-disable no-labels */
import { Check, Data, Path, UCDate, UCPr, common, file } from '../components/index.js'
import { UCPlugin, Sqtj, ImgManager } from '../models/index.js'
import moment from 'moment'
import _ from 'lodash'

const ing = {}

export default class UCSqtj extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-sqtj',
      dsc: '水群统计',
      Cfg: 'config.sqtj',
      event: 'message',
      rule: [
        {
          reg: /^#?(UC)?((重新)?分析)?(((\d{2}|\d{4})(-|年))?\d{1,2}(-|月)\d{1,2})?(昨|今)?(天|日)?(水群统计|sqtj)(((\d{2}|\d{4})(-|年))?\d{1,2}(-|月)\d{1,2})?$/i,
          event: 'message.group',
          fnc: 'sqtj'
        },
        {
          reg: /^#?(UC)?(\d+天|本?(周|月))水群统计$/i,
          event: 'message.group',
          fnc: 'sqtjDWM'
        },
        {
          reg: /^#(UC)?(增加|新增|上传|查看|删除)水群统计背景$/i,
          fnc: 'manageSqtjBG'
        },
        {
          reg: /^#?水群推送测试$/,
          fnc: 'test'
        }
      ]
    })
    if (!this.groupId) return
    this.floderPath = Path.get('sqtj', this.groupId)
    if (/^#?(UC)?(\d+天|本?(周|月))水群统计$/i.test(this.msg)) return
    this.isYesterday = this.msg.includes('昨')
    const matchDate = UCDate.getFormatedDate(this.msg)
    this.isToday = !this.isYesterday && !matchDate
    this.date = matchDate ?? (this.isYesterday ? UCDate.yesterday : UCDate.today)
    this.jsonPath = Path.join(this.floderPath, `${this.date}.json`)
  }

  getLocalData() {
    if (!Check.folder(this.floderPath)) return null
    Check.folder(this.floderPath, true)
    return file.JSONreader(this.jsonPath)
  }

  saveLocalData(data) {
    Check.folder(this.floderPath, true)
    return file.JSONsaver(this.jsonPath, data)
  }

  getTimestamps(momentCilent) {
    return {
      start: momentCilent.startOf('d').valueOf() / 1000,
      end: momentCilent.endOf('d').valueOf() / 1000
    }
  }

  getDaysTimestamps(n) {
    const dates = []
    for (let i = 0; i < n; i++) {
      const date = moment().subtract(i, 'days')
      dates.unshift(this.getTimestamps(date))
    }
    return dates
  }

  getMonthTimestamps() {
    const dates = []
    const today = moment().startOf('day')
    const startOfMonth = moment().startOf('month')
    const currentDate = moment(today)
    while (currentDate.isSameOrAfter(startOfMonth, 'day')) {
      dates.unshift(this.getTimestamps(currentDate))
      currentDate.subtract(1, 'days')
    }
    return dates
  }

  async sqtj(e) {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyPermission(this.Cfg.use)) return
    if (ing[this.groupId]) {
      return this.reply('当前正在生成中，请等待……', true)
    }
    if (!this.isToday) {
      const today = UCDate.date_time[0]
      if (this.date === today) this.isToday = true
      if (this.date > today) {
        return this.reply('你是要我预测未来吗？？？', true)
      }
    }
    ing[this.groupId] = 1
    if (this.msg.includes('重新分析')) {
      if (!this.verifyLevel(3)) return (ing[this.groupId] = 0)
      file.unlinkSync(this.jsonPath)
    }
    const localData = this.getLocalData()
    const sqtjData = localData ?? { isWholeDay: false, count: 0, chatHistoryArr: [] }
    let chatHistoryArr = sqtjData.chatHistoryArr
    if (!sqtjData.isWholeDay) {
      if (!this.isToday && !this.isYesterday) {
        const isAnalyze = this.msg.includes('分析')
        if (isAnalyze) {
          this.reply(`开始分析${this.date}水群统计，请等待……`)
        } else if (!chatHistoryArr.length) {
          ing[this.groupId] = 0
          return this.reply(`本地无${this.date}水群统计数据记录，可尝试#分析${this.date}水群统计`)
        }
      } else {
        this.reply(`开始分析${this.isYesterday ? '昨' : '今'}日水群统计，请等待……`)
      }
      sqtjData.isWholeDay = !this.isToday
      const { start, end } = this.getTimestamps(moment(this.date))
      const newData = await this.getChatHistory(start, end, chatHistoryArr[0]?.seq ?? 0)
      chatHistoryArr = [...newData, ...chatHistoryArr]
    }
    const filterData = await this.filterMsg(chatHistoryArr, this.Cfg.isSelf)
    const count = chatHistoryArr.length
    sqtjData.count = count
    sqtjData.chatHistoryArr = chatHistoryArr
    if (!_.isEqual(sqtjData, localData)) this.saveLocalData(sqtjData)
    if (_.isEmpty(filterData)) {
      ing[this.groupId] = 0
      return this.reply('额(⊙o⊙)……暂时没有数据捏')
    }
    const data = await this.getImgData(filterData, count)
    const imgData = Sqtj.get(this, { ...data, count, date: this.date })
    await common.render(e, imgData)
    ing[this.groupId] = 0
    return true
  }

  async sqtjDWM(e) {
    if (this.B || !this.Cfg.isOpen) return false
    if (ing[this.groupId]) {
      return this.reply('当前正在生成中，请等待……', true)
    }
    const mode = /\d+天|本?(周|月)/.exec(this.msg)[0]
  }

  async manageSqtjBG() {
    if (!this.Cfg.isOpen) return false
    if (!this.verifyLevel(4)) return
    if (!this.checkUnNecRes()) return
    const manager = ImgManager.create(Path.get('unNecRes', 'sqtj'), this, '水群统计背景')
    const type = this.msg.includes('查看') ? 'view' : this.msg.includes('删除') ? 'del' : 'add'
    return manager[type]()
  }

  async getChatHistory(start, end, lastSeq) {
    const newData = []
    uc:
    for (let i = this.e.seq; i > 0; i -= 20) {
      const chatHistoryArr20 = (await common.getChatHistoryArr(this.e.group, i, 20)).reverse()
      if (_.isEmpty(chatHistoryArr20)) break
      for (const info of chatHistoryArr20) {
        if (_.isEmpty(info)) continue
        const { seq, time } = info
        // 对接本地数据
        if (seq <= lastSeq) break uc
        if (time > end) continue
        if (time < start) break uc
        newData.push(info)
      }
    }
    return newData
  }

  async filterMsg(chatHistoryArr) {
    const filterData = {}
    for (const info of chatHistoryArr) {
      const { user_id: userId, sender, raw_message } = info
      if (userId === this.qq && !this.Cfg.isSelf) continue
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
      if (raw_message === '[动画表情][动画表情]') {
        filterData[userId].faces++
      }
    }
    return filterData
  }

  async getImgData(filterData, count, WM = false) {
    const charArr = _.orderBy(_.values(filterData), ['times', 'faces', 'userId'], ['desc', 'desc', 'asc']).slice(0, this.Cfg.rankNum)
    for (const char of charArr) {
      char.percentage = (char.times / count * 100).toFixed(2)
      char.name = _.truncate(char.name, { length: 12, omission: '…' })
    }
    if (WM) return charArr
    const dsw = charArr[0]
    const bqd = _.maxBy(charArr, 'faces')
    const memberDataArr = Array.from((await this.e.group.getMemberMap()).values())
    const shwz = _.minBy(memberDataArr, 'last_sent_time')
    shwz.name = _.truncate(shwz.nickname, { length: 10, omission: '…' })
    shwz.lastmsgtime = UCDate.format(shwz.last_sent_time * 1000)
    return { charArr, dsw, bqd, shwz }
  }

  async test() {
    if (!this.GM) return false
    return autoSendSqtj()
  }

}

Data.loadTask({
  cron: '0 0 0 * * ?',
  name: 'UC-sqtj',
  fnc: autoSendSqtj
})

let push_ing = false

async function autoSendSqtj() {
  if (push_ing) return
  push_ing = true
  const processGroup = async function (groupId) {
    const result = await getSqtjData(groupId, '#昨日水群统计')
    if (!result) return null
    const { e, sqtj, sqtjData } = result
    const filterData = await sqtj.filterMsg(sqtjData.chatHistoryArr)
    if (_.isEmpty(filterData)) return null
    const count = sqtjData.count
    const data = await sqtj.getImgData(filterData, count)
    const imgData = Sqtj.get(this, { ...data, count, date })
    return { e, imgData, groupId }
  }
  const processGroups = async function (groups) {
    log.yellow('[水群统计推送]开始处理数据')
    const promises = groups.map(groupId => processGroup(groupId))
    const results = (await Promise.allSettled(promises)).filter(v => v.value)
    log.yellow('[水群统计推送]数据处理完毕，开始依次推送')
    let count = 0
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { e, imgData, groupId } = result.value
        await common.render(e, imgData)
        log.yellow(`[水群统计推送]推送群${groupId} [${++count}/${results.length}]`)
        await common.sleep(2.51)
      } else if (result.status === 'rejected') {
        log.error('[水群统计推送]处理群聊天数据异常：', result.reason)
      }
    }
  }
  const date = UCDate.yesterday
  const groups = Array.from(Bot.gl.keys())
  await processGroups(groups)
  push_ing = false
}

UCPr.function.getSqtjData = getSqtjData
async function getSqtjData(groupId, text) {
  if (!groupId) return null
  const Cfg = _.get(UCPr.groupCFG(groupId), 'config.sqtj', {})
  const isAutoSend = Cfg.isOpen && Cfg.isAutoSend
  if (!isAutoSend) return null
  const group = common.pickGroup(groupId)
  const msgInfo = await common.getChatHistoryArr(group, 0, 1)
  if (!msgInfo.length) return null
  const seq = msgInfo[0]?.seq ?? 0
  const e = {
    group,
    seq,
    groupId,
    message: [{ type: 'text', text }],
    user_id: UCPr.GlobalMaster[0],
    isGroup: true,
    reply(base64) {
      group.sendMsg(base64)
    }
  }
  const sqtj = new UCSqtj(e)
  sqtj.Cfg = Cfg
  const localData = sqtj.getLocalData()
  const sqtjData = localData ? _.cloneDeep(localData) : { isWholeDay: false, count: 0, chatHistoryArr: [] }
  let chatHistoryArr = sqtjData.chatHistoryArr
  if (!sqtjData.isWholeDay) {
    const { start, end } = sqtj.getTimestamps(moment(sqtj.date))
    const newData = await sqtj.getChatHistory(start, end, chatHistoryArr[0]?.seq ?? 0)
    chatHistoryArr = [...newData, ...chatHistoryArr]
    sqtjData.isWholeDay = true
  }
  sqtjData.count = chatHistoryArr.length
  sqtjData.chatHistoryArr = chatHistoryArr
  localData?.isWholeDay || sqtj.saveLocalData(sqtjData)
  return { sqtjData, sqtj, e }
}