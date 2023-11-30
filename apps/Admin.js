import { Check, Data, common, Admin, UCPr, Path, log } from '../components/index.js'
import { UCPlugin, Help, Cfg } from '../model/index.js'
import { judgeProperty } from '../components/Admin.js'
import { CFG } from '../components/UCPr.js'
import _ from 'lodash'

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
          reg: /^#?UC(设置|(增|添)?加|删除?|减)(主人|黑名单|管理员?)(\d+)?(\s+\d+)?/i,
          fnc: 'accredit'
        },
        {
          reg: /^#?UC全局(设置|(增|添)?加|删除?|减)(主人|黑名单|管理员?)\d*$/i,
          fnc: 'globalAccredit'
        },
        {
          reg: /^#?UC(全局)?(主人|管理员?|黑名单)列表$/i,
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
          reg: new RegExp(`^#?UC(全局)?设置\\s*(${Cfg.groupReg})?.*`, 'i'),
          fnc: 'UC_CFG'
        },
        {
          reg: /^#?UC(锁定|解锁)(设置)?.*/i,
          fnc: 'lockConfig'
        }
      ]
    })
  }

  getInfo() {
    if (/主人/.test(this.e.msg)) {
      return { type: 'Master', name: '主人', need: 4 }
    }
    if (/管理/.test(this.e.msg)) {
      return { type: 'Admin', name: '管理', need: 3 }
    }
    if (/黑名单/.test(this.e.msg)) {
      return { type: 'BlackQQ', name: '黑名单', need: 1 }
    }
    return false
  }

  async accredit(e) {
    if (e.atme) return false
    const { type, name, need } = this.getInfo()
    if (!this.verifyLevel(need)) return false
    const numMatch = e.msg.match(/\d{5,10}/g)
    const userId = e.at ?? numMatch?.[0]
    if (!userId) return e.reply('请艾特或指定要操作的对象')
    const groupId = numMatch?.[1] ?? e.group_id
    if (!groupId) return e.reply('请同时指定要设置的群')
    const isAdd = /设置|加/.test(e.msg)
    if (type === 'BlackQQ') {
      if (isAdd === Check.str(UCPr.BlackQQ[groupId], userId)) {
        return e.reply(`群聊${groupId}${name}中${isAdd ? '已经' : '不'}存在<${userId}>`)
      }
      Admin.balckQQ(groupId, userId, isAdd)
    } else {
      if (isAdd === Check.str(UCPr[type][userId], groupId)) {
        return e.reply(`群聊${groupId}${name}中${isAdd ? '已经' : '不'}存在<${userId}>`)
      }
      Admin.group(type, userId, groupId, isAdd)
    }
    return e.reply(`操作成功，群聊${groupId}${name}${isAdd ? '新增' : '删除'}<${userId}>`)
  }

  async globalAccredit(e) {
    if (e.atme) return false
    const { type, name, need } = this.getInfo()
    if (!this.verifyLevel(need)) return false
    const userId = e.at ?? e.msg.match(/\d+/)?.[0]
    if (!userId) return e.reply('请艾特或指定要操作的对象')
    const isAdd = /设置|加/.test(e.msg)
    if (isAdd === Check.str(UCPr[`Global${type}`], userId)) {
      return e.reply(`全局${name}中${isAdd ? '已经' : '不'}存在<${userId}>`)
    }
    Admin.global(type, userId, isAdd)
    return e.reply(`操作成功，全局${name}${isAdd ? '新增' : '删除'}<${userId}>`)
  }

  /** 按照全局或群查找 */
  async list(e) {
    const { type, name, need } = this.getInfo()
    if (!this.verifyLevel(need)) return false
    const groupId = e.group_id ?? e.msg.match(/\d+/)?.[0]
    const title = `UC插件${name}列表`
    let replyMsg
    if ((/全局/.test(e.msg) || !groupId) && this.level === 4) {
      const { global, globalLen, group, groupLen } = Admin.list(type)
      const info = title + `\n总计${globalLen}个全局${name}\n${groupLen}个群${name}配置`
      replyMsg = await common.makeForwardMsg(e, [info, '全局：', ...global, '指定群：', ...group], title)
    } else if (!groupId) {
      return e.reply('请指定群号或于群内使用本功能')
    } else {
      const cfg = UCPr[type]
      let list
      if (name === 'BlackQQ') {
        list = cfg[groupId]
      } else {
        list = _.sortBy(_.keys(_.pickBy(cfg, v => Check.str(v, groupId))))
      }
      if (_.isEmpty(list)) return e.reply(`群聊${groupId}${name}列表为空`)
      const memberObj = await common.getMemberObj(groupId)
      const listInfo = {}
      list.forEach(user => {
        const name = memberObj[user]?.card || memberObj[user]?.nickname || user
        listInfo.user = name
      })
      const info = Data.makeObjStr(listInfo, { isSort: true, chunkSize: 50 })
      replyMsg = await common.makeForwardMsg(e, [title, ...info], title)
    }
    return e.reply(replyMsg)
  }

  async searchUser(e) {
    if (e.atme || !this.GM) return false
    const numMatch = e.msg.match(/\d+/)
    const userId = e.at || numMatch?.[0]
    if (!userId) return e.reply('请艾特或指定需要查询的用户')
    const isBlack = Check.str(UCPr.BlackQQ, userId)
    const userPermission = Check.globalLevel(userId)
    let replyMsg = `用户${userId}：${map.get(userPermission)}`
    if (userPermission === 1) {
      let info = UCPr.Admin[userId]
      replyMsg += `\n权限范围：${info ? info.join('、') : '全局管理'}`
    }
    if (userPermission !== 2) replyMsg += '\n黑名单：' + isBlack
    return e.reply(replyMsg)
  }

  async errorLog(e) {
    if (!this.M) return false
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
    if (this.B) return false
    const data = Help.get(e)
    if (!data) return
    return await common.render(e, data)
  }

  async UC_CFG(e) {
    if (!this.verifyLevel(1)) return false
    // #UC设置str1 str2 str3  str1:含设置组类 str2:含组内设置 str3:含修改值
    let isGlobal = /全局/.test(e.msg)
    if (isGlobal && !this.verifyLevel(4)) return false
    const str1 = e.msg.replace(/#?UC(全局)?设置/i, '').trim()
    const group = new RegExp(Cfg.groupReg, 'i').exec(str1)?.[0] ?? ''
    log.debug('修改设置group：' + group)
    const str2 = str1.replace(group, '').trim()
    const set = Cfg.settingReg(group).exec(str2)?.[0] ?? ''
    log.debug('修改设置set：' + set)
    const num = e.msg.match(/\d{5,10}/)?.[0]
    const groupId = this.GM ? (num ?? e.group_id) : e.group_id
    if (!groupId) {
      if (this.GM) isGlobal = true
      else return e.reply('请于群内使用')
    }
    // 修改全局设置或群设置
    if (group || set) {
      const setData = CFG.cfgData[group]?.cfg?.[set]
      log.debug(setData)
      if (setData) {
        // 获取新设置值
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
              Admin.globalCfg(setData.path + judgeProperty[setData.options[i]], numMatch[i] === '1', setData.cfg)
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
            Admin.globalCfg(setData.path, operation, setData.cfg)
          } else {
            Admin.newConfig(groupId)
            Admin.groupCfg(groupId, setData.path, operation, setData.cfg)
          }
        }
      }
      // 等等更健康
      await common.sleep(0.12)
    }
    // 发送新设置图
    const data = Cfg.get(e, groupId, isGlobal)
    if (!data) return
    return await common.render(e, data)
  }

  async lockConfig(e) {
    if (!this.verifyLevel(4)) return false
    const { lock } = CFG
    const lockPath = e.msg.match(/(?:锁定|解锁)(?:设置)?(.*)/)?.[1]
    if (!lockPath) {
      return e.reply('已锁定设置：\n\n' + Data.empty(Data.makeArrStr(getAllKeyPaths(lock))) + '\n\n#UC取消锁定设置 + 键路径可解除锁定')
    }
    const isLock = /锁定/.test(e.msg)
    const spArr = lockPath.split('.')
    if (isLock === (_.get(lock, lockPath) !== undefined)) {
      return e.reply(`锁定设置中${isLock ? '已经' : '不'}存在<${lockPath}>`)
    } else if (!/config/.test(spArr[0])) {
      return e.reply('请以config/GAconfig开头，用点号.连接每个键')
    } else if (_.get(UCPr, lockPath) === undefined) {
      return e.reply(`无效路径${lockPath}`)
    }
    Admin.lock(lockPath, isLock)
    return e.reply(`成功${isLock ? '锁定' : '解锁'}${lockPath}`)
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