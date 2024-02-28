import { Check, Data, common, log, UCPr, Path, file } from '../../../components/index.js'
import { UCGAPlugin } from '../../../models/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

/** 有时候icqq的监听会重复，做个CD限制 */
async function checkCD() {
  const key = `${this.redisData}:${this.groupId}:${this.userId}`
  const data = await Data.redisGet(key)
  if (data) return false
  Data.redisSet(key, '1', 3600)
  return true
}

const globalFloder = Path.get('WM', 'global')

const WM = {
  globalFloder,
  welcome: Path.join(globalFloder, 'welcome.json'),
  mourn: Path.join(globalFloder, 'mourn.json')
}

let globalWelcome, globalMourn

class UCWelcome extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-Welcome',
      dsc: 'UC群管·入群欢迎',
      Cfg: 'GAconfig.welcome',
      event: 'notice.group.increase'
    })
    this.redisData = '[UC]Welcome'
  }

  async accept(e, isGlobal, isView = false) {
    if (!isView) {
      if (!this.isOpen || this.B) return false
      if (!await checkCD.call(this)) return true
      if (this.user_id === this.qq) return log.white(`[新增群聊]${this.groupId}`)
    }
    if (isGlobal) this.Cfg = UCPr.defaultCFG.GAconfig.welcome
    const replyMsg = []
    if (isView && !this.isOpen) replyMsg.push(`注意：该群（${this.groupId}）未开启UC群管或入群欢迎\n`)
    if (this.Cfg.isAt) replyMsg.push(segment.at(this.userId))
    if (this.Cfg.isAvatar) {
      const avatarUrl = common.getAvatarUrl(this.userId)
      replyMsg.push(segment.image(avatarUrl))
    }
    const info = `<${e.nickname ?? this.userId}>（${this.userId}）`
    log.white(`[群员增加]${info} 群号：${this.groupId}`)
    const message = isGlobal ? globalWelcome : file.JSONreader(Path.get('WM', this.groupId, 'welcome.json')) ?? globalWelcome
    replyMsg.push(...common.makeMsg(message, 'info', info))
    if (e.group?.mute_left > 0) return log.mark(`Bot在群${this.groupId}内处于禁言状态，取消发送入群欢迎`)
    return common.sendMsgTo(isView || this.groupId, replyMsg, 'Group')
  }
}

UCPr.EventInit(UCWelcome)

class UCMourn extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-Mourn',
      dsc: 'UC群管·退群通知',
      Cfg: 'GAconfig.mourn.decrease',
      event: 'notice.group'
    })
    this.redisData = '[UC]Mourn'
  }

  async accept(e, isGlobal, isView = false) {
    if (!isView) {
      if (!this.isOpen || this.B) return false
      if (!await checkCD.call(this)) return true
      if (e.dismiss) return log.white(`[群聊解散]${this.groupId}`)
      if (this.user_id === this.qq) {
        if (e.operator_id !== this.qq) return log.white(`[被踢出群聊]${this.groupId}，操作者：${e.operator_id}`)
        return log.white(`[退出群聊]${this.groupId}`)
      }
    }
    if (isGlobal) this.Cfg = UCPr.defaultCFG.GAconfig.welcome
    const { card, nickname } = e.member ?? {}
    const info = `<${card || nickname || this.userId}>（${this.userId}）`
    const replyMsg = []
    if (isView && !this.isOpen) replyMsg.push(`注意：该群（${this.groupId}）未开启UC群管或退群通知\n`)
    if (this.Cfg.isAvatar) {
      const avatarUrl = common.getAvatarUrl(this.userId)
      replyMsg.push(segment.image(avatarUrl))
    }
    if (e.operator_id === this.userId) {
      log.white(`[群员退群]${info} 群号：${this.groupId}`)
      const message = isGlobal ? globalMourn : file.JSONreader(Path.get('WM', this.groupId, 'mourn.json')) ?? globalMourn
      replyMsg.push(...common.makeMsg(message, 'info', info))
      if (e.group?.mute_left > 0) return log.mark(`Bot在群${this.groupId}内处于禁言状态，取消发送退群通知`)
      return common.sendMsgTo(isView || this.groupId, replyMsg, 'Group')
    } else if (e.operator_id !== this.qq) {
      log.white(`[群员被踢]${info} 操作人：${e.operator_id}`)
      if (e.group?.mute_left > 0) return log.mark(`Bot在群${this.groupId}内处于禁言状态，取消发送退群通知`)
      return common.sendMsgTo(isView || this.groupId, `${info}被管理员${e.operator_id ?? ''}踢出群聊`, 'Group')
    }
    log.white(`[机器人踢人]${info}`)
  }
}

UCPr.EventInit(UCMourn)

class UCWMset extends UCGAPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-WMset',
      dsc: 'UC群管·进退群通知',
      rule: [
        {
          reg: /^#(UC)?查看(全局)?(入群欢迎|退群通知)(\s*\d{5,10})?$/i,
          fnc: 'view'
        },
        {
          reg: /^#(UC)?修改(全局)?(入群欢迎|退群通知)(\s*\d{5,10})?$/i,
          fnc: 'set'
        }
      ]
    })
    this.setFnc = '_replyContext'
    if (!this.groupId) return
    this.string = this.msg?.match(/入群欢迎|退群通知/)?.[0]
    if (!this.string) return
    this.type = this.string === '入群欢迎' ? 'welcome' : 'mourn'
    this.Cfg = _.get(this.GAconfig, this.type, {})
    this.isGlobal = /全局/.test(this.msg)
    if (this.isGlobal) {
      this.floderPath = WM.globalFloder
      this.jsonPath = WM[this.type]
      this.data = file.JSONreader(this.jsonPath) ?? []
      return
    }
    const numMatch = this.msg.match(/\d+/)
    if (!this.isGlobal && this.GM && numMatch) {
      this.groupId = numMatch[0]
      this.isAP = this.groupId
    }
    this.floderPath = Path.get('WM', this.groupId)
    this.jsonPath = Path.join(this.floderPath, `${this.type}.json`)
    this.data = file.JSONreader(this.jsonPath) ?? []
  }

  init() {
    Check.floder(WM.globalFloder, true)
    if (!Check.file(WM.welcome)) {
      file.JSONsaver(WM.welcome, [{ type: 'text', text: '欢迎info小伙伴进群~~~' }])
    }
    if (!Check.file(WM.mourn)) {
      file.JSONsaver(WM.mourn, [{ type: 'text', text: 'info退群了~' }])
    }
    globalWelcome = file.JSONreader(WM.welcome)
    globalMourn = file.JSONreader(WM.mourn)
    Data.watch(WM.welcome, () => (globalWelcome = file.JSONreader(WM.welcome)))
    Data.watch(WM.mourn, () => (globalMourn = file.JSONreader(WM.mourn)))
  }

  async view(e) {
    if (!this.isOpen) return e.reply(`请先开启UC群管及${this.string}`)
    if (!this.verifyPermission(this.Cfg.use)) return false
    const oriGroup = e.group_id
    e.group_id = this.groupId
    let app
    if (this.type === 'welcome') {
      app = new UCWelcome(e)
    } else {
      e.member = this.UC.sender
      e.operator_id = this.userId
      app = new UCMourn(e)
    }
    return app.accept(e, this.isGlobal, oriGroup)
  }

  async set(e) {
    if (!this.isOpen) return e.reply(`请先开启UC群管及${this.string}`)
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (this.isGlobal && !this.verifyLevel(4)) return false
    const { type, string, floderPath, jsonPath, isGlobal, data, isAP } = this
    e.oriData = { type, string, floderPath, jsonPath, isGlobal, data, isAP }
    this.setUCcontext()
    return this.reply(`请发送要修改的${isGlobal ? '全局' : (isAP ? `群${isAP}` : '本群')}${this.string}\n注：info会被替换为“用户名（QQ）”\n支持文字、图片、艾特组合`)
  }

  async _replyContext() {
    if (this.isCancel()) return
    if (!this.e.message) return this.finishReply('错误的内容')
    const { oriData } = this.getUCcontext()
    const { type, floderPath, jsonPath, string, isGlobal, data, isAP } = oriData
    Check.floder(floderPath, true)
    if (!isGlobal && !_.isEmpty(data)) {
      const imgs = _.filter(data, { type: 'image' })
      _.map(imgs, 'path').forEach(path => file.unlinkSync(path))
    }
    const reply = common.getMsg(this.e.message)
    let imgCount = 0
    for (const v of reply) {
      if (v.type !== 'image') continue
      v.path = await Data.download(v.url, floderPath, type + ++imgCount)
      _.unset(v, 'url')
      _.unset(v, 'file')
      _.unset(v, 'asface')
    }
    if (_.isEmpty(reply)) return this.finishReply('无有效参数，请重新修改')
    file.JSONsaver(jsonPath, reply)
    return this.finishReply(`修改${isGlobal ? '全局' : (isAP ? `群${isAP}` : '本群')}${string}成功\n可通过#查看${string}${isAP ?? ''}\n查看效果`, undefined, { quote: false })
  }
}

UCPr.EventInit(UCWMset)