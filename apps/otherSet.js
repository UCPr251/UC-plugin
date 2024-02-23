/* eslint-disable brace-style */
import { Path, Check, Data, common, file, log } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

/** 全局变量Cfg */
let Cfg = {}
/** 全局变量arrTemp */
const arrTemp = {}

function getNewCfg() {
  Cfg = file.YAMLreader(Path.get('botConfig', 'other.yaml'))
}

Data.watch(Path.get('botConfig', 'other.yaml'), getNewCfg)

export default class UCOtherSet extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-otherSet',
      dsc: '指令修改config/other.yaml',
      rule: [
        {
          reg: /^#?(开启|启用|禁用|关闭)(自动)?(同意)?好友申请$/,
          fnc: 'autoFriend'
        },
        {
          reg: /^#?(设置)?(自动)?退群人数\d+$/,
          fnc: 'autoQuit'
        },
        {
          reg: /^#?(增加|删除)主人.*/,
          fnc: 'BWset'
        },
        {
          reg: /^#?(拉黑|解黑)(群)?.*/,
          fnc: 'BWset'
        },
        {
          reg: /^#?(加白|解白)(群)?.*$/,
          fnc: 'BWset'
        },
        {
          reg: /^#?(开启|启用|关闭|禁用)私聊$/,
          fnc: 'disablePrivate'
        },
        {
          reg: /^#?设置(私聊禁用|禁用私聊)回复.*/,
          fnc: 'disableMsg'
        },
        {
          reg: /^#?(增加|删除)(私聊)?通行字符串.+/,
          fnc: 'disableAdopt'
        },
        {
          reg: /^#?(主人|黑名单群?|白名单|(私聊)?通行字符串)列表$/,
          fnc: 'dataList'
        }
      ]
    })
    this.init = getNewCfg
  }

  save() {
    file.YAMLsaver(Path.get('botConfig', 'other.yaml'), Cfg)
  }

  async autoFriend() {
    if (!this.verifyLevel(4)) return false
    const newSet = Number(/开启|启用/.test(this.msg))
    const operation = newSet ? '开启' : '关闭'
    if (Cfg.autoFriend == newSet) {
      return this.reply(`自动同意好友申请当前已处于${operation}状态`)
    }
    Cfg.autoFriend = newSet
    this.save()
    return this.reply(`成功${operation}自动同意好友申请`)
  }

  async autoQuit() {
    if (!this.verifyLevel(4)) return false
    const num = parseInt(this.msg.match(/\d+/)[0])
    Cfg.autoQuit = num
    this.save()
    return this.reply(`自动退群人数已设置为${num}人`)
  }

  async BWset() {
    if (!this.verifyLevel(4)) return false
    let type = 0
    const msg = this.msg
    const isAdd = /拉|加/.test(this.msg)
    let mode
    if (/增加/.test(msg)) { type = 1; mode = '主人' }
    else if (/删除/.test(msg)) { type = 2; mode = '主人' }
    else if (/拉黑群/.test(msg)) { type = 3; mode = '黑名单群' }
    else if (/解黑群/.test(msg)) { type = 4; mode = '黑名单群' }
    else if (/拉黑/.test(msg)) { type = 5; mode = '黑名单用户' }
    else if (/解黑/.test(msg)) { type = 6; mode = '黑名单用户' }
    else if (/加白/.test(msg)) { type = 7; mode = '白名单群' }
    else { type = 8; mode = '白名单群' }
    const numMatch = this.msg.match(/\d+/g)
    if (!numMatch) return this.reply('请将指令需要操作的q号一同发出')
    const len = arrTemp[type]?.length
    if (numMatch.length > 1) {
      let arr = []
      if (!isAdd && numMatch.every(num => num.length < len)) {
        for (const num of numMatch) {
          const _num = arrTemp[type][num - 1]
          if (this.BWsetRun(_num, type)) {
            arr.push(_num)
          }
        }
      } else {
        arr = numMatch.filter(num => num.length >= 5 && num.length <= 10).map(Number)
        if (!arr.length) return this.reply('无有效参数')
        arr.forEach(num => this.BWsetRun(num, type))
      }
      this.save()
      return this.reply(`批量${isAdd ? '添加' : '删除'}${mode}成功：\n` + Data.makeArrStr(arr))
    }
    const num = Number(numMatch[0])
    if (this.BWsetRun(num, type)) {
      return this.reply(`${isAdd ? '添加' : '删除'}${mode}操作成功：\n` + num)
    }
    return this.reply(`操作失败，${mode}中${isAdd ? '已' : '不'}存在：${num}`)
  }

  async disableAdopt() {
    if (!this.verifyLevel(4)) return false
    const isAdd = /增加/.test(this.msg)
    const str = this.msg.match(/通行字符串(.*)/)[1].trim()
    if (isAdd) {
      if (Check.str(Cfg.disableAdopt, str)) {
        return this.reply(`【${str}】已存在于私聊通行字符串中`)
      }
      Cfg.disableAdopt.push(str)
      this.save()
      return this.reply(`成功添加私聊通行字符串【${str}】`)
    } else {
      const len = arrTemp[9]?.length
      const numMatch = str.match(/\d+/g)
      if (len && numMatch?.length && numMatch.every(num => num <= len)) {
        const strs = []
        for (const num of numMatch) {
          const _str = arrTemp[9]?.[num - 1]
          if (_str && this.BWsetRun(_str, 9)) {
            strs.push(_str)
          }
        }
        this.save()
        return this.reply('成功删除私聊通行字符串：\n' + Data.makeArrStr(strs))
      }
      if (!Check.str(Cfg.disableAdopt, str)) {
        return this.reply(`操作失败，【${str}】不存在于私聊通行字符串中`)
      }
      if (!this.BWsetRun(str, 9)) return this.errorReply()
      return this.reply(`成功删除私聊通行字符串 【${str}】`)
    }
  }

  async disablePrivate() {
    if (!this.verifyLevel(4)) return false
    const newSet = /开启|启用/.test(this.msg)
    const operation = newSet ? '开启' : '关闭'
    if (Cfg.disablePrivate === !newSet) {
      return this.reply(`私聊当前已处于${operation}状态`)
    }
    Cfg.disablePrivate = !newSet
    this.save()
    return this.reply(`已${operation}私聊，${newSet ? '现在大家都可以和我聊天啦!' : '现在我私聊只属于主人哦~'}`)
  }

  async disableMsg() {
    if (!this.verifyLevel(4)) return false
    const str = this.msg.match(/回复(.*)/)[1]
    Cfg.disableMsg = str
    const status = Cfg.disablePrivate ? '开启' : '关闭'
    this.save()
    return this.reply(`已设置禁用私聊回复内容为：\n【${str}】\n当前已${status}私聊`)
  }

  async dataList() {
    if (!this.verifyLevel(4)) return false
    const msg = []
    const operate = (arr, num) => {
      msg.push(Data.makeArrStr(arr))
      arrTemp[num] = _.clone(arr)
    }
    const type = this.msg.match(/(.*)列表/)[1].replace('#', '')
    switch (type) {
      case '主人':
        if (_.isEmpty(Cfg.masterQQ)) {
          return this.reply('我还没有主人哦')
        }
        operate(Cfg.masterQQ, 2)
        msg.push('可以用\n#增加主人123456\n#删除主人+序号或q号\n增减主人哦')
        break
      case '黑名单群':
        if (_.isEmpty(Cfg.blackGroup)) {
          return this.reply('黑名单群列表为空哦')
        }
        operate(Cfg.blackGroup, 4)
        msg.push('可以用\n#拉黑群123456\n#解黑群+序号或群号\n增减黑名单群哦')
        break
      case '黑名单':
        if (_.isEmpty(Cfg.blackQQ)) {
          return this.reply('黑名单列表为空哦')
        }
        operate(Cfg.blackQQ, 6)
        msg.push('可以用\n#拉黑123456\n#解黑+序号或q号\n增减黑名单用户哦')
        break
      case '白名单':
        if (_.isEmpty(Cfg.whiteGroup)) {
          return this.reply('白名单列表为空哦')
        }
        operate(Cfg.whiteGroup, 8)
        msg.push('可以用\n#加白123456\n解白+序号或群号\n增减白名单群哦')
        break
      case '通行字符串':
      case '私聊通行字符串':
        if (_.isEmpty(Cfg.disableAdopt)) {
          return this.reply('通行字符串列表为空哦')
        }
        operate(Cfg.disableAdopt, 9)
        msg.push('可以用\n#增加通行字符串XXX\n#删除通行字符串+序号或XXX\n增删私聊通行字符串哦')
        break
      default:
        return this.reply('未知错误')
    }
    msg.push('序号删除时用空格间隔不同序号可同时删除多个')
    const title = type + '列表'
    const replyMsg = await common.makeForwardMsg(this.e, [title, ...msg], title)
    return this.reply(replyMsg)
  }

  BWsetRun(num, type) {
    if (!num) return false
    if (!isNaN(num)) {
      num = parseInt(num)
    }
    switch (type) {
      case 1:// 增加主人
        if (!Check.str(Cfg.masterQQ, num)) {
          Cfg.masterQQ.push(num)
          break
        }
        return false
      case 2:// 删除主人
        if (_.remove(Cfg.masterQQ, v => v == num).length) break
        return false
      case 3:// 拉黑群
        if (!Check.str(Cfg.blackGroup, num)) {
          Cfg.blackGroup.push(num)
          break
        }
        return false
      case 4:// 解黑群
        if (_.remove(Cfg.blackGroup, v => v == num).length) break
        return false
      case 5:// 拉黑
        if (!Check.str(Cfg.blackQQ, num)) {
          Cfg.blackQQ.push(num)
          break
        }
        return false
      case 6:// 解黑
        if (_.remove(Cfg.blackQQ, v => v == num).length) break
        return false
      case 7:// 增加白名单群
        if (!Check.str(Cfg.whiteGroup, num)) {
          Cfg.whiteGroup.push(num)
          break
        }
        return false
      case 8:// 删除白名单群
        if (_.remove(Cfg.whiteGroup, v => v == num).length) break
        return false
      case 9:// 删除私聊通行字符串
        if (_.remove(Cfg.disableAdopt, v => v == num).length) break
        return false
      default:
        log.error('[configSet]未知错误')
        return false
    }
    this.save()
    return true
  }
}