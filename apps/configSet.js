/* eslint-disable brace-style */
import { Path, Check, Data, common, file, UCPr, log } from '../components/index.js'
import { UCPlugin } from '../model/index.js'
import _ from 'lodash'

/** 全局变量Cfg */
let Cfg = {}
/** 全局变量arrTemp */
let arrTemp = {}

function getNewCfg() {
  Cfg = file.YAMLreader(Path.otheryaml)
}

Data.watch(Path.otheryaml, getNewCfg)

const helptext =
  `[UC]configset.js支持指令修改config/other.yaml中所有内容
正则匹配规则如下：
0./^#?(config|UC)(帮助|菜单)$/i
1./^#?(开启|启用|禁用|关闭)(自动)?(同意)?好友申请$/
2./^#?(设置)?(自动)?退群人数(.*)$/
3./^#?(增加|删除)主人(.*)$/
4./^#?(拉黑|解黑)(群)?(.*)$/
5./^#?(加白|解白)(群)?(.*)$/
6./^#?(开启|启用|关闭|禁用)私聊$/
7./^#?设置(私聊禁用|禁用私聊)回复(.*)$/
8./^#?(增加|删除)(私聊)?通行字符串(.*)$/
9./^#?(主人|黑名单群|黑名单|白名单|(私聊)?通行字符串)列表$/
单次指令间隔参数可批量操作
`

export default class UCConfigSet extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-configSet',
      dsc: '指令修改config/other.yaml',
      rule: [
        {
          reg: /^#?config帮助$/i,
          fnc: 'help'
        },
        {
          reg: /^#?(开启|启用|禁用|关闭)(自动)?(同意)?好友申请$/,
          fnc: 'autoFriend'
        },
        {
          reg: /^#?(设置)?(自动)?退群人数\d+$/,
          fnc: 'autoQuit'
        },
        {
          reg: /^#?(增加|删除)主人(.*)/,
          fnc: 'BWset'
        },
        {
          reg: /^#?(拉黑|解黑)(群)?(.*)/,
          fnc: 'BWset'
        },
        {
          reg: /^#?(加白|解白)(群)?(.*)$/,
          fnc: 'BWset'
        },
        {
          reg: /^#?(开启|启用|关闭|禁用)私聊$/,
          fnc: 'disablePrivate'
        },
        {
          reg: /^#?设置(私聊禁用|禁用私聊)回复(.*)/,
          fnc: 'disableMsg'
        },
        {
          reg: /^#?(增加|删除)(私聊)?通行字符串(.+)/,
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
    file.YAMLsaver(Path.otheryaml, Cfg)
  }

  _verify() {
    if (!this.isMaster) {
      this.reply(UCPr.noPerReply)
      return false
    }
    return true
  }

  async help(e) {
    return e.reply(helptext)
  }

  async autoFriend(e) {
    if (!this._verify()) return false
    const newSet = Number(/开启|启用/.test(e.msg))
    const operation = newSet ? '开启' : '关闭'
    if (Cfg.autoFriend == newSet) {
      return e.reply(`自动同意好友申请当前已处于${operation}状态`)
    }
    this.save()
    return e.reply(`成功${operation}自动同意好友申请`)
  }

  async autoQuit(e) {
    if (!this._verify()) return false
    const num = parseInt(e.msg.match(/\d+/)[0])
    Cfg.autoQuit = num
    this.save()
    return e.reply(`自动退群人数已设置为${num}人`)
  }

  async BWset(e) {
    if (!this._verify()) return false
    let type = 0
    const msg = e.msg
    const isAdd = /拉|加/.test(e.msg)
    let mode
    if (/增加/.test(msg)) { type = 1; mode = '主人' }
    else if (/删除/.test(msg)) { type = 2; mode = '主人' }
    else if (/拉黑群/.test(msg)) { type = 3; mode = '黑名单群' }
    else if (/解黑群/.test(msg)) { type = 4; mode = '黑名单群' }
    else if (/拉黑/.test(msg)) { type = 5; mode = '黑名单用户' }
    else if (/解黑/.test(msg)) { type = 6; mode = '黑名单用户' }
    else if (/加白/.test(msg)) { type = 7; mode = '白名单群' }
    else { type = 8; mode = '白名单群' }
    const numMatch = e.msg.match(/\d+/g)
    const len = arrTemp[type]?.length
    log.debug(len)
    log.debug(numMatch)
    if (numMatch.length > 1) {
      let arr = []
      if (!isAdd && numMatch.every(num => num.length < len)) {
        for (let num of numMatch) {
          let _num = arrTemp[type][num - 1]
          if (hy(_num, type)) {
            arr.push(_num)
          }
        }
      } else {
        arr = numMatch.filter(num => num.length >= 5 && num.length <= 10).map(Number)
        if (_.isEmpty(arr)) {
          return e.reply('无有效参数')
        }
        for (let num of arr) {
          hy(num, type)
        }
      }
      this.save()
      return e.reply(`批量${isAdd ? '添加' : '删除'}${mode}成功：\n` + Data.makeArrStr(arr))
    }
    const num = Number(numMatch[0])
    if (hy.call(this, num, type)) {
      return e.reply(`${isAdd ? '添加' : '删除'}${mode}操作成功：\n` + num)
    }
    return e.reply(`操作失败，${mode}中${isAdd ? '已' : '不'}存在：${num}`)
  }

  async disableAdopt(e) {
    if (!this._verify()) return false
    const isAdd = /增加/.test(e.msg)
    const len = Number(arrTemp[9]?.length)
    const str = e.msg.match(/通行字符串(.*)/)[1].trim()
    if (Array.prototype.every.call(str, num => num <= len)) {
      const numMatch = str.match(/\d+/g)
      const strs = []
      for (let num of numMatch) {
        let _str = arrTemp[9]?.[num - 1]
        if (_str && hy(_str, 9)) {
          strs.push(_str)
        }
      }
      this.save()
      return e.reply('成功删除私聊通行字符串：\n' + Data.makeArrStr(strs))
    }
    if (isAdd) {
      if (Check.str(Cfg.disableAdopt, str)) {
        return e.reply(`【${str}】已存在于私聊通行字符串中`)
      }
      Cfg.disableAdopt.push(str)
      this.save()
      return e.reply(`成功添加私聊通行字符串【${str}】`)
    } else {
      return e.reply(hy.call(this, str, 9))
    }
  }

  async disablePrivate(e) {
    if (!this._verify()) return false
    const newSet = /开启|启用/.test(e.msg)
    const operation = newSet ? '开启' : '关闭'
    if (Cfg.disablePrivate === !newSet) {
      return e.reply(`私聊当前已处于${operation}状态`)
    }
    Cfg.disablePrivate = !newSet
    this.save()
    return e.reply(`已${operation}私聊，${newSet ? '现在大家都可以和我聊天啦!' : '现在我私聊只属于主人哦~'}`)
  }

  async disableMsg(e) {
    if (!this._verify()) return false
    const str = e.msg.match(/回复(.*)/)[1]
    Cfg.disableMsg = str
    const status = Cfg.disablePrivate ? '开启' : '关闭'
    this.save()
    return e.reply(`已设置禁用私聊回复内容为：\n【${str}】\n当前已${status}私聊`)
  }

  async dataList(e) {
    if (!this._verify()) return false
    const msg = []
    const operate = (arr, num) => {
      msg.push(Data.makeArrStr(arr))
      arrTemp[num] = _.clone(arr)
    }
    const type = e.msg.match(/(.*)列表/)[1].replace('#', '')
    const help = '，序号删除时用空格间隔不同序号可同时删除多个'
    switch (type) {
      case '主人':
        if (_.isEmpty(Cfg.masterQQ)) {
          return e.reply('我还没有主人哦')
        }
        operate(Cfg.masterQQ, 2)
        msg.push('可以用#增加主人123456和#删除主人+序号或q号增减主人哦' + help)
        break
      case '黑名单群':
        if (_.isEmpty(Cfg.blackGroup)) {
          return e.reply('黑名单群列表为空哦')
        }
        operate(Cfg.blackGroup, 4)
        msg.push('可以用#拉黑群123456和#解黑群+序号或群号增减黑名单群哦' + help)
        break
      case '黑名单':
        if (_.isEmpty(Cfg.blackQQ)) {
          return e.reply('黑名单列表为空哦')
        }
        operate(Cfg.blackQQ, 6)
        msg.push('可以用#拉黑123456和#解黑+序号或q号增减黑名单用户哦' + help)
        break
      case '白名单':
        if (_.isEmpty(Cfg.whiteGroup)) {
          return e.reply('白名单列表为空哦')
        }
        operate(Cfg.whiteGroup, 8)
        msg.push('可以用#加白123456和#解白+序号或群号\n增减白名单群哦' + help)
        break
      case '通行字符串':
      case '私聊通行字符串':
        if (_.isEmpty(Cfg.disableAdopt)) {
          return e.reply('通行字符串列表为空哦')
        }
        operate(Cfg.disableAdopt, 9)
        msg.push('可以用#增加通行字符串XXX和#删除通行字符串+序号或XXX\n增删私聊通行字符串哦' + help)
        break
      default:
        return e.reply('未知错误')
    }
    const title = type + '列表'
    const replyMsg = await common.makeForwardMsg(e, [title, ...msg], title)
    return e.reply(replyMsg)
  }

}

function hy(num, type) {
  num = parseInt(num)
  if (!num) return false
  switch (type) {
    case 1:// 增加主人
      if (!Check.str(Cfg.masterQQ, num)) {
        Cfg.masterQQ.push(num)
        break
      }
      return false
    case 2:// 删除主人
      if (Check.str(Cfg.masterQQ, num)) {
        Data.remove(Cfg.masterQQ, num)
        break
      }
      return false
    case 3:// 拉黑群
      if (!Check.str(Cfg.blackGroup, num)) {
        Cfg.blackGroup.push(num)
        break
      }
      return false
    case 4:// 解黑群
      if (Check.str(Cfg.blackGroup, num)) {
        Data.remove(Cfg.blackGroup, num)
        break
      }
      return false
    case 5:// 拉黑
      if (!Check.str(Cfg.blackQQ, num)) {
        Cfg.blackQQ.push(num)
        break
      }
      return false
    case 6:// 解黑
      if (Check.str(Cfg.blackQQ, num)) {
        Data.remove(Cfg.blackQQ, num)
        break
      }
      return false
    case 7:// 增加白名单群
      if (!Check.str(Cfg.whiteGroup, num)) {
        Cfg.whiteGroup.push(num)
        break
      }
      return false
    case 8:// 删除白名单群
      if (Check.str(Cfg.whiteGroup, num)) {
        Data.remove(Cfg.whiteGroup, num)
        break
      }
      return false
    case 9:// 删除私聊通行字符串
      if (Check.str(Cfg.disableAdopt, num)) {
        Data.remove(Cfg.disableAdopt, num)
        break
      }
      return false
    default:
      log.error('[configSet]未知错误')
      return false
  }
  this?.save()
  return true
}