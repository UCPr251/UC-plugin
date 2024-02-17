import moment from 'moment'

const Numreg = '[零一壹二贰两三叁四肆五伍六陆七柒八捌九玖十拾百佰千仟万亿\\d]+'

const daysMap = new Map()
daysMap.set('天', 1)
daysMap.set('日', 1)
daysMap.set('d', 1)
daysMap.set('周', 7)
daysMap.set('月', 30)
daysMap.set('年', 365)

const secondsMap = new Map()
secondsMap.set('秒', 1)
secondsMap.set('s', 1)
secondsMap.set('分', 60)
secondsMap.set('m', 60)
secondsMap.set('时', 3600)
secondsMap.set('h', 3600)
secondsMap.set('天', 86400)
secondsMap.set('日', 86400)
secondsMap.set('d', 86400)
secondsMap.set('周', 604800)
secondsMap.set('月', 2592000)
secondsMap.set('年', 31536000)

const numMap = new Map()
numMap.set('一', 1)
numMap.set('壹', 1)
numMap.set('二', 2)
numMap.set('贰', 2)
numMap.set('两', 2)
numMap.set('三', 3)
numMap.set('叁', 3)
numMap.set('四', 4)
numMap.set('肆', 4)
numMap.set('五', 5)
numMap.set('伍', 5)
numMap.set('六', 6)
numMap.set('陆', 6)
numMap.set('七', 7)
numMap.set('柒', 7)
numMap.set('八', 8)
numMap.set('捌', 8)
numMap.set('九', 9)
numMap.set('玖', 9)

/** 对日期的处理操作 */
const UCDate = {

  /**
   * 格式化日期
   * @param {number|object} value 时间戳或moment对象
   */
  format(value) {
    if (value instanceof moment) {
      return value.format('YYYY-MM-DD HH:mm:ss')
    }
    return this.format(moment(value))
  },

  formatMS(value) {
    if (value instanceof moment) {
      return value.format('YYYY-MM-DD HH:mm:ss.SSS')
    }
    return this.formatMS(moment(value))
  },

  /** 获取指定时间后的时间，精确到秒，2012-04-25 00:02:51 */
  getTime(time, unit = 'days') {
    return this.format(moment().add(parseInt(time), unit))
  },

  /** 获取指定时间后的时间，精确到毫秒，2012-04-25 00:02:51.520 */
  getTimeMS(time, unit) {
    return this.formatMS(moment().add(parseInt(time), unit))
  },

  /** 当前日期时间，精确到秒：2012-04-25 00:02:51 */
  get NowTime() {
    return this.getTime()
  },

  /** 当前日期时间，精确到毫秒：2012-04-25 00:02:51.520 */
  get NowTimeMS() {
    return this.getTimeMS()
  },

  /** 当前日期时间数字串，精确到秒：20120425000251 */
  get NowTimeNum() {
    return moment().format('YYYYMMDDHHmmss')
  },

  /** 当前日期时间数字串，精确到毫秒：20120425000251520 */
  get NowTimeNumMS() {
    return moment().format('YYYYMMDDHHmmssSSS')
  },

  /** 当前[日期, 时间]，精确到秒，[年-月-日, 时:分:秒] */
  get date_time() {
    return this.NowTime.split(' ')
  },

  /** 今日日期，2023-12-27 */
  get today() {
    return this.date_time[0]
  },

  /** 昨日日期，2023-12-26 */
  get yesterday() {
    return this.getdate_time(-1)[0]
  },

  /** 当前[日期, 时间]，精确到毫秒，[年-月-日, 时:分:秒.毫秒] */
  get date_timeMS() {
    return this.NowTimeMS.split(' ')
  },

  /** 获取指定天数后的[日期, 时间]，精确到秒，[2012-04-25, 00:02:51] */
  getdate_time(days) {
    return this.getTime(days).split(' ')
  },

  /** 获取指定天数后的[日期, 时间]，精确到毫秒，[2012-04-25, 00:02:51.520] */
  getdate_timeMS(days) {
    return this.getTimeMS(days).split(' ')
  },

  /** 今日距指定天数剩余秒数，0为今日已过秒数 */
  getEXsecondes(days) {
    const EXtime = moment().add(parseInt(days), 'days').format('YYYY-MM-DD 00:00:00')
    return -moment().diff(EXtime, 'seconds')
  },

  /** 今日剩余秒数 */
  get EXsecondes() {
    return this.getEXsecondes(1)
  },

  diff(diffTime, unit = 'ms') {
    const diffDuration = moment.duration(diffTime, unit)
    return {
      Y: diffDuration.years(),
      M: diffDuration.months(),
      D: diffDuration.days(),
      H: diffDuration.hours(),
      m: diffDuration.minutes(),
      s: diffDuration.seconds(),
      // toStr: function () {
      //   const { Y, M, D, H, m, s } = this
      //   const str = `${Y}年${M}个月${D}天${H}小时${m}分钟${s}秒`
      //   const index = str.search(/[1-9]/)
      //   if (index === -1) return 0
      //   const lastIndex = str.search(/\D0(?!.*[1-9])/)
      //   return str.slice(index, lastIndex === -1 ? undefined : lastIndex + 1)
      // }
      toStr: function () {
        const { Y, M, D, H, m, s } = this
        const parts = [Y + '年', M + '个月', D + '天', H + '小时', m + '分钟', s + '秒']
        const result = parts.filter(part => !part.startsWith('0')).join('')
        return result || '0'
      }
    }
  },

  /** 计算日期时间差值，返回{ Y, M, D, h, m, s } */
  diffDate(start_time, end_time) {
    const startDate = moment(start_time, 'YYYY-MM-DD HH:mm:ss')
    const endDate = end_time ? moment(end_time, 'YYYY-MM-DD HH:mm:ss') : moment()
    return this.diff(endDate.diff(startDate))
  },

  /** 获取指定日期(默认当日)到截止日期的天数 */
  getDueDays(deadline, startDate = undefined) {
    return moment(deadline).diff(moment(startDate), 'days')
  },

  /**
   * 计算新日期
   * @param {number} days 加的时长，负则为减
   * @param {string} startDate
   * @returns {string}
   */
  calculateDDL(days, startDate = undefined) {
    return moment(startDate).add(days, 'days').format('YYYY-MM-DD')
  },

  /**
   * 计算新时间
   * @param {number} secondes 加的时长，负则为减
   * @param {string} startDate
   * @returns {string}
   */
  calculateDDLS(secondes, startDate = undefined) {
    return this.format(moment(startDate).add(secondes, 'seconds'))
  },

  /**
   * 汉语数字转阿拉伯数字
   * - 由
   * @author 椰羊
   * - 改造而成
   */
  transformChineseNum(s_123) {
    s_123 = s_123.trim()
    if (!s_123 && s_123 != 0) return s_123
    if (s_123 === '零') return 0
    if (/^\d+$/.test(s_123)) return Number(s_123)
    // 按照亿、万、1分为三组转为string，拼接转为数字
    let split
    split = s_123.split('亿')
    const s_1_23 = split.length > 1 ? split : ['', s_123]
    const s_1 = s_1_23[0]
    const s_23 = s_1_23[1]
    split = s_23.split('万')
    const s_2_3 = split.length > 1 ? split : ['', s_23]
    const s_2 = s_2_3[0]
    const s_3 = s_2_3[1]
    let arr = [s_1, s_2, s_3]
    arr = arr.map(item => {
      item = item.replace('零', '')
      const reg = new RegExp(`[${Array.from(numMap.keys()).join('')}]`, 'g')
      item = item.replace(reg, substring => numMap.get(substring))
      let temp
      temp = /\d(?=千|仟)/.exec(item)
      const num1 = temp ? temp[0] : '0'
      temp = /\d(?=百|佰)/.exec(item)
      const num2 = temp ? temp[0] : '0'
      temp = /\d?(?=十|拾)/.exec(item)
      let num3
      if (temp === null) {
        num3 = '0'
      } else if (temp[0] === '') {
        num3 = '1'
      } else {
        num3 = temp[0]
      }
      temp = /\d$/.exec(item)
      const num4 = temp ? temp[0] : '0'
      return num1 + num2 + num3 + num4
    })
    const result = parseInt(arr.join(''))
    if (result === 0) {
      return NaN
    }
    return result
  },

  /**
   * @description 单位换算→天数
   * @example daysCount('2', '月')
   * @param {string} count 倍数/系数，如20
   * @param {string} unit 计量单位
   */
  daysCount(count, unit) {
    count = parseInt(count)
    unit = daysMap.get(unit.toLowerCase())
    if (!unit) {
      return false
    }
    return count * unit
  },

  /**
   * @description 单位换算→秒数
   * @example daysCount('2', '分')
   * @param {string} count 倍数/系数，如20
   * @param {string} unit 计量单位
   */
  secondsCount(count, unit) {
    count = parseInt(count)
    unit = secondsMap.get(unit.toLowerCase())
    if (!unit) {
      return false
    }
    return count * unit
  },

  /** 年月日是否真实存在 */
  isValidDate(year, month, day) {
    month--
    const date = new Date(year, month, day)
    return (
      date.getFullYear() == year &&
      date.getMonth() == month &&
      date.getDate() == day
    )
  },

  /**
   * 格式化年月日，补全年份、补零日期
   * @param {string} date 日期如 8-1
   * @returns 格式化后的日期如 2023-08-01
   */
  formatDate(date) {
    if (!date) return null
    date = date.replace(/年|月/g, '-').replace('日', '')
    const dateArr = date.split('-')
    const len = dateArr.length
    if (len < 2 || len > 3) {
      return null
    }
    const defaultYear = global.UCPr?.defaultYear ?? '2023'
    const [year, month, day] = len === 3 ? dateArr : [defaultYear, ...dateArr]
    const formattedyear = len === 2 ? defaultYear : year.padStart(4, '20')
    if (!this.isValidDate(formattedyear, month, day)) return null
    const formattedMonth = month.padStart(2, '0')
    const formattedDay = day.padStart(2, '0')
    return `${formattedyear}-${formattedMonth}-${formattedDay}`
  },

  /** 提取消息中的年月日并格式化为 年-月-日 */
  getFormatedDate(msg) {
    return this.formatDate(/((\d{2}|\d{4})(-|年))?\d{1,2}(-|月)\d{1,2}/.exec(msg)?.[0])
  },

  /** 简单汉字时长转天数 */
  transformChineseDays(date) {
    const isHalf = /半/.test(date)
    date = date
      .replace('半', '1')
      .replace('个', '')
      .trim()
    let days = date
    if (isNaN(date.slice(-1))) {
      const numStr = date.match(Numreg)?.[0]
      if (!numStr) return false
      let unit = date.slice(-1)
      if (numStr == date) unit = '天'
      const count = this.transformChineseNum(numStr)
      days = this.daysCount(count, unit)
    }
    if (isHalf) days /= 2
    return parseInt(days)
  },

  /** 简单汉字时长转秒数 */
  transformChineseSeconds(time) {
    if (!time) return false
    const isHalf = /半/.test(time)
    time = time
      .replace('半', '1')
      .replace('个', '')
      .replace('小', '')
      .replace('钟', '')
    let seconds = time
    if (isNaN(time.slice(-1))) {
      const numStr = time.match(Numreg)?.[0]
      if (!numStr) return false
      let unit = time.slice(-1)
      if (numStr == time) unit = '分'
      const count = this.transformChineseNum(numStr)
      seconds = this.secondsCount(count, unit)
    } else {
      seconds = time * 60
    }
    if (isHalf) seconds /= 2
    return parseInt(seconds)
  }

}

export default UCDate