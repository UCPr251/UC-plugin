/* eslint-disable brace-style */
import { Path, Check, Data, common, file, log } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

/** 当前other.yaml */
let Cfg = {}

function getCfg() {
  Cfg = file.YAMLreader(Path.get('botConfig', 'other.yaml'))
}

function saveCfg() {
  file.YAMLsaver(Path.get('botConfig', 'other.yaml'), Cfg)
}

Data.watch(Path.get('botConfig', 'other.yaml'), getCfg)

const typeMap = new Map()
typeMap.set('主人', 'masterQQ')
typeMap.set('黑名单群', 'blackGroup')
typeMap.set('黑名单', 'blackQQ')
typeMap.set('白名单群', 'whiteGroup')
typeMap.set('白名单', 'whiteQQ')
typeMap.set('通行字符串', 'disableAdopt')
typeMap.set('私聊', 'disablePrivate')
typeMap.set('频道', 'disableGuildMsg')

const listMap = new Map()
listMap.set('主人', 'masterQQ')
listMap.set('黑群', 'blackGroup')
listMap.set('黑', 'blackQQ')
listMap.set('白群', 'whiteGroup')
listMap.set('白', 'whiteQQ')
listMap.set('通行字符串', 'disableAdopt')

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
          reg: /^#?设置(自动)?退群人数\d+$/,
          fnc: 'autoQuit'
        },
        {
          reg: /^#?(增?加|删除?)(主人|(私聊)?通行字符串)/,
          fnc: 'ListSet'
        },
        {
          reg: /^#?(拉黑|解黑)群?/,
          fnc: 'ListSet'
        },
        {
          reg: /^#?(加白|解白)群?/,
          fnc: 'ListSet'
        },
        {
          reg: /^#?(开启|启用|关闭|禁用)(私聊|频道)$/,
          fnc: 'disablePrivate'
        },
        {
          reg: /^#?设置(私聊禁用|禁用私聊)回复/,
          fnc: 'disableMsg'
        },
        {
          reg: /^#?(主人|黑名单群?|白名单群?|(私聊)?通行字符串)列表$/,
          fnc: 'dataList'
        }
      ]
    })
    this.init = getCfg
  }

  async autoFriend() {
    if (!this.verifyLevel(4)) return
    const newSet = Number(/开启|启用/.test(this.msg))
    const operation = newSet ? '开启' : '关闭'
    if (Cfg.autoFriend == newSet) {
      return this.reply(`自动同意好友申请当前已处于${operation}状态`)
    }
    Cfg.autoFriend = newSet
    saveCfg()
    return this.reply(`成功${operation}自动同意好友申请`)
  }

  async autoQuit() {
    if (!this.verifyLevel(4)) return
    const num = parseInt(this.msg.match(/\d+/)[0])
    Cfg.autoQuit = num
    saveCfg()
    return this.reply(`自动退群人数已设置为${num}人`)
  }

  async ListSet() {
    if (!this.verifyLevel(4)) return
    const isAdd = /拉|加/.test(this.msg)
    const operation = isAdd ? '增加' : '删除'
    const type = listMap.get(Array.from(listMap.keys()).find(v => this.msg.includes(v)))
    const mode = _.find([...typeMap], v => v[1] === type)[0]
    log.debug(mode, type)
    const match = (this.msg.includes('通行字符串') ? this.msg.match(/通行字符串(.+)/)?.[1].trim().split(/\s+/) : this.msg.match(/\d{5,11}/g)?.map(Number)) ?? []
    if (!match.length) {
      if (isAdd) return false // 避免误触，不回复
      const list = Cfg[type]
      if (!list?.length) return this.reply(`当前${mode}列表为空`)
      this.e.data = {
        list,
        fnc: '_ListSet',
        isAdd,
        type,
        mode,
        operation
      }
      this.setUCcontext()
      const title = `请选择需要删除的${mode}序号`
      let replyMsg = [title]
      replyMsg.push(...Data.makeArrStr(list, { chunkSize: 50, length: 3000 }))
      if (replyMsg.length > 2) {
        replyMsg = await common.makeForwardMsg(this.e, replyMsg, title)
      } else {
        replyMsg = replyMsg.join('\n')
      }
      return this.reply(replyMsg)
    }
    return this._ListSet(match, { type, isAdd, mode, operation })
  }

  _ListSet(num, { type, isAdd, mode, operation }) {
    if (!Array.isArray(Cfg[type])) Cfg[type] = []
    const successed = []
    if (isAdd) {
      for (const n of num) {
        if (!Check.str(Cfg[type], n)) {
          Cfg[type].push(n)
          successed.push(n)
        }
      }
    } else {
      const removed = _.remove(Cfg[type], v => Check.str(num, v))
      if (removed.length) successed.push(...removed)
    }
    if (successed.length) {
      saveCfg()
      return this.reply(`成功${operation}${mode}：\n` + Data.makeArrStr(successed))
    }
    return this.reply(`操作失败，${mode}中${isAdd ? '已' : '不'}存在：\n${Data.makeArrStr(num)}`)
  }

  async disablePrivate() {
    if (!this.verifyLevel(4)) return
    const newSet = /开启|启用/.test(this.msg)
    const mode = this.msg.match(/私聊|频道/)[0]
    const type = typeMap.get(mode)
    const operation = newSet ? '开启' : '关闭'
    if (Cfg[type] === !newSet) {
      return this.reply(`${mode}当前已处于${operation}状态`)
    }
    Cfg[type] = !newSet
    saveCfg()
    return this.reply(`已${operation}${mode}，${newSet ? `现在大家都可以和我${mode}聊天啦!` : `现在${mode}的我只属于主人哦~`}`)
  }

  async disableMsg() {
    if (!this.verifyLevel(4)) return
    const str = this.msg.match(/回复(.*)/)[1].trim()
    Cfg.disableMsg = str || null
    const operation = Cfg.disablePrivate ? '开启' : '关闭'
    saveCfg()
    return this.reply(`已设置禁用私聊回复内容为：\n【${str}】\n当前私聊处于${operation}状态中`)
  }

  async dataList() {
    if (!this.verifyLevel(4)) return
    const mode = this.msg.match(Array.from(typeMap.keys()).join('|'))[0]
    const type = typeMap.get(mode)
    log.debug(mode, type)
    const title = `当前${mode}列表`
    if (!Cfg[type]?.length) return this.reply(title + '为空哦~')
    const replyMsg = [title, ...Data.makeArrStr(Cfg[type], { chunkSize: 50, length: 3000 }), '更多操作请查看#UCother帮助']
    const msg = await common.makeForwardMsg(this.e, replyMsg, title)
    return this.reply(msg)
  }

}