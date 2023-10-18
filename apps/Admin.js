import { Check, Data, common, Admin, UCPr } from '../components/index.js'

const map = new Map()
map.set(0, '无权限')
map.set(1, '管理权限')
map.set(2, '主人权限')

export class UCAdmin extends plugin {
  constructor() {
    super({
      name: 'UC-admin',
      dsc: 'UC插件管理系统',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?UC(全局)?(加|删|减)管理(\d+)?(\s+\d+)?$/i,
          fnc: 'Admin'
        },
        {
          reg: /^#?UC(全局)?管理列表$/i,
          fnc: 'AdminList'
        },
        {
          reg: /^#?UC查(\d*)$/i,
          fnc: 'searchUser'
        },
        {
          reg: /^#?UC(删除)?错误日志$/i,
          fnc: 'errorLog'
        },
        {
          reg: /^#?UC设置$/i,
          fnc: 'UC_SET'
        },
        {
          reg: /^#?UC帮助$/i,
          fnc: 'UC_HELP'
        }
      ]
    })
  }

  verify() {
    if (!Check.permission(this.e.sender.user_id, 2)) {
      this.e.reply(UCPr.noPerReply, true)
      return false
    }
    return true
  }

  async Admin(e) {
    if (e.atme || !this.verify()) return false
    e.msg = Data.formatMsg(e)
    const global = /全局/.test(e.msg)
    const isAdd = /加/.test(e.msg)
    const numMatch = e.msg.match(/\d+/g)
    if (!e.at && !numMatch) return e.reply('请艾特或指定需要加减的管理')
    /** 优先指定，指定/本群 */
    const groupId = global ? undefined : e.at ? (numMatch?.[0] || e.group_id) : (numMatch?.[1] || e.group_id)
    if (!isNaN(groupId) && (groupId.toString().length < 7 || groupId.toString().length > 10)) {
      return e.reply(`群号${groupId}格式错误，请检查`)
    }
    const userId = e.at || numMatch[0]
    if (userId.toString().length < 5 || userId.toString().length > 10) {
      return e.reply(`用户id：${userId}格式错误，请检查`)
    }
    const info = UCPr.Admin[userId]
    if (Check.str(UCPr.AdminArr, userId)) {
      if (isAdd) {
        if (info === false) return e.reply(`操作失败，${userId}当前已经是全局管理`)
        if (groupId && Check.str(info, groupId)) return e.reply(`操作失败，${userId}已拥有群${groupId}的管理权限`)
      } else {
        if (groupId && info === false) return e.reply(`操作失败，${userId}为全局管理，请确认后使用指令#全局删管理`)
        if (groupId && !Check.str(info, groupId)) return e.reply(`操作失败，${userId}没有群${groupId}的管理权限`)
        if (global && info) return e.reply(`操作失败，${userId}不是全局管理`)
      }
    } else {
      if (!isAdd && info === undefined) return e.reply(`操作失败，${userId}没有管理权限，无需删除`)
    }
    if (e.isPrivate && groupId === undefined && !isAdd) {
      Admin.Admin(userId, isAdd, false)
      return e.reply('成功删除管理：' + userId)
    }
    Admin.Admin(userId, isAdd, global ? false : Number(groupId))
    return e.reply(`${isAdd ? '增加' : '删除'}群${groupId || '全局'}超管成功：${userId}`)
  }

  async AdminList(e) {
    if (!this.verify()) return false
    const { global, normal } = Admin.AdminList()
    const title = `${UCPr.Plugin_Name}管理列表如下`
    const replyMsg = await common.makeForwardMsg(e, ['全局管理', Data.empty(global), '指定群管理', Data.empty(normal)], title)
    return e.reply(replyMsg, false)
  }

  async searchUser(e) {
    if (e.atme || !this.verify()) return false
    const numMatch = e.msg.match(/\d+/)
    const userId = e.at || numMatch?.[0]
    if (!userId) return e.reply('请艾特或指定需要查询的用户')
    const isBlack = Check.str(UCPr.BlackQQ, userId)
    const userPermission = Check.permission(userId)
    let replyMsg = `用户${userId}：${map.get(userPermission)}`
    if (userPermission === 1) {
      let info = UCPr.Admin[userId]
      replyMsg += `\n权限范围：${info ? info.join('、') : '全局管理'}`
    }
    if (userPermission !== 2) replyMsg += '\n黑名单：' + isBlack
    return e.reply(replyMsg)
  }

  async errorLog(e) {
    if (!this.verify()) return false
    if (/删除/.test(e.msg)) {
      Data.delErrorLog()
      return e.reply('删除成功')
    }
    const errorLog = Data.getErrorLogArr()
    if (!errorLog) return e.reply('当前无错误日志哦~')
    const replyMsg = await common.makeForwardMsg(e, errorLog, '错误日志')
    return e.reply(replyMsg, false)
  }

  async UC_SET(e) {
    if (!this.verify()) return false
  }

  async UC_HELP(e) {
  }

}