import { UCPr, log, Data, Check, common, Path, file } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import Permission from './Permission.js'
import _ from 'lodash'

/** UC插件plugin类 */
export default class UCPlugin extends plugin {
  constructor({
    e,
    name = 'UC-plugin-apps',
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
    /** 空cfg权限实例 */
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
  setUCcontext(fnc = this.setFnc, time = 120) {
    if (typeof fnc === 'number') [fnc, time] = [this.setFnc, fnc]
    super.setContext(fnc, false, time)
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

  /** 获取序号指定数据 */
  __chooseContext() {
    if (this.isCancel('__chooseContext')) return
    const data = this.getUCcontext('__chooseContext.data')
    if (!data) {
      this.finishUCcontext('__chooseContext')
      log.error(`上下文hook数据异常丢失：${this.name}（${this.dsc}）自动结束上下文hook`)
      return
    }
    const { list, fnc } = data
    let numMatch = this.msg.match(/\d+/g)
    if (/^[1-9]\d*\s*-\s*[1-9]\d*$/.test(this.msg)) {
      const [start, end] = this.msg.match(/\d+/g).map(Number)
      if (start > end) {
        this.reply('???')
        return false
      }
      numMatch = _.range(start, Math.min(end, list.length) + 1)
    } else {
      numMatch = numMatch?.filter(num => num >= 1 && num <= list.length)
    }
    if (_.isEmpty(numMatch)) {
      this.reply('请输入有效的序号或取消操作')
      return false
    } else {
      const arr = numMatch.map(num => list[num - 1])
      this.finishUCcontext('__chooseContext')
      this[fnc](arr, data)
    }
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
    if (search.length !== 1) {
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
    return this[fnc]([search[0].file], data)
  }

  /** 用户是否确认操作 */
  isSure(fnc) {
    if (/^(是|确认|确定|确信|肯定|yes)$/.test(this.msg)) {
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
    if (/^(取消|否|no)$/.test(this.msg)) {
      return this.finishReply('取消已操作', setFnc, option)
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
            this.img ??= []
            this.img.push(msg.url)
            break
          case 'at':
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
    if (!this.e.reply) {
      if (this.isGroup && this.groupId) {
        this.group ??= common.pickGroup(this.groupId)
        this.e.reply = this.group.sendMsg.bind(this.group)
      } else if (this.userId) {
        this.e.friend ??= Bot.pickFriend(this.userId)
        this.e.reply = this.e.friend.sendMsg.bind(this.e.friend)
      }
    }
    if (!this.e.reply) return log.error('发送消息错误，e.reply不存在')
    if (this.group?.mute_left > 0) return log.mark(`Bot在群${this.groupId}内处于禁言状态，取消发送`)
    let { recallMsg = 0, at = false } = data
    if (at && this.isGroup) {
      msg = _.castArray(msg)
      if (at === true || !+at) at = this.userId
      msg.unshift(segment.at(at))
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
