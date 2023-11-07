import { log, UCPr, UCDate, file, Path } from './index.js'
import _ from 'lodash'

/** 常用方法 */
const common = {

  /** 休眠函数 */
  async sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
  },

  /**
   * 发送消息
   * @param {number} loc 位置id，如群号、Q号
   * @param {Array} msg 要发送的消息
   * @param {'Group' | 'Private'} type 群聊订阅则为Group，私聊订阅则为Private
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

  /**
   * 发送文件
   * @param {*} e
   * @param {Buffer|string} buffer buffer或路径
   * @param {string} name 上传文件名
   * @param {string} replyMsg 回复消息
   */
  async sendFile(e, buffer, name, replyMsg = '') {
    if (!Buffer.isBuffer(buffer)) {
      if (file.existsSync(buffer)) {
        buffer = file.readFileSync(buffer, null)
        if (!name) {
          name = Path.parse(buffer).base
        }
      } else {
        return false
      }
    } else if (!name) {
      name = `${e.sender.user_id}-${UCDate.NowTimeNum}`
    }
    name = name.replace(/\\|\/|:|\*|\?|<|>|\|"/g, '')
    if (e.isGroup) {
      await e.group.fs.upload(buffer, undefined, name)
      await e.reply(replyMsg, false, { at: true })
    } else if (e.friend) {
      await e.friend.sendFile(buffer, name)
      await e.reply(replyMsg, true)
    } else {
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
   * @param {'Group'|'Private'} [type]
   */
  async makeforwardMsg(msg, id = UCPr.rentGroup, type = 'Group', dec = undefined) {
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
  },

  /** 判断是否是管理员或群主 */
  isGroupAdmin(obj) {
    return obj.role === 'admin' || obj.role === 'owner'
  },

  /** 获取群实例 */
  async pickGroup(group) {
    if (typeof group === 'number' || typeof group === 'string') {
      if (!Number(group)) return false
      group = await Bot.pickGroup(group)
    }
    return group
  },

  /** 判断Bot是否是管理员或群主 */
  async botIsGroupAdmin(group) {
    group = await this.pickGroup(group)
    return group.is_admin || group.is_owner
  },

  /** 踢出群员，需要管理权限 */
  async kickMember(groupId, userId) {
    return await (await this.pickGroup(groupId)).kickMember(userId)
  },

  /** 群员信息对象 */
  async getMemberObj(group) {
    return Object.fromEntries(await (await common.pickGroup(group)).getMemberMap())
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
  }
}

export default common