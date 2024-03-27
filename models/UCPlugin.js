import { UCPr, log, Data, Check, common, Path, file } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import Permission from './Permission.js'
import _ from 'lodash'

/** UC插件plugin类 */
export default class UCPlugin extends plugin {
  constructor({
    e,
    name = 'UC插件',
    dsc = 'UC插件',
    event = 'message',
    priority = UCPr.priority,
    rule,
    Cfg
  }) {
    super({ name, dsc, event, priority, rule })
    if (!e) return
    /** Client */
    this.e = e
    /** 格式化消息 */
    this.msg = this.formatMsg()
    /** e.sender */
    this.sender = this.e.sender ?? this.e.member
    /** 是否群聊 */
    this.isGroup = this.e.message_type === 'group' || this.e.notice_type === 'group' || this.e.request_type === 'group' || this.e.isGroup
    /** 用户id */
    this.userId = this.e.sub_type === 'poke' ? this.e.operator_id : this.sender?.user_id ?? this.e.user_id
    /** 群号 */
    this.groupId = this.e.group_id ?? this.e.group?.group_id ?? this.e.group?.gid ?? this.e.groupId
    /** 群实例 */
    this.group = this.e.group
    /** message */
    this.message = this.e.message
    /** 好友实例 */
    this.friend = this.e.friend
    /** 群所有配置config, GAconfig, permission，无则全局 */
    this.groupCFG = UCPr.groupCFG(this.groupId)
    /** 群config配置，无则全局 */
    this.config = this.groupCFG.config
    /** 群GAconfig配置，无则全局 */
    this.GAconfig = this.groupCFG.GAconfig
    /** 群功能配置 */
    this.Cfg = _.get(this.groupCFG, Cfg, {})
    if (!this.userId) return
    /** 权限判断Class */
    this.PermissionClass = Permission
    /** 默认UC权限实例 */
    this.UC = this.Permission()
    /** 权限级别Set */
    this.levelSet = this.UC.levelSet
    /** 权限级别 */
    this.level = this.UC.level
    /** 是否主人 */
    this.M = this.UC.M
    /** 是否全局主人 */
    this.GM = this.UC.GM
    /** 是否管理 */
    this.A = this.UC.A
    /** 是否全局管理 */
    this.GA = this.UC.GA
    /** 是否黑名单 */
    this.B = this.UC.B
    /** 是否全局黑名单 */
    this.GB = this.UC.GB
    /** 上下文hook调用函数名称 */
    this.setFnc = '__chooseContext'
  }

  /** 设置的Bot名称 */
  get BotName() {
    return UCPr.BotName
  }

  /** 机器人qq */
  get qq() {
    return UCPr.qq
  }

  /** 插件使用权限 */
  get check() {
    return Data.check.call(this)
  }

  /** 检查UC unNecRes */
  checkUnNecRes() {
    if (!Check.folder(Path.unNecRes)) {
      this.reply('未拉取UC资源，无法使用此功能，请先#UC更新资源')
      return false
    }
    return true
  }

  /** 用户无权限回复 */
  noPerReply(quote = true, data = {}) {
    this.reply(UCPr.noPerReply, quote, data)
    return false
  }

  /** Bot无权限回复 */
  noPowReply(quote = true, data = {}) {
    this.reply(UCPr.noPowReply, quote, data)
    return false
  }

  /** api连接失败回复 */
  fetchErrReply(quote = true, data = {}) {
    this.reply(UCPr.fetchErrReply, quote, data)
    return false
  }

  /** 错误回复 */
  errorReply(quote = true, data = {}) {
    this.reply('未知错误，请查看错误日志', quote, data)
    return false
  }

  /**
   * @param {string} urlCode url代号
   * @param {...any} parameters 参数
   * @returns Fetch result
   */
  async fetch(urlCode, ...parameters) {
    return UCPr.fetch(urlCode, ...parameters)
  }

  /** 获取权限实例 */
  Permission(cfg = {}) {
    return this.PermissionClass.get(this, cfg)
  }

  /** 默认权限判断(回复)? */
  verifyPermission(cfg = {}, option = {
    isReply: true,
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    if (!this.verifyLevel()) return false
    return this.PermissionClass.verify(this, cfg, option)
  }

  /**
   * 权限等级验证
   * - 全局主人：4
   * - 群主人：3
   * - 全局管理：2
   * - 群管理：1
   * - 普通用户：0
   * - 群黑名单：-1
   * - 全局黑名单：-2
   */
  verifyLevel(need = 0, reply = true) {
    if (this.B) return false
    if (UCPr.onlyMaster && !this.M) return false
    if (this.level < need) return reply && this.noPerReply()
    return true
  }

  /** 检查是否全局主人 */
  isGM(userId) {
    return Check.Master(userId)
  }

  /** 检查是否主人 */
  isM(userId, groupId) {
    if (this.isGM(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.Master, userId)
    return Check.str(this.groupCFG.permission?.Master, userId)
  }

  /** 检查是否全局管理 */
  isGA(userId) {
    return Check.Admin(userId)
  }

  /** 检查是否管理 */
  isA(userId, groupId) {
    if (this.isGA(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.Admin, userId)
    return Check.str(this.groupCFG.permission?.Admin, userId)
  }

  /** 检查是否全局黑名单 */
  isGB(userId) {
    return Check.BlackQQ(userId)
  }

  /** 检查是否黑名单 */
  isB(userId, groupId) {
    if (this.isGB(userId)) return true
    if (groupId) return Check.str(UCPr.groupCFG(groupId).permission?.BlackQQ, userId)
    return Check.str(this.groupCFG.permission?.BlackQQ, userId)
  }

  /** 创建上下文 */
  setUCcontext(fnc = this.setFnc, time = 120, reply) {
    if (typeof fnc === 'number') [fnc, time] = [this.setFnc, fnc]
    super.setContext(fnc, false, time, reply)
  }

  /** 获取上文e */
  getUCcontext(fnc = this.setFnc) {
    return _.get(super.getContext(), fnc, {})
  }

  /** 结束上下文 */
  finishUCcontext(fnc = this.setFnc) {
    log.debug(`结束上下文hook：${this.name} ${fnc}`)
    super.finish(fnc)
  }

  __transferStation() {
    const data = this.getUCcontext('__transferStation.data')
    if (!data) {
      this.finishUCcontext('__transferStation')
      return log.error(`[UCPlugin.__transferStation]上下文hook数据异常丢失：${this.name}（${this.dsc}）自动结束上下文hook`)
    }
    const { transferFnc } = data
    if (typeof transferFnc !== 'function') return log.error('[UCPlugin.__transferStation]函数不存在')
    return transferFnc(this, data)
  }

  /** 获取序号指定数据 */
  async __chooseContext() {
    if (this.isCancel('__chooseContext')) return
    const data = this.getUCcontext('__chooseContext.data')
    if (!data) {
      this.finishUCcontext('__chooseContext')
      return log.error(`[UCPlugin.__chooseContext]上下文hook数据异常丢失：${this.name}（${this.dsc}）自动结束上下文hook`)
    }
    const { list, fnc, handler } = data
    let result
    // handler自定义处理this，返回true则中断处理，可自行修改this属性
    if (handler) {
      result = await handler(this, data)
      if (result === true) return
    }
    let numMatch
    if (/all/i.test(this.msg)) {
      numMatch = _.range(0, list.length)
    } else if ((numMatch = /^([1-9]\d*)\s*-\s*([1-9]\d*)$/.exec(this.msg))) {
      const [start, end] = numMatch.slice(1).map(Number)
      if (start > end) return this.reply('???')
      numMatch = _.range(start - 1, Math.min(end, list.length))
    } else if ((numMatch = this.msg.match(/\d+/g))) {
      numMatch = numMatch.filter(num => num >= 1 && num <= list.length).map(num => num - 1)
      // 不符合翻页操作、不符合序号选择
    } else if (result === 'continue') {
      return result
    }
    if (!numMatch?.length) {
      return this.reply('请输入有效的序号或取消操作')
    }
    const arr = numMatch.map(num => list[num])
    this.finishUCcontext('__chooseContext')
    if (typeof fnc === 'function') fnc(arr, data)
    else fnc && this[fnc](arr, data)
  }

  /**
   * 搜索文件并操作
   * @param {string} path 路径
   * @param {string} name 文件名
   * @param {Function} fnc 操作函数
   * @param {Object} options 选项
   * @param {string|Array} options.type 文件类型
   * @param {string} [options.note='要操作的文件'] 提示
   * @param {boolean} [options.basename=false] 只保留文件名
   * @param {Object} [options.data={}] 附加数据
   */
  async searchFiles(path, name, fnc, {
    type,
    note = '要操作的文件',
    basename = false,
    data = {}
  } = {}) {
    if (!name) {
      const list = file.readdirSync(path, { type })
      if (!list.length) return this.reply('目标文件夹为空')
      this.e.data = {
        fnc,
        list,
        ...data
      }
      this.setUCcontext('__chooseContext')
      const list_ = basename ? file.getFilesName(list) : list
      const info = Data.makeArrStr(list_, { chunkSize: 100, length: 3000 })
      const title = '请选择' + note
      const replyMsg = await common.makeForwardMsg(this.e, [title + '的序号\n间隔序号或使用“1-10”可一次操作多个', ...info], title)
      return this.reply(replyMsg)
    }
    const search = await file.searchFiles(path, name, { type })
    if (search.length === 0) return this.reply(`未找到【${name}】相关文件`)
    if (search.length === 1) return this[fnc]([search[0].file], data)
    const list = _.map(search, 'file').filter(v => Path.extname(v))
    this.e.data = {
      fnc,
      list,
      ...data
    }
    this.setUCcontext('__chooseContext')
    const list_ = basename ? _.map(search, 'name') : list
    const info = Data.makeArrStr(list_, { length: 3000 })
    return this.reply('找到多个相关文件，请选择序号或取消：\n' + info)
  }

  /** 用户是否确认操作 */
  isSure(fnc) {
    if (/^(确定|是|确认|确信|肯定|yes)$/.test(this.msg)) {
      fnc && fnc()
      return true
    }
    return false
  }

  /** 用户是否取消上下文hook */
  isCancel(setFnc, option = {
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    if (/^#?(取消|退出|否|no)/.test(this.msg)) {
      return this.finishReply('操作已结束', setFnc, option)
    }
    return false
  }

  /** 完成hook并回复 */
  finishReply(msg, setFnc, option = {
    quote: true,
    at: false,
    recallMsg: 0
  }) {
    const { quote = true, ...data } = option
    this.reply(msg, quote, data)
    this.finishUCcontext(setFnc)
    return true
  }

  /** 格式化this.msg */
  formatMsg() {
    if (this.e.message) {
      const msgArr = []
      for (const msg of this.e.message) {
        switch (msg.type) {
          case 'text':
            msgArr.push(msg.text?.replace(/^\s*[＃井#]+\s*/, '#').replace(/^\s*[\\*※＊]+\s*/, '*').trim())
            break
          case 'image':
            /** 图片url */
            this.img ??= []
            this.img.push(msg.url)
            break
          case 'at':
            /** at数据 */
            this.atRet ??= []
            this.atRet.push(msg.qq ?? msg.id)
            this.at ??= msg.qq ?? msg.id // 与底层e.at相反，以第一个艾特为准
            break
          case 'file':
            this.file = { name: msg.name, fid: msg.fid }
            break
          default: break
        }
      }
      return msgArr.join(' ').replace(/\s+/g, ' ').trim()
    }
    return (this.msg ?? this.e.msg) || ''
  }

  async reply(msg, quote, data = { recallMsg: 0, at: false }) {
    if (_.isEmpty(msg)) return
    if (this.e && !this.e.reply) {
      if (this.groupId) {
        this.group ??= common.pickGroup(this.groupId)
        if (this.group) this.e.reply = function (msg) { this.group.sendMsg(msg) }
      } else if (this.userId) {
        this.e.friend ??= Bot.pickFriend(this.userId)
        if (this.e.friend) this.e.reply = function (msg) { this.e.friend.sendMsg(msg) }
      }
    }
    if (!this.e?.reply) return log.error('发送消息错误，e.reply不存在' + this.groupId ? `群：${this.groupId}` : this.userId ? `好友：${this.userId}` : '')
    if (this.group?.mute_left > 0) return log.mark(`Bot在群${this.groupId}内处于禁言状态，取消发送`)
    let { recallMsg = 0, at = false } = data
    if (at && this.isGroup) {
      msg = _.castArray(msg)
      if (at === true || !+at) at = this.userId
      msg.unshift(segment.at(at, this.sender.card || this.sender.nickname), '\n')
    }
    const msgRes = await this.e.reply(msg, quote && !this.e.file).catch(err => {
      log.error('发送消息错误', err)
    })
    if (recallMsg) {
      if (this.group) {
        setTimeout(() => this.group.recallMsg(msgRes.message_id), recallMsg * 1000)
      } else if (this.e.friend) {
        setTimeout(() => this.e.friend.recallMsg(msgRes.message_id), recallMsg * 1000)
      }
    }
    return msgRes
  }

}
