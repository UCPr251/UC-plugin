import { Check, Data, common, Admin, UCPr, Path, log } from '../components/index.js'
import { UCPlugin, Help, Cfg } from '../models/index.js'
import { judgeProperty } from '../components/Admin.js'
import _ from 'lodash'

export default class UCAdmin extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-Admin',
      dsc: 'UC插件管理系统',
      rule: [
        {
          reg: /^#?UC((增|添)?加|删除?|减)(主人|黑名单|管理员?)(\s*\d{5,10}){0,2}$/i,
          fnc: 'groupPermission'
        },
        {
          reg: /^#?UC(拉|加|解|删)黑(\d{5,10})?(\s+\d{5,10})?$/i,
          fnc: 'groupPermission'
        },
        {
          reg: /^#?UC全局((增|添)?加|删除?|减)(主人|黑名单|管理员?).*/i,
          fnc: 'globalPermission'
        },
        {
          reg: /^#?UC全局(拉|加|解|删)黑.*/i,
          fnc: 'globalPermission'
        },
        {
          reg: /^#?UC(全局)?(主人|管理员?|黑名单)列表(\d{5,10})?$/i,
          fnc: 'permissionList'
        },
        {
          reg: /^#?UC查\s*\d*$/i,
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
          reg: /^#?UC(全局)?(群管)?设置\s*.*/i,
          fnc: 'UC_CFG'
        },
        {
          reg: /^#?UC(锁定|解锁)设置.*/i,
          fnc: 'lockConfig'
        }
      ]
    })
  }

  getInfo() {
    if (/主人/.test(this.msg)) {
      return { type: 'Master', name: '主人', need: 4 }
    }
    if (/管理/.test(this.msg)) {
      return { type: 'Admin', name: '管理', need: 3 }
    }
    if (/黑/.test(this.msg)) {
      return { type: 'BlackQQ', name: '黑名单', need: 1 }
    }
    return false
  }

  async groupPermission(e) {
    if (e.atme) return false
    const { type, name, need } = this.getInfo()
    if (!this.verifyLevel(need)) return false
    const numMatch = this.msg.match(/\d{5,10}/g) ?? []
    const userId = this.at ?? numMatch[0]
    if (!userId) return this.reply('请艾特或指定要操作的对象')
    const groupId = this.GM ? ((this.at ? numMatch[0] : numMatch[1]) ?? this.groupId) : this.groupId
    if (!groupId) return this.reply('请同时指定要设置的群')
    const isAdd = /设置|加|拉/.test(this.msg)
    if (!Check.file(Admin.getCfgPath(groupId))) {
      Admin.newConfig(groupId)
      await common.sleep(0.1)
    }
    if (isAdd === Check.str(UCPr.groupCFG(groupId).permission[type], userId)) {
      return this.reply(`群聊${groupId}${name}中${isAdd ? '已经' : '不'}存在<${userId}>`)
    }
    Admin.newConfig(groupId)
    Admin.groupPermission(type, userId, groupId, isAdd)
    return this.reply(`操作成功，群聊${groupId}${isAdd ? '新增' : '删除'}${name}<${userId}>`)
  }

  async globalPermission(e) {
    if (e.atme) return false
    const { type, name, need } = this.getInfo()
    if (!this.verifyLevel(need)) return false
    const isAdd = /设置|加|拉/.test(this.msg)
    const numMatch = this.msg.match(/\d{5,10}/g)
    if (numMatch && numMatch.length > 1) {
      const filter = numMatch.filter(userId => isAdd !== Check.str(UCPr[`Global${type}`], userId))
      const allready = _.difference(numMatch, filter)
      const replyMsg = []
      if (filter.length) {
        Admin.globalPermission(type, filter, isAdd)
        const infoMsg = Data.makeArrStr(filter, { length: 500 })
        replyMsg.push(`全局${name}批量${isAdd ? '新增' : '删除'}：\n${infoMsg}`)
      }
      if (allready.length) {
        const infoMsg = Data.makeArrStr(allready, { length: 500 })
        replyMsg.push(`以下用户${isAdd ? '已经' : '不'}存在于全局${name}中：\n${infoMsg}`)
      }
      return this.reply(replyMsg.join('\n\n'))
    }
    const userId = this.at ?? numMatch?.[0]
    if (_.isEmpty(userId)) return this.reply('请艾特或指定要操作的对象')
    if (isAdd === Check.str(UCPr[`Global${type}`], userId)) {
      return this.reply(`全局${name}中${isAdd ? '已经' : '不'}存在<${userId}>`)
    }
    Admin.globalPermission(type, userId, isAdd)
    return this.reply(`操作成功，全局${name}${isAdd ? '新增' : '删除'}<${userId}>`)
  }

  /** 按照全局或群查找 */
  async permissionList(e) {
    const { type, name, need } = this.getInfo()
    if (!this.verifyLevel(need > 3 ? 3 : need)) return false
    const numMatch = this.msg.match(/\d+/)
    const groupId = (this.GM ? numMatch?.[0] : this.groupId) ?? this.groupId
    const title = `UC插件${name}列表`
    let replyMsg
    if ((/全局/.test(this.msg) || !groupId) && this.level === 4) {
      const { global, globalLen, group, groupLen } = Admin.permissionList(type)
      const info = title + `\n总计${globalLen}个全局${name}\n${groupLen}个群${name}配置`
      replyMsg = await common.makeForwardMsg(e, [info, '全局：', ...global, '指定群：', ...group], title)
    } else if (!groupId) {
      return this.reply('请指定群号或于群内使用本功能')
    } else {
      const list = UCPr.groupCFG(groupId).permission?.[type]
      if (!list) return this.reply(`群${groupId}尚未生成群配置`)
      if (_.isEmpty(list)) return this.reply(`群聊${groupId}${name}列表为空`)
      const memberObj = await common.getMemberObj(groupId)
      const listInfo = {}
      list.forEach(user => {
        const name = memberObj[user]?.card || memberObj[user]?.nickname || user
        listInfo[name] = user
      })
      const info = Data.makeObjStr(listInfo, { isSort: true, chunkSize: 50 })
      replyMsg = await common.makeForwardMsg(e, [title + `（群${groupId}）`, ...info], title)
    }
    return this.reply(replyMsg)
  }

  async searchUser(e) {
    if (e.atme) return false
    if (!this.verifyLevel(3)) return false
    const numMatch = this.msg.match(/\d+/)
    const userId = this.at || (this.GM ? numMatch?.[0] : undefined)
    if (!userId) return this.reply(`请艾特${this.GM ? '或指定' : ''}需要查询的用户`)
    const level = Check.levelSet(userId, this.groupId)
    const replyMsg = []
    let title = `用户${userId}权限`
    if (!this.GM) {
      if (!Check.file(Admin.getCfgPath(this.groupId))) {
        return this.reply(`群${this.groupId}尚未生成群配置`)
      }
      title += `（群${this.groupId}）\n\n`
      if (level.has(3)) {
        replyMsg.push('群插件主人')
      }
      if (level.has(1)) {
        replyMsg.push('群插件管理')
      }
      if (level.has(-1)) {
        replyMsg.push('群插件黑名单用户')
      }
      return this.reply(title + Data.empty(replyMsg.join('\n')))
    }
    if (level.has(4)) replyMsg.push('全局插件主人')
    if (UCPr.Master[userId]) {
      const info = UCPr.Master[userId]
      replyMsg.push('群插件主人，权限范围：\n\t' + Data.makeArr(info).join('\n\t'))
    }
    if (level.has(2)) replyMsg.push('全局插件管理')
    if (UCPr.Admin[userId]) {
      const info = UCPr.Admin[userId]
      replyMsg.push('群插件管理，权限范围：\n\t' + Data.makeArr(info).join('\n\t'))
    }
    if (level.has(-2)) replyMsg.push('全局插件黑名单用户')
    if (UCPr.BlackQQ[userId]) {
      const info = UCPr.BlackQQ[userId]
      replyMsg.push('群插件黑名单，权限范围：\n\t' + Data.makeArr(info).join('\n\t'))
    }
    if (_.isEmpty(replyMsg)) return this.reply(title + '：无')
    const msg = await common.makeForwardMsg(e, [title, ...replyMsg], title)
    return this.reply(msg)
  }

  async errorLog(e) {
    if (!this.verifyLevel(4)) return false
    if (/删除/.test(this.msg)) {
      Data.delErrorLog()
      return this.reply('删除成功')
    }
    const errorLog = Data.getLogArr(Path.errorLogjson, { num: 30 })
    if (!errorLog) return this.reply('当前无错误日志哦~')
    const replyMsg = await common.makeForwardMsg(e, errorLog, 'UC插件错误日志')
    return this.reply(replyMsg, false)
  }

  async UC_HELP(e) {
    if (!this.verifyLevel()) return false
    const data = Help.get(e, this.groupId)
    if (!data) return
    return common.render(e, data)
  }

  async UC_CFG(e) {
    if (!this.verifyLevel(1)) return false
    // #UC设置str1 str2 str3  str1:含设置组类 str2:含组内设置 str3:含修改值
    let isGlobal = /全局/.test(this.msg)
    if (isGlobal && !this.GM) return false
    const str1 = this.msg.replace(/#?UC(全局)?(群管)?设置/i, '').trim()
    const type = /群管/.test(this.msg) ? 'GAconfig' : 'config'
    const group = new RegExp(Cfg.groupReg(type)).exec(str1)?.[0] ?? ''
    log.debug('修改设置group类：' + group)
    const str2 = str1.replace(group, '').trim()
    const set = Cfg.setReg(type, group).exec(str2)?.[0] ?? ''
    log.debug('修改设置set类：' + set)
    const str3 = str2.replace(set, '').trim()
    const num = str3.match(/\d{7,10}/)?.[0]
    const groupId = this.GM ? (num ?? this.groupId) : this.groupId
    if (!this.isGroup && !groupId) {
      if (this.GM) isGlobal = true
      else return this.reply('请于群内使用')
    }
    let showGroup
    // 修改全局设置或群设置
    if (group || set) {
      const setData = UCPr.CFG.cfgData[type][group]?.cfg?.[set]
      if (setData) {
        log.debug(setData)
        const [g, s] = setData.path.split('.')
        if (isGlobal || type === 'GAconfig' || (s && !isGlobal && s in UCPr.groupCFG(groupId)[type][g])) {
          showGroup = group
          // 获取新设置值
          let operation
          if (setData.type === 'switch') {
            if (/开启|启动/.test(str3)) operation = true
            else if (/关闭|禁用/.test(str3)) operation = false
          } else if (setData.type === 'num') {
            if (setData.input) {
              const setNum = setData.input(str3)
              if (setNum || setNum === 0) {
                operation = setNum
              } else {
                // operation = setData.def
              }
            } else {
              operation = parseInt(str3.match(/\d+/)?.[0] ?? setData.def)
            }
          } else if (setData.type === 'power') {
            const numMatch = str3.match(/0|1/g)
            if (numMatch && numMatch.length === setData.options?.length) {
              for (const i in numMatch) {
                if (isGlobal) {
                  Admin.globalCfg(setData.path + '.' + judgeProperty[setData.options[i]], numMatch[i] === '1', type)
                } else {
                  Admin.groupCfg(groupId, setData.path + '.' + judgeProperty[setData.options[i]], numMatch[i] === '1', type)
                }
              }
            }
          } else {
            if (setData.input) {
              operation = setData.input(str3)
            } else {
              operation = str3
            }
          }
          // 保存新设置
          if (operation !== undefined) {
            if (isGlobal) {
              Admin.globalCfg(setData.path, operation, type)
            } else {
              Admin.newConfig(groupId)
              Admin.groupCfg(groupId, setData.path, operation, type)
            }
          }
          // 等等更健康
          await common.sleep(0.12)
        }
      }
    }
    // 发送新设置图
    const data = Cfg.get(e, { type, groupId, isGlobal, group: showGroup })
    if (!data) return
    return common.render(e, data)
  }

  async lockConfig() {
    if (!this.verifyLevel(4)) return false
    const { lock } = UCPr.CFG
    const lockPath = this.msg.match(/设置(.*)/)?.[1]
    if (!lockPath) {
      return this.reply('已锁定设置：\n\n' + Data.empty(Data.makeArrStr(getAllKeyPaths(lock))) + '\n\n#UC取消锁定设置 + 键路径可解除锁定')
    }
    const isLock = /锁定/.test(this.msg)
    const spArr = lockPath.split('.')
    if (isLock === (_.get(lock, lockPath) !== undefined)) {
      return this.reply(`锁定设置中${isLock ? '已经' : '不'}存在<${lockPath}>`)
    } else if (!/config/.test(spArr[0])) {
      return this.reply('请以config/GAconfig开头，用点号连接每个键')
    } else if (_.get(UCPr, lockPath) === undefined) {
      return this.reply(`无效路径${lockPath}`)
    }
    Admin.lockConfig(lockPath, isLock)
    return this.reply(`成功${isLock ? '锁定' : '解锁'}${lockPath}`)
  }

}

function getAllKeyPaths(obj) {
  return _.flatMapDeep(_.toPairs(obj), ([key, value]) => {
    if (_.isPlainObject(value)) {
      return getAllKeyPaths(value).map(behindKey => `${key}.${behindKey}`)
    }
    return key
  })
}