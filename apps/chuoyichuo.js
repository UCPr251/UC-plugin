import { Path, Data, UCDate, common, file, log, UCPr } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

/** 戳一戳文本内容，路径UC-plugin/resources/data/chuoyichuo.txt，可自行增删 */
const textList = file.readFileSync(Path.get('resdata', 'chuoyichuo.txt')).split('\n').map(v => v.trim())

const CD = {}

export default class UCChuoyichuo extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-chuoyichuo',
      dsc: '戳一戳回复',
      Cfg: 'config.chuoyichuo',
      event: 'notice.group.poke'
    })
    if (!e) return
    this.redisData = '[UC]chuoyichuo:' + this.groupId
  }

  get isCD() {
    if (!this.Cfg.CD) return false
    if (CD[this.groupId]) return true
    CD[this.groupId] = true
    setTimeout(() => {
      delete CD[this.groupId]
    }, this.Cfg.CD * 1000)
    return false
  }

  async accept(e) {
    const Cfg = this.Cfg
    if (!Cfg.isOpen) return false
    if (!this.verifyLevel()) return false
    if (e.target_id !== this.qq) return false
    if (this.isCD) return false
    log.whiteblod('戳一戳生效')
    let count = await Data.redisGet(this.redisData, 0)
    Data.redisSet(this.redisData, ++count, UCDate.EXsecondes)
    if (Cfg.isAutoSetCard) {
      if (!(UCPr.wz.ing && UCPr.wz.groupId === this.groupId)) {
        e.group.setCard(this.qq, `${Cfg.picPath}|${Cfg.groupCard.replace('num', count)}`)
      }
    }
    const randomNum = Math.random()
    // 回复文本+图片
    if (randomNum < Cfg.textimg) {
      let replyMsg = _.sample(textList)
      if (count > 10 && Cfg.chuoimg && randomNum / Cfg.textimg < Cfg.chuoimg) {
        replyMsg = `${Cfg.picPath}今天已经被戳${count}次了\n` + replyMsg
      }
      await this.reply(replyMsg)
      const files = file.readdirSync(Path.get('chuoyichuo', Cfg.picPath))
      const imgfile = _.sample(files)
      if (!imgfile) return
      await common.sleep(0.5)
      return this.reply(segment.image(Path.get('chuoyichuo', Cfg.picPath, imgfile)))
    }
    // 头像表情包
    if (randomNum < (Cfg.textimg + Cfg.face)) {
      return this.reply(segment.image(Buffer.from(await this.fetch('qiao', this.userId))), true)
    }
    // 禁言
    if (common.botIsGroupAdmin(e.group) && randomNum < (Cfg.textimg + Cfg.face + Cfg.mute)) {
      const mutetype = _.sample([1, 2])
      if (mutetype === 1) {
        await this.reply('说了不要戳了！\n坏孩子要接受' + Cfg.picPath + '的惩罚！')
        await common.sleep(1)
        await e.group.muteMember(this.userId, Cfg.muteTime * 60)
        return this.reply('哼~')
      } else {
        await this.reply('不！！')
        await common.sleep(1.5)
        await this.reply('准！！')
        await common.sleep(1.5)
        await this.reply('戳！！')
        await common.sleep(1)
        return e.group.muteMember(this.userId, Cfg.muteTime * 60)
      }
    }
    // 反击
    await this.reply('还戳是吧，看我戳洗你！')
    await common.sleep(1)
    await e.group.pokeMember(this.userId)
  }

}

class UCChuoyichuoSwitchPicPath extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-chuoyichuoSwitchPicPath',
      dsc: '切换戳一戳回复图包',
      Cfg: 'config.chuoyichuo',
      event: 'message',
      rule: [
        {
          reg: /^#?UC(切换)?戳一戳图包$/i,
          fnc: 'switchPicPath'
        }
      ]
    })
  }

  async switchPicPath() {
    if (!this.M) return false
    const picPaths = file.readdirSync(Path.chuoyichuo, { type: 'Directory' })
    return this.reply(`可选的戳一戳图包：\n${Data.makeArrStr(picPaths)}\n当前使用：${this.Cfg.picPath}\n使用#UC设置戳一戳图包+图包名 切换图包`)
  }

}

UCPr.EventInit(UCChuoyichuoSwitchPicPath)