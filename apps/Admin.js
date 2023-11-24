import { Check, Data, common, Admin, UCPr, Path, log } from '../components/index.js'
import { UCPlugin, Help, Cfg } from '../model/index.js'
import { judgeProperty } from '../components/Admin.js'
import { cfgData } from '../components/UCPr.js'

const map = new Map()
map.set(0, '无权限')
map.set(1, '管理权限')
map.set(2, '主人权限')

export default class UCAdmin extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-Admin',
      dsc: 'UC插件管理系统',
      rule: [
        {
          reg: /^#?UC(设置|(增|添)?加|删除?|减)(主人|黑名单|白名单).*/i,
          fnc: 'arr'
        },
        {
          reg: /^#?UC(全局)?(设置|(增|添)?加|删除?|减)管理(\d+)?(\s+\d+)?$/i,
          fnc: 'ADadmin'
        },
        {
          reg: /^#?UC管理员?列表$/i,
          fnc: 'AdminList'
        },
        {
          reg: /^#?UC(主人|黑名单|白名单)列表$/i,
          fnc: 'list'
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
          reg: /^#?UC(帮助|help)$/i,
          fnc: 'UC_HELP'
        },
        {
          reg: new RegExp(`^#?UC设置\\s*(${Cfg.groupReg})?.*`, 'i'),
          fnc: 'UC_CFG'
        }
      ]
    })
  }

  get mode() {
    if (/主人/.test(this.e.msg)) {
      return { type: 'Master', name: '主人' }
    }
    if (/管理/.test(this.e.msg)) {
      return { type: 'Admin', name: '管理' }
    }
    if (/黑名单/.test(this.e.msg)) {
      return { type: 'BlackQQ', name: '黑名单' }
    }
    if (/白名单/.test(this.e.msg)) {
      return { type: 'WhiteQQ', name: '白名单' }
    }
    return false
  }

  async arr(e) {
    if (e.atme || !this.isMaster) return false
    e.msg = Data.formatMsg(e)
    const userId = e.at || e.msg.match(/\d{5,10}/g)
    if (!userId) return e.reply('请艾特或指定要操作的对象')
    const { type, name } = this.mode
    const isAdd = /设置|加/.test(e.msg)
    if (Array.isArray(userId)) {
      const filter = userId.filter(user => isAdd ^ Check.str(UCPr[type], user))
      Admin.arr(type, filter, isAdd)
      return e.reply(`操作成功：批量${isAdd ? '添加' : '删除'}${filter.length}个${name}`)
    }
    if (isAdd === Check.str(UCPr[type], userId)) {
      return e.reply(`${name}中${isAdd ? '已经' : '不'}存在<${userId}>`)
    }
    Admin.arr(type, userId, isAdd)
    return e.reply(`操作成功，${name}新增用户<${userId}>`)
  }

  async ADadmin(e) {
    if (e.atme || !this.isMaster) return false
    e.msg = Data.formatMsg(e)
    const numMatch = e.msg.match(/\d+/g)
    const global = (e.isPrivate && numMatch?.length === 1) ? true : /全局/.test(e.msg)
    const isAdd = /设置|加/.test(e.msg)
    if (!e.at && !numMatch) return e.reply('请艾特或指定需要操作的对象')
    /** 优先指定，指定/本群 */
    const groupId = global ? undefined : e.at ? (numMatch?.[0] || e.group_id) : (numMatch?.[1] || e.group_id)
    if (!isNaN(groupId) && (groupId.toString().length < 7 || groupId.toString().length > 10)) {
      return e.reply(`群号<${groupId}>格式错误，请检查`)
    }
    const userId = e.at || numMatch[0]
    if (userId.toString().length < 5 || userId.toString().length > 10) {
      return e.reply(`用户<${userId}>格式错误，请检查`)
    }
    const info = UCPr.Admin[userId]
    if (Check.str(UCPr.AdminArr, userId)) {
      if (isAdd) {
        if (info === false) return e.reply(`操作失败，<${userId}>当前已经是全局管理`)
        if (groupId && Check.str(info, groupId)) return e.reply(`操作失败，<${userId}>已拥有群<${groupId}>的管理权限`)
      } else {
        if (groupId && info === false) return e.reply(`操作失败，<${userId}>为全局管理，请使用#UC全局删管理`)
        if (groupId && !Check.str(info, groupId)) return e.reply(`操作失败，<${userId}>没有群<${groupId}>的管理权限`)
        if (global && info) return e.reply(`操作失败，<${userId}>不是全局管理`)
      }
    } else {
      if (!isAdd && info === undefined) return e.reply(`操作失败，<${userId}>没有管理权限，无需删除`)
    }
    if (e.isPrivate && groupId === undefined && !isAdd) {
      Admin.ADadmin(userId, isAdd, false)
      return e.reply(`成功删除管理<${userId}>`)
    }
    const independent = global ? false : Number(groupId)
    if (Admin.ADadmin(userId, isAdd, independent)) {
      return e.reply(`成功${isAdd ? '设置' : '删除'}UC插件${`群${groupId}` || '全局'}管理：<${userId}>`)
    }
    return e.reply(UCPr.error)
  }

  async AdminList(e) {
    if (!this.isMaster) return false
    const { global, normal } = Admin.AdminList
    const title = `${UCPr.Plugin_Name}管理列表如下`
    const replyMsg = await common.makeForwardMsg(e, ['全局管理', Data.empty(global), '指定群管理', Data.empty(normal)], title)
    return e.reply(replyMsg, false)
  }

  async list(e) {
    if (!this.isMaster) return false
    const { type, name } = this.mode
    const list = UCPr[type]
    if (!list) return e.reply(UCPr.error)
    if (list.length === 0) return e.reply(name + '列表为空')
    const chunkedList = Data.makeArrStr(list, { chunkSize: 50 })
    const title = `UC插件${name}列表，总计${list.length}`
    const replyMsg = await common.makeForwardMsg(e, [title, ...chunkedList], title)
    return e.reply(replyMsg)
  }

  async searchUser(e) {
    if (e.atme || !this.isMaster) return false
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
    if (!this.isMaster) return false
    if (/删除/.test(e.msg)) {
      Data.delErrorLog()
      return e.reply('删除成功')
    }
    const errorLog = Data.getLogArr(Path.errorLogjson, { num: 30 })
    if (!errorLog) return e.reply('当前无错误日志哦~')
    const replyMsg = await common.makeForwardMsg(e, errorLog, '错误日志')
    return e.reply(replyMsg, false)
  }

  async UC_HELP(e) {
    if (this.isBlack) return false
    const data = Help.get(e)
    if (!data) return
    return await common.render(e, data)
  }

  async UC_CFG(e) {
    if (!this.isMaster) return false
    // #UC设置str1 str2 str3  str1:含设置组类 str2:含组内设置 str3:含修改值
    const str1 = e.msg.replace(/#?UC设置/i, '').trim()
    const group = new RegExp(Cfg.groupReg, 'i').exec(str1)?.[0] ?? ''
    log.debug('修改设置group：' + group)
    const str2 = str1.replace(group, '').trim()
    const set = Cfg.settingReg(group).exec(str2)?.[0] ?? ''
    log.debug('修改设置set：' + set)
    if (group || set) {
      const setData = cfgData[group]?.cfg?.[set]
      log.debug(setData)
      if (setData) {
        let operation
        const str3 = str2.replace(set, '').trim()
        if (setData.type === 'switch') {
          if (/开启|启动/.test(str3)) operation = true
          else if (/关闭|禁用/.test(str3)) operation = false
        } else if (setData.type === 'num') {
          if (setData.input) {
            const setNum = setData.input(str3)
            if (setNum || setNum === 0) {
              operation = setData.input(str3)
            } else {
              operation = setData.def
            }
          } else {
            operation = parseInt(str3.match(/\d+/)?.[0] ?? setData.def)
          }
        } else if (setData.type === 'power') {
          const numMatch = str3.match(/0|1/g)
          if (numMatch && numMatch.length === setData.options?.length) {
            for (const i in numMatch) {
              Admin.set(setData.path + judgeProperty[setData.options[i]], numMatch[i] === '1', { isReply: false })
            }
          }
        } else {
          if (setData.input) {
            operation = setData.input(str3)
          } else {
            operation = str3
          }
        }
        if (operation !== undefined) {
          Admin.set(setData.path, operation, { isReply: false })
        }
      }
      // 等等更健康
      await common.sleep(0.1)
    }
    const data = Cfg.get(e)
    if (!data) return
    return await common.render(e, data)
  }

}