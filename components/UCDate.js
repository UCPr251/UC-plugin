import moment from 'moment'

const Numreg = '[零一壹二两三四五六七八九十百千万亿\\d]+'

const daysMap = new Map()
daysMap.set('天', 1)
daysMap.set('日', 1)
daysMap.set('周', 7)
daysMap.set('月', 30)
daysMap.set('年', 360)

const numMap = new Map()
numMap.set('一', 1)
numMap.set('壹', 1)
numMap.set('二', 2)
numMap.set('两', 2)
numMap.set('三', 3)
numMap.set('四', 4)
numMap.set('五', 5)
numMap.set('六', 6)
numMap.set('七', 7)
numMap.set('八', 8)
numMap.set('九', 9)

/** 对日期的处理操作 */
const UCDate = {

  /** 当前日期时间：2023-07-31 03:57:00 */
  get NowTime() {
    return moment().format('YYYY-MM-DD HH:mm:ss')
  },

  /** 当前日期时间数字串：20230731035700 */
  get NowTimeNum() {
    return moment().format('YYYYMMDDHHmmss')
  },

  /** 当前[日期, 时间]，[年-月-日, 时:分:秒] */
  get date_time() {
    return this.NowTime.split(' ')
  },

  /** 今天剩余秒数 */
  get EXsecondes() {
    const EXtime = moment().add(1, 'days').format('YYYY-MM-DD 00:00:00')
    return -moment().diff(EXtime, 'seconds')
  },

  /** 计算时间差值，返回{ Y, M, D, h, m, s } */
  diff(start_time, end_time) {
    const startDate = moment(start_time, 'YYYY-MM-DD HH:mm:ss')
    const endDate = end_time ? moment(end_time, 'YYYY-MM-DD HH:mm:ss') : moment()
    const diffDuration = moment.duration(endDate.diff(startDate))
    const Y = diffDuration.years()
    const M = diffDuration.months()
    const D = diffDuration.days()
    const h = diffDuration.hours()
    const m = diffDuration.minutes()
    const s = diffDuration.seconds()
    return { Y, M, D, h, m, s }
  },

  /** 时间差描述字符串，精确到分 */
  diffStr(start_time, end_time) {
    const { Y, M, D, h, m } = this.diff(start_time, end_time)
    const str = `${Y}年${M}个月${D}天${h}小时${m}分钟`
    return str.slice(str.match(/[1-9]/)?.index || 0)
  },

  /**
   * 汉语数字转阿拉伯数字
   * @author 椰羊
   */
  translateChinaNum(s_123) {
    if (!s_123 && s_123 != 0) return s_123
    if (s_123 == '零') return 0
    if (/^\d+$/.test(s_123)) return Number(s_123)
    let split = ''
    split = s_123.split('亿')
    let s_1_23 = split.length > 1 ? split : ['', s_123]
    let s_23 = s_1_23[1]
    let s_1 = s_1_23[0]
    split = s_23.split('万')
    let s_2_3 = split.length > 1 ? split : ['', s_23]
    let s_2 = s_2_3[0]
    let s_3 = s_2_3[1]
    let arr = [s_1, s_2, s_3]
    arr = arr.map(item => {
      let result = ''
      result = item.replace('零', '')
      let reg = new RegExp(`[${Array.from(numMap.keys()).join('')}]`, 'g')
      result = result.replace(reg, substring => {
        return numMap.get(substring)
      })
      let temp
      temp = /\d(?=千)/.exec(result)
      let num1 = temp ? temp[0] : '0'
      temp = /\d(?=百)/.exec(result)
      let num2 = temp ? temp[0] : '0'
      temp = /\d?(?=十)/.exec(result)
      let num3
      if (temp === null) {
        num3 = '0'
      } else if (temp[0] === '') {
        num3 = '1'
      } else {
        num3 = temp[0]
      }
      temp = /\d$/.exec(result)
      let num4 = temp ? temp[0] : '0'
      return num1 + num2 + num3 + num4
    })
    if (parseInt(arr.join('')) == 0) { // 非汉语数字
      return NaN
    }
    return parseInt(arr.join(''))
  },

  /**
   * @description 单位换算→天数，示例：daysCount('2', '月')
   * @param {string} count 倍数/系数，如20
   * @param {string} unit 计量单位
   */
  daysCount(count, unit) {
    count = parseInt(count)
    unit = daysMap.get(unit)
    if (!unit) {
      return false
    }
    return count * unit
  },

  /**
   * 格式化年月日，补全年份、补零日期
   * @param {string} date 日期如8-1
   * @returns 格式化后的日期
   */
  formatMonthDay(date) {
    date = date.replace(/年|月|日/g, '-')
    const dateArr = date.split('-')
    const len = dateArr.length
    if (len < 2 || len > 3) {
      return NaN
    }
    const [year, month, day] = len == 3 ? dateArr : ['2023', ...dateArr]
    const formattedyear = (len == 2 && month < 8) ? '2024' : year.padStart(4, '20')
    const formattedMonth = month.padStart(2, '0')
    const formattedDay = day.padStart(2, '0')
    return `${formattedyear}-${formattedMonth}-${formattedDay}`
  },

  /** 汉字时长转纯数字 */
  calculateTime(date) {
    if (isNaN(date.slice(-1))) { // 非纯数字
      const numStrMatch = date.match(Numreg)// 三 三十
      if (!numStrMatch) {
        return false
      }
      const numStr = numStrMatch[0] // 三 三十
      let unit = date.slice(-1)
      if (numStr == date) { // 三 != 三月 ； 三十 == 三十
        unit = '天'
      }
      const count = this.translateChinaNum(numStr)
      return this.daysCount(count, unit) // 3*30，最终加的时间
    }
    return parseInt(date)
  }

}

export default UCDate