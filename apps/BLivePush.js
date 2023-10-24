/* eslint-disable no-unused-vars */
import { Path, Check, Data, UCDate, common, file, log, UCPr, Permission } from '../components/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

const help = `[UC]B站直播推送插件
功能：直播开始、结束推送，uid查询B站信息
指令：
#查询up123456
#订阅直播654321
#取消订阅直播654321
#直播推送列表
#关闭直播推送
#谁正在直播
#开启直播推送艾特全员
#清空直播推送缓存（故障用）
主人可在指令末尾加上群号指定操作该群
注意uid≠直播间id，可通过uid#查询up+uid获取直播间id，手动获取：`
const err_reply = `\n进入需要订阅的主播的直播间，
电脑浏览器端：
导航栏网址https://live.bilibili.com/后的数字即为直播间id
手机端：
点击主播头像，房间号即为直播间id`
const BLive = 'https://live.bilibili.com/'

await init()

export class UCBLivePush extends plugin {
  constructor() {
    super({
      name: 'UC-BlivePush',
      dsc: 'B站直播推送',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: '^#?直播推送测试$',
          fnc: 'bLivePush',
          permission: 'master'
        },
        {
          reg: /^#?(UC)?直播(推送|订阅)帮助$/i,
          fnc: 'bLiveHelp'
        },
        {
          reg: /^#?(UC)?(查询)?up(\d+)/i,
          fnc: 'bQueryUp'
        },
        {
          reg: /^#?(UC)?订阅直播(.*)/i,
          fnc: 'bLiveSubscribe'
        },
        {
          reg: /^#?(UC)?(取消|删除)订阅直播(.*)/i,
          fnc: 'bLiveDelete'
        },
        {
          reg: /^#?(UC)?直播(推送|订阅)列表(.*)/i,
          fnc: 'bLiveList'
        },
        {
          reg: /^#?(UC)?(开启|关闭)直播推送(.*)/i,
          fnc: 'bLiveSwitch'
        },
        {
          reg: /^#?(UC)?谁正?在直播(.*)/i,
          fnc: 'bLiving'
        },
        {
          reg: /^#?(UC)?(清除|清空)直播推送缓存$/i,
          fnc: 'bLiveClean'
        },
        {
          reg: /^#?(UC)?(开启|关闭)直播推送艾特全员(.*)/i,
          fnc: 'bLiveAtall'
        }
      ]
    })
    this.task = {
      cron: `0 */${parseInt(UCPr.BlivePush.mins) || 4} * * * ?`,
      name: 'B站直播检测',
      fnc: this.bLivePush.bind(this)
    }
    /** 群聊已推送 */
    this.GroupPushed = '[UC]G_BLivePushed'
    /** 私聊已推送 */
    this.PrivatePushed = '[UC]P_BLivePushed'
    /** 直播间信息 */
    this.PushedInfo = '[UC]BLPushedInfo'
  }

  async bLiveHelp(e) {
    return e.reply(help + err_reply)
  }

  async bQueryUp(e) {
    const uid = e.msg.match(/\d+/)[0]
    const data = await getUpInfo.call(this, uid)
    if (data === false) return false
    if (data === null) return e.reply(UCPr.fetchErrReply)
    const [nickname, face_url, fans, fan_sign, room] = data
    let msg = [`B站用户${uid}不存在！`]
    if (nickname) {
      msg = [
        `B站用户：${uid}\n昵称：${nickname}`,
        segment.image(face_url),
        `粉丝数：${fans}\n直播间id：${room != 0 ? room : '未开通直播'}\n粉丝牌：${fan_sign || '无'}`,
        `\n主页链接：https://space.bilibili.com/${uid}`
      ]
      if (room != 0) msg.push(`\n直播间链接：${BLive + room}`)
    }
    return e.reply(msg)
  }

  async bLiveSubscribe(e) {
    if (!Permission.verify(e, UCPr.BlivePush)) return false
    const [location_id, room_id, type] = await getIdType(e)
    if (!room_id) {
      return e.reply('请输入正确的直播间id')
    }
    if (location_id.length < 5 || location_id.length > 10) {
      return e.reply('请输入正确的推送群号')
    }
    const data = getData(type)
    const loc = type === 'Group' ? '群聊' : '私聊'
    const info = data[location_id]
    if (info && Check.str(info.room, room_id)) {
      return e.reply(`订阅失败，${loc}：${location_id}已订阅直播间：${room_id}`)
    }
    const up_data = await getLiveData(room_id)
    if (!up_data) return e.reply(UCPr.fetchErrReply)
    const nickname = up_data.data.up.uid
    if (!up_data.data?.up?.uid) {
      let msg = [`订阅失败，直播间id：${room_id}不存在`]
      const up_info = await getUpInfo.call(this, room_id)
      if (up_info === false) return false
      if (up_info === null) return e.reply(UCPr.fetchErrReply)
      const [nickname, face_url, fans, fan_sign, room] = up_info
      if (room) {
        msg.push(`\n自动搜索uid为${room_id}的B站用户\n昵称：${nickname}`)
        msg.push(segment.image(face_url))
        msg.push(`粉丝数：${fans}\n直播间id：${room != 0 ? room : '未开通直播'}\n粉丝牌：${fan_sign || '无'}` +
          '\n请输入正确的直播间id订阅')
      } else {
        msg.push(err_reply)
      }
      return e.reply(msg)
    }
    if (!info) {
      data[location_id] = {
        push: true,
        room: []
      }
    }
    data[location_id].room.push({
      nickname,
      room_id
    })
    savaData(type, data)
    return e.reply([
      `订阅成功！\n直播间id：${room_id}\nB站用户：${nickname}`,
      segment.image(up_data.data.up.face),
      `${loc}：${location_id}\n当前处于${data[location_id].push ? '开启' : '关闭'}直播推送状态`
    ])
  }

  async bLiveDelete(e) {
    if (!Permission.verify(e, UCPr.BlivePush)) return false
    const [location_id, room_id, type] = await getIdType(e)
    if (location_id.length < 5 || location_id.length > 10) {
      return e.reply('请输入正确的推送群号')
    }
    if (!room_id || room_id.length > 8) {
      return e.reply('请输入正确的直播间id')
    }
    const loc = type === 'Group' ? '群聊' : '私聊'
    const data = getData(type)
    const info = data[location_id]
    if (!info) {
      return e.reply(`${loc}：${location_id}未开启推送`)
    }
    if (!Check.propertyValue(info.room, 'room_id', room_id)) {
      return e.reply(`操作失败：${loc}：${location_id}` +
        `\n未订阅直播间：${room_id}`)
    }
    e.reply(`操作成功！\n推送${loc}：${location_id}\n取消直播推送：${room_id}`)
    data[location_id].room = _.reject(data[location_id].room, { room_id })
    if (data[location_id].room.length == 0) {
      delete data[location_id]
    }
    savaData(type, data)
    // 删除无用redis数据
    const redisType = type === 'Group' ? this.GroupPushed : this.PrivatePushed
    const pushed = (await Data.redisGet(redisType, {})) || {}
    if (pushed[location_id]?.includes(room_id)) {
      _.pull(pushed[location_id], room_id)
      Data.redisSet(redisType, pushed)
      const useful1 = _.flatMap(pushed)
      const _pushed = (await Data.redisGet(type !== 'Group' ? this.GroupPushed : this.PrivatePushed, {})) || {}
      const useful2 = _.flatMap(_pushed)
      const useful = useful1.concat(useful2)
      const info = (await Data.redisGet(this.PushedInfo, {})) || {}
      _.difference(Object.keys(info), useful).forEach(room => delete info[room])
      Data.redisSet(this.PushedInfo, info)
    }

  }

  async bLiveList(e) {
    if (isNaN(e.msg.replace(/#?(直播)?推送列表/, ''))) {
      return false
    }
    const [location_id, type] = await getIdType(e, false)
    if (location_id.length < 5 || location_id.length > 10) {
      return e.reply('请输入正确的推送群号')
    }
    const loc = type === 'Group' ? '群聊' : '私聊'
    const data = getData(type)
    if (!data[location_id]) {
      return e.reply(`${loc}：${location_id}未订阅推送`)
    }
    const title = `${loc}：${location_id}直播推送订阅列表：\n\n`
    let reply = title + Data.makeArrStr(data[location_id].room.map(v => `${v.nickname}-${v.room_id}`))
    if (type === 'Group') reply += `\n${data[location_id].atAll ? '已' : '未'}开启直播推送艾特全员`
    reply += `\n\n直播推送当前处于${UCPr.BlivePush[`is${type}`] && data[location_id].push ? '开启' : '关闭'}状态`
    return e.reply(reply)
  }

  async bLiveSwitch(e) {
    const regtest = e.msg.match(/推送(.*)/)[1]
    if (isNaN(regtest)) return false
    if (!Permission.verify(e, UCPr.BlivePush)) return false
    const [location_id, type] = await getIdType(e, false)
    const loc = type === 'Group' ? '群聊' : '私聊'
    if (!UCPr.BlivePush[`is${type}`]) return e.reply(`主人已关闭${loc}B站直播推送`)
    const data = getData(type)
    if (!data[location_id]) {
      return e.reply(`${loc}：${location_id}未订阅直播间，订阅直播间自动开启推送`)
    }
    const mode = /开启/.test(e.msg)
    if (data[location_id].push === mode) {
      return e.reply(`${loc}：${location_id}已经处于${mode ? '开启' : '关闭'}直播推送状态啦~`)
    }
    data[location_id].push = mode
    savaData(type, data)
    const msg = [`${loc}：${location_id}成功${mode ? '开启' : '关闭'}B站直播推送~`]
    if (mode) {
      msg.push(`\n当前订阅主播：\n${Data.makeArrStr(_.map(data[location_id].room, 'nickname'))}`)
    }
    return e.reply(msg)
  }

  async bLivePush() {
    if (!Data.check.call(this)) return false
    log.purple('BLivePush开始进行直播推送')
    const living = []
    const ended = []
    for (const type of ['Group', 'Private']) {
      const push_data = getData(type)
      const isGroup = type === 'Group'
      if (UCPr.BlivePush?.[`is${type}`]) {
        const loc_list = Object.keys(_.pickBy(push_data, { push: true }))
        const loc_room = {}
        loc_list.forEach(loc => {
          loc_room[loc] = _.map(push_data[loc].room, 'room_id')
        })
        const pushed = (await Data.redisGet(isGroup ? this.GroupPushed : this.PrivatePushed, {})) || {}
        for (const loc of loc_list) {
          for (const room of loc_room[loc]) {
            if (living.includes(room)) {
              if (pushed[loc]?.includes(room)) continue
              pushed[loc] = _.concat(pushed[loc] || [], room)
              const info = (await Data.redisGet(this.PushedInfo, {})) || {}
              const msg = [
                `主播：${info[room].uid}——开始直播啦！\n标题：${info[room].title}\n封面：`,
                segment.image(info[room].cover),
                `快去占座吧！\n${BLive + room}`
              ]
              atall(isGroup, loc, msg, push_data[loc])
              await common.sendMsgTo(loc, msg, type)
              await common.sleep(1)
              continue
            }
            if (ended.includes(room)) {
              if (!pushed[loc]?.includes(room)) continue
              _.pull(pushed[loc], room)
              if (pushed[loc].length == 0) {
                delete pushed[loc]
              }
              const info = (await Data.redisGet(this.PushedInfo, {})) || {}
              const msg = [
                `主播：${info[room].uid}——本次直播已结束\n标题：${info[room].title}\n封面：`,
                segment.image(info[room].cover),
                `直播开始时间：${info[room].start_time}`,
                `\n本次直播了${UCDate.diffStr(info[room].start_time)}`
              ]
              await common.sendMsgTo(loc, msg, type)
              await common.sleep(1)
              continue
            }
            const data = (await getLiveData(room))?.data
            if (!data || !data.live) continue
            if (Object.prototype.hasOwnProperty.call(data.live, 'video')) {
              if (!pushed[loc]?.includes(room)) {
                pushed[loc] = _.concat(pushed[loc] || [], room)
                living.push(room)
                const msg = [
                  `主播：${data.up.uid}——开始直播啦！\n标题：${data.live.title}\n封面：`,
                  segment.image(data.live.cover),
                  `快去占座吧！\n${BLive + room}`
                ]
                atall(isGroup, loc, msg, push_data[loc])
                await common.sendMsgTo(loc, msg, type)
                const info = {
                  uid: data.up.uid,
                  title: data.live.title,
                  cover: data.live.cover,
                  start_time: UCDate.NowTime
                }
                const pushed_info = (await Data.redisGet(this.PushedInfo, {})) || {}
                pushed_info[room] = info
                Data.redisSet(this.PushedInfo, pushed_info)
                await common.sleep(1)
              }
            } else {
              if (pushed[loc]?.includes(room)) {
                _.pull(pushed[loc], room)
                if (pushed[loc].length == 0) {
                  delete pushed[loc]
                }
                ended.push(room)
                const info = (await Data.redisGet(this.PushedInfo, {})) || {}
                const msg = [
                  `主播：${info[room].uid}——本次直播已结束\n标题：${info[room].title}\n封面：`,
                  segment.image(info[room].cover),
                  `直播开始时间：${info[room].start_time}`,
                  `\n本次直播了${UCDate.diffStr(info[room].start_time)}`
                ]
                await common.sendMsgTo(loc, msg, type)
                await common.sleep(1)
              }
            }
          }
        }
        log.purple(`已推送${isGroup ? '群聊' : '私聊'}：`)
        log.whiteblod(JSON.stringify(pushed, null, 2))
        Data.redisSet(isGroup ? this.GroupPushed : this.PrivatePushed, pushed)
      }
    }
    const info = (await Data.redisGet(this.PushedInfo, {})) || {}
    ended.forEach(room => delete info[room])
    Data.redisSet(this.PushedInfo, info)
    log.purple('BLivePush本次直播推送任务完毕')
  }

  async bLiving(e) {
    const [location_id, type] = await getIdType(e, false)
    if (location_id.length < 5 || location_id.length > 10) {
      return e.reply('请输入正确的推送群号')
    }
    const data = getData(type)
    if (!data[location_id]) {
      return e.reply(`${type === 'Group' ? '群聊' : '私聊'}：${location_id}未订阅推送`)
    }
    const pushed = (await Data.redisGet(type === 'Group' ? this.GroupPushed : this.PrivatePushed, {})) || {}
    if (pushed[location_id]?.length > 0) {
      const info = await Data.redisGet(this.PushedInfo, {})
      for (const room of pushed[location_id]) {
        const msg = [
          `主播：${info[room].uid}——正在直播中\n标题：${info[room].title}\n封面：`,
          segment.image(info[room].cover),
          `直播开始时间：${info[room].start_time}`,
          `\n已经直播了${UCDate.diffStr(info[room].start_time)}`,
          `\n快去捧场吧！\n${BLive + room}`
        ]
        await common.sendMsgTo(location_id, msg, type)
        await common.sleep(1)
      }
    } else {
      return e.reply('当前还没有订阅up主开播哦~')
    }
  }

  async bLiveClean(e) {
    if (!Check.permission(e.sender.user_id, 2)) return false
    redis.del(this.PushedInfo)
    redis.del(this.GroupPushed)
    redis.del(this.PrivatePushed)
    e.reply('操作成功，推送缓存数据已全部清空')
  }

  async bLiveAtall(e) {
    if (!Permission.verify(e, UCPr.BlivePush)) return false
    let [location_id, type] = await getIdType(e, false)
    if (type == 'Private') {
      if (e.sender.user_id === location_id) {
        return e.reply('只能在群里开启直播推送艾特全员哦~')
      }
      type = 'Group'
    }
    const data = getData(type)
    if (!data[location_id]) {
      return e.reply(`群聊：${location_id}未开启推送`)
    }
    const mode = /开启/.test(e.msg)
    if (mode && !await common.botIsGroupAdmin(location_id)) {
      return e.reply(UCPr.noPowReply + '\n群聊：' + location_id)
    }
    data[location_id].atAll = mode
    savaData(type, data)
    if (e.group_id == location_id) {
      return e.reply(`成功${mode ? '开启' : '关闭'}本群直播推送艾特全员`)
    }
    return e.reply(`成功${mode ? '开启' : '关闭'}群聊${location_id}的直播推送艾特全员`)
  }

}

async function init() {
  if (!Check.file(Path.BLPGroupjson)) {
    file.JSONsaver(Path.BLPGroupjson, {})
  }
  if (!Check.file(Path.BLPPrivatejson)) {
    file.JSONsaver(Path.BLPPrivatejson, {})
  }
}

function getData(type) {
  return file.JSONreader(Path[`BLP${type}json`])
}

function savaData(type, data) {
  return file.JSONsaver(Path[`BLP${type}json`], data)
}

function getLiveData(room_id) {
  return UCPr.fetch('BlivePush1', room_id)
}

function getUpInfo(uid) {
  return Data.getUpInfo.call(this, uid)
}

async function getIdType(e, isRoom = true) {
  const numMatch = e.msg.match(/\d+/g)
  const type = e.isGroup ? 'Group' : 'Private'
  const user = e.sender.user_id
  const self = e.group_id || user
  const isAppoint = numMatch && Check.permission(user, 2)
  if (!isRoom) {
    const location_id = isAppoint ? numMatch[0] : self
    return [location_id, type]
  }
  const room_id = numMatch ? numMatch[0] : null
  const location_id = isAppoint ? (numMatch[1] ? numMatch[1] : self) : self
  return [location_id, room_id, type]
}

async function atall(isGroup, loc, msg, info) {
  if (isGroup) {
    if (await common.botIsGroupAdmin(loc)) {
      if (info.atAll) {
        msg.unshift('\n')
        msg.unshift(segment.at('all'))
      }
    }
  }
}