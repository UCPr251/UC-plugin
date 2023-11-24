import { log, UCDate, file, Path } from './index.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import _ from 'lodash'

/** 常用api */
const common = {
  /** 休眠函数，单位秒 */
  async sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  },

  /**
   * 发送消息
   * @param {number} loc 位置id，如群号、Q号
   * @param {Array} msg 要发送的消息
   * @param {'Group' | 'Private'} type
   */
  async sendMsgTo(loc, msg, type) {
    if (type === 'Group') {
      Bot.pickGroup(loc).sendMsg(msg)
        .catch((err) => {
          log.error('发送群消息错误' + err.message)
        })
    } else {
      Bot.pickUser(loc).sendMsg(msg)
        .catch((err) => {
          log.error('发送私聊消息错误' + err.message)
        })
    }
  },

  /** 转换为字符串 */
  toString(value, every = false, sep = '\n') {
    if (every && _.isArray(value)) return value.map(v => this.toString(v)).join(sep)
    if (_.isPlainObject(value)) return JSON.stringify(value, null, 2)
    return _.toString(value)
  },

  /** sender是否是管理员或群主 */
  isGroupAdmin(e) {
    return e.sender?.role === 'admin' || e.sender?.role === 'owner'
  },

  /** 获取群实例 */
  async pickGroup(group) {
    if (typeof group === 'number' || typeof group === 'string') {
      if (!Number(group)) return false
      group = await Bot.pickGroup(group)
    }
    return group
  },

  /** Bot是否是管理员或群主 */
  async botIsGroupAdmin(group) {
    group = await this.pickGroup(group)
    return group.is_admin || group.is_owner
  },

  /** 指定群踢出群员 */
  async kickMember(groupId, userId) {
    return await (await this.pickGroup(groupId)).kickMember(userId)
  },

  /** 群员信息对象 */
  async getMemberObj(group) {
    return Object.fromEntries(await (await this.pickGroup(group)).getMemberMap())
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

  /** 获取图片下载url */
  async getPicUrl(e) {
    let url = null
    if (e.img) {
      url = e.img[0]
    } else if (e.file) {
      url = await this.getFileUrl(e)?.[0]
    }
    return url
  },

  /** 获取文件message_id，顺序 */
  getFileMid(data = []) {
    if (!data) return []
    const fileMessage = _.filter(data, info => info.message[0].type === 'file')
    return _.map(fileMessage, 'message_id')
  },

  /** 删除群文件 */
  async rmGroupFile(group, fids) {
    group = await this.pickGroup(group)
    if (!await this.botIsGroupAdmin(group)) {
      log.mark(`[common.rmGroupFile]无群${group.gid}管理权限，删除文件取消`)
      return false
    }
    _.castArray(fids).forEach(fid => group.fs.rm(fid))
    return true
  },

  /** 渲染图片并发送 */
  async render(e, data, cfg = { quote: false, recallMsg: 0, at: false }) {
    if (!e || !data) return log.warn('[common.render]图片渲染输入格式错误')
    const base64 = await puppeteer.screenshot(data.tempPath ?? Path.Plugin_Name, data)
    return await e.reply(base64, cfg.quote, cfg)
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
      let info = await Bot.getGroupMemberInfo(e.group_id, Bot.uin)
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
      let detail = forwardMsg.data?.meta?.detail
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
    let nickname = Bot.nickname
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
    forwardMsg = await (await Bot[type === 'Group' ? 'pickGroup' : 'pickFriend'](id)).makeForwardMsg(forwardMsg)
    /** 处理描述，icqq0.4.12及以上 */
    if (dec) {
      let detail = forwardMsg.data?.meta?.detail
      if (detail) {
        detail.news = [{ text: dec }]
      }
    }
    return forwardMsg
  }
}

export default common