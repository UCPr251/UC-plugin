import { log, UCDate, file, Path, UCPr } from './index.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import _ from 'lodash'
import { segment } from 'icqq'

/** 常用api */
const common = {
  /** 休眠函数，单位秒 */
  async sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  },

  /**
   * 发送消息
   * @param {number} loc 群号、Q号
   * @param {Array|string} msg 要发送的消息
   * @param {'Group'|'Private'} type
   */
  async sendMsgTo(loc, msg, type) {
    Bot[`send${type}Msg`](loc, msg).catch((err) => {
      log.error(`[common.sendMsgTo]发送${type} ${loc}消息错误`, err)
    })
  },

  makeMsg(message, replaceKey = [], replaceValue = []) {
    if (!_.isArray(message)) return null
    replaceKey = _.castArray(replaceKey)
    replaceValue = _.castArray(replaceValue)
    const reply = []
    const replaceFnc = (str, keyArr, valueArr) =>
      keyArr.reduce((ori, key, index) => ori.replace(key, valueArr[index]), str)
    for (const val of message) {
      switch (val.type) {
        case 'text':
          reply.push(replaceFnc(val.text, replaceKey, replaceValue))
          break
        case 'at':
          reply.push(segment.at(val.qq))
          break
        case 'image':
          reply.push(segment.image(val.url ?? val.path))
          break
      }
    }
    return reply
  },

  /**
   * 获取头像URL
   * @param {*} Id
   * @param {'group'|'user'} type
   * @param {'0'|'100'} quality 100小尺寸；0大尺寸
   */
  getAvatarUrl(Id, type = 'user', quality = '100') {
    if (type === 'user') return `https://q1.qlogo.cn/g?b=qq&s=${quality}&nk=${Id}`
    if (type === 'group') return `https://p.qlogo.cn/gh/${Id}/${Id}/${quality}`
  },

  /** 转换为字符串 */
  toString(value, sep = '，') {
    if (_.isArray(value)) return value.map(v => this.toString(v, sep)).join(sep)
    if (_.isPlainObject(value)) return JSON.stringify(value, null, 2)
    return _.toString(value)
  },

  /** 获取群实例 */
  pickGroup(group) {
    if (typeof group === 'number' || typeof group === 'string') {
      if (!Number(group)) return {}
      group = Bot.pickGroup(group)
    }
    return group
  },

  isAdminOrOwner(obj) {
    if (obj.role) {
      return obj.role === 'admin' || obj.role === 'owner'
    }
    return obj.is_admin || obj.is_owner
  },

  /** Bot是否是管理员或群主 */
  botIsGroupAdmin(group) {
    if (!group) return false
    group = this.pickGroup(group)
    return this.isAdminOrOwner(group)
  },

  /** 指定群踢出群员 */
  async kickMember(groupId, userId) {
    return await (this.pickGroup(groupId)).kickMember?.(userId)
  },

  /** 群员信息对象 */
  async getMemberObj(group) {
    return Object.fromEntries(await this.pickGroup(group).getMemberMap?.())
  },

  /** 返回群用户昵称 */
  async getName(groupId, userId) {
    const info = await Bot.getGroupMemberInfo(groupId, userId)
    return info.card || info.nickname
  },

  /** 获取文件下载url和文件名 */
  async getFileUrl(e) {
    if (!e.file?.fid) return null
    const url = await e[e.isGroup ? 'group' : 'friend']?.getFileUrl(e.file.fid)
    if (!url) return null
    return [url, e.file.name]
  },

  /** 获取单张图片下载url */
  async getPicUrl(e) {
    let url = null
    if (e.img) {
      url = e.img[0]
    } else if (e.file) {
      url = await this.getFileUrl(e)?.[0]
    }
    return url
  },

  /** 获取一条消息中的所有图片url */
  getAllPicsUrl(e) {
    if (e.message) {
      const imgs = _.filter(e.message, { type: 'img' })
      return _.map(imgs, 'url')
    }
    return null
  },

  /** 获取文件message_id，顺序 */
  getFileMid(data = []) {
    if (!data) return []
    const fileMessage = _.filter(data, info => info.message[0].type === 'file')
    return _.map(fileMessage, 'message_id')
  },

  /** 删除群文件 */
  async rmGroupFile(group, fids) {
    group = this.pickGroup(group)
    if (!this.botIsGroupAdmin(group)) {
      log.warn(`[common.rmGroupFile]无群${group.gid}管理权限，删除文件取消`)
      return false
    }
    _.castArray(fids).forEach(fid => group.fs.rm(fid))
    return true
  },

  /** 渲染图片并发送 */
  async render(e, data, cfg = { quote: false, recallMsg: 0, at: false }) {
    if (!e || !data) return log.warn('[common.render]图片渲染传参错误')
    const base64 = await puppeteer.screenshot(data.tempPath ?? Path.Plugin_Name, data)
    return await e.reply(base64, cfg.quote, cfg)
  },

  /** 禁言群员，seconds为0则为解禁 */
  async muteMember(userId, groupId, seconds) {
    const groupClient = this.pickGroup(groupId)
    const status = await groupClient.muteMember(userId, seconds)
    if (!status) return false
    return true
  },

  /** 获取禁言群员列表、信息 */
  async getMuteList(group, isReturnInfo = false) {
    const groupObj = await this.getMemberObj(group)
    const mutelist = _.filter(groupObj, info => {
      const time = info.shut_up_timestamp ?? info.shutup_time
      return time !== 0 && (time - (Date.now() / 1000)) > 0
    })
    if (_.isEmpty(mutelist)) return []
    if (!isReturnInfo) return mutelist
    return mutelist.map(info => {
      const time = info.shut_up_timestamp ?? info.shutup_time
      const secondes = parseInt(time - Date.now() / 1000)
      return [
        segment.image(`https://q1.qlogo.cn/g?b=qq&s=100&nk=${info.user_id}`),
        `\n昵称：${info.card || info.nickname}\n`,
        `QQ：${info.user_id}\n`,
        `禁言剩余时间：${UCDate.diff(secondes, 's').toStr()}\n`,
        `禁言到期时间：${UCDate.getTime(secondes, 's')}`
      ]
    })
  },

  /** 解除指定群中所有成员的禁言状态 */
  async releaseAllMute(group) {
    const mutelist = await this.getMuteList(group)
    const groupClient = this.pickGroup(group)
    const start = mutelist.length
    for (const mem of mutelist) {
      await groupClient.muteMember(mem.user_id, 0)
    }
    const end = (await this.getMuteList(group)).length
    return start - end
  },

  /**
   * 获取群聊天消息数组，顺序由远到近
   * @param {object} groupClient 群组对象
   * @param {number} seq seq
   * @param {number} num 获取记录所需数量
   * @param {Array} [msgHistoryArr=[]] 初始数据
   * @returns {Promise<Array>} 返回所需群聊信息数组
   */
  async getChatHistoryArr(groupClient, seq, num, msgHistoryArr = []) {
    if (num > 20) {
      const historyMsg = await this.getChatHistoryArr(groupClient, seq, 20)
      if (_.isEmpty(historyMsg)) return msgHistoryArr
      msgHistoryArr = historyMsg.concat(msgHistoryArr)
      return await this.getChatHistoryArr(groupClient, seq - 20, num - 20, msgHistoryArr)
    }
    try {
      const info = await groupClient.getChatHistory(seq, num)
      return info.concat(msgHistoryArr)
    } catch (err) {
      log.error(`获取群${groupClient?.group_id}聊天记录错误，可能是该群状态异常`, err)
      return msgHistoryArr
    }
  },

  /**
   * 获取某人指定数量的群聊消息数组，顺序由近到远
   * @param {object} group 群组对象
   * @param {number} userId 用户id
   * @param {number} seq seq
   * @param {number} num 需要获取的消息数量
   * @param {Array} msgHistoryArr 初始数据
   * @param {number} count 获取群消息计数
   * @returns {Promise<object[]>} 返回所需某人消息信息数组
   */
  async getPersonalChatHistoryArr(group, userId, seq, num, msgHistoryArr = [], count = 0) {
    if (msgHistoryArr.length < num && count < UCPr.recall.FILTER_MAX) {
      const chatHistoryMsg = await this.getChatHistoryArr(group, seq, 20)
      if (_.isEmpty(chatHistoryMsg)) return msgHistoryArr.reverse()
      const personalChatHistory = chatHistoryMsg.filter(msg => msg.user_id == userId)
      msgHistoryArr = chatHistoryMsg.concat(personalChatHistory)
      return await this.getPersonalChatHistoryArr(group, userId, seq - 20, num, msgHistoryArr, count + 20)
    }
    return msgHistoryArr.reverse().slice(0, num)
  },

  /**
   * 批量撤回群消息
   * @param {obj} groupClient 群组对象
   * @param {Array} msgArr 消息数组
   * @returns {Promise<number>} 撤回成功数量
   */
  async recallMsgArr(groupClient, msgArr) {
    let count = 0
    groupClient = this.pickGroup(groupClient)
    const intervalTime = UCPr.recall.intervalTime ?? 0.2
    for (const msgInfo of msgArr) {
      await this.sleep(intervalTime)
      const status = await groupClient.recallMsg(msgInfo.message_id)
      if (status) count++
    }
    return count
  },

  /**
   * 发送文件
   * @param {*} e
   * @param {Buffer|string} buffer buffer或路径
   * @param {string} name 上传文件名
   * @param {string} replyMsg 回复消息
   * @param {{ quote: boolean; at: boolean; recallMsg: number; recallFile: number }} [option] 继承reply的参数
   */
  async sendFile(e, buffer, name, replyMsg = '', option = {
    quote: false,
    at: true,
    recallMsg: 0,
    recallFile: 0
  }) {
    log.debug('[common.sendFile]发送文件' + name + '，消息撤回：' + option.recallMsg + '，文件撤回：' + option.recallFile)
    const { quote, recallFile, ...data } = option
    if (data.at === undefined) data.at = true
    if (!Buffer.isBuffer(buffer)) {
      if (file.existsSync(buffer)) {
        if (!name) {
          name = Path.parse(buffer).base
        }
        buffer = file.readFileSync(buffer, null)
      } else {
        log.debug('[common.sendFile]指定路径不存在：' + buffer)
        return false
      }
    } else if (!name) {
      name = `${e.sender.user_id}-${UCDate.NowTimeNum}`
    }
    name = file.formatFilename(name)
    if (e.isGroup) {
      const fileStat = await e.group.fs.upload(buffer, undefined, name, (percentage) => {
        log.debug(`[common.sendFile]上传群${e.group_id}文件${name}，进度：${parseInt(percentage)}%`)
      })
      if (replyMsg) e.reply('\n' + replyMsg, quote, data)
      if (recallFile) {
        const fid = fileStat?.fid
        setTimeout(() => {
          log.debug('[common.sendFile]撤回群文件' + fid)
          e.group.fs.rm(fid)
        }, recallFile * 1000)
        return fid
      }
    } else if (e.friend) {
      await e.friend.sendFile(buffer, name, (percentage) => {
        log.debug(`[common.sendFile]发送好友${e.sender.user_id}文件${name}，进度：${parseInt(percentage)}%`)
      })
      e.reply(replyMsg, quote, data)
      if (recallFile) {
        const msgData = await e.friend.getChatHistory(undefined, 3)
        const mid = this.getFileMid(msgData).pop()
        setTimeout(() => {
          log.debug('[common.sendFile]撤回好友文件' + mid)
          e.friend.recallMsg(mid)
        }, recallFile * 1000)
      }
    } else {
      log.debug('[common.sendFile]非群或好友，取消发送文件')
      return false
    }
  },

  /**
   * 制作转发消息
   * @param e icqq消息e
   * @param {Array} msg 消息数组
   * @param dec 转发描述
   * @param isBot  转发信息是否为Bot
   */
  async makeForwardMsg(e, msg, dec = undefined, isBot = true) {
    let nickname = isBot ? Bot.nickname : e.sender.nickname
    const user_id = isBot ? Bot.uin : e.sender.user_id
    if (e.isGroup && isBot) {
      const info = await Bot.getGroupMemberInfo(e.group_id, Bot.uin)
      nickname = info.card || info.nickname
    }
    const userInfo = {
      user_id,
      nickname
    }
    let forwardMsg = []
    _.forEach(msg, (message) => forwardMsg.push({
      ...userInfo,
      message
    }))
    /** 制作转发内容 */
    if (e.isGroup) {
      forwardMsg = await e.group.makeForwardMsg(forwardMsg)
    } else if (e.friend) {
      forwardMsg = await e.friend.makeForwardMsg(forwardMsg)
    } else {
      return null
    }
    /** 处理描述，icqq0.4.12及以上 */
    if (dec) {
      const detail = forwardMsg.data?.meta?.detail
      if (detail) {
        detail.news = [{ text: dec }]
      }
    }
    return forwardMsg
  },

  /**
   * 无需e的转发消息制作
   * @param {number} id 群号或Q号
   * @param {'Group'|'Private'} [type]
   */
  async makeforwardMsg(msg, id, type = 'Group', dec = undefined) {
    const nickname = Bot.nickname
    const user_id = Bot.uin
    const userInfo = {
      user_id,
      nickname
    }
    let forwardMsg = []
    _.forEach(msg, (message) => forwardMsg.push({
      ...userInfo,
      message
    }))
    /** 制作转发内容 */
    forwardMsg = await Bot[type === 'Group' ? 'pickGroup' : 'pickFriend'](id).makeForwardMsg(forwardMsg)
    /** 处理描述，icqq0.4.12及以上 */
    if (dec) {
      const detail = forwardMsg.data?.meta?.detail
      if (detail) {
        detail.news = [{ text: dec }]
      }
    }
    return forwardMsg
  }
}

export default common