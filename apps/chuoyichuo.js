import { Path, Data, UCDate, common, file, log, UCPr } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import _ from 'lodash'

/** 戳一戳文本内容，路径UC-plugin/resources/data/chuoyichuo.txt，可自行增删 */
const textList = file.readFileSync(Path.get('resdata', 'chuoyichuo.txt'), 'utf8').split('\n').map(v => v.trim())

const CD = {}
const apiList = [
  'https://api.lolimi.cn/API/face_pat/?QQ=', // 拍
  'https://api.lolimi.cn/API/face_petpet/?QQ=', // 摸
  'https://api.lolimi.cn/API/face_suck/?QQ=', // 吸
  'https://api.lolimi.cn/API/face_pound/?QQ=', // 捣
  'https://api.lolimi.cn/API/face_play/?QQ=', // 玩
  'https://api.lolimi.cn/API/face_bite/?QQ=', // 咬
  'https://api.lolimi.cn/API/si/?QQ=', // 撕
  'https://api.lolimi.cn/API/pa/api.php?QQ=' // 爬
]

UCPr.temp.apiList = apiList

export default class UCChuoyichuo extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-chuoyichuo',
      dsc: '戳一戳回复',
      Cfg: 'config.chuoyichuo',
      event: 'notice.group.poke',
      rule: [{ fnc: 'chuoyichuo' }]
    })
    if (!e) return
    this.redisData = '[UC]chuoyichuo:' + this.groupId
  }

  get isCD() {
    if (!this.Cfg.CD) return false
    if (CD[this.groupId]) return true
    CD[this.groupId] = true
    setTimeout(() => {
      Reflect.deleteProperty(CD, this.groupId)
    }, this.Cfg.CD * 1000)
    return false
  }

  async chuoyichuo() {
    const Cfg = this.Cfg
    if (!Cfg.isOpen || this.e.target_id !== this.qq) return false
    if (this.userId === this.qq) return false
    if (this.B || this.isCD) return false
    log.whiteblod('戳一戳生效')
    let count = await Data.redisGet(this.redisData, 0)
    Data.redisSet(this.redisData, ++count, UCDate.EXsecondes)
    if (Cfg.isAutoSetCard) {
      if (!(UCPr.wz.ing && UCPr.wz.groupId === this.groupId)) {
        this.group.setCard(this.qq, `${Cfg.picPath}|${Cfg.groupCard.replace('num', count)}`)
      }
    }
    const random = Math.random()
    let ret = Cfg.textimg
    // 回复文本+图片
    if (ret > random) {
      let replyMsg = _.sample(textList)
      if (Math.random() < Cfg.AiRecord && /[\u4e00-\u9fa5]{3,}/.test(replyMsg)) {
        const wav = await UCPr.function.getWavUrl(Cfg.picPath, replyMsg.replace(/\+/g, '加').replace(/-/g, '减'))
        if (wav) await this.reply(segment.record(wav))
        else await this.reply(replyMsg)
      } else {
        if (count > 10 && Cfg.chuoimg && random / Cfg.textimg < Cfg.chuoimg) {
          replyMsg = `${Cfg.picPath}今天已经被戳${count}次了\n` + replyMsg
        }
        await this.reply(replyMsg)
      }
      const files = file.readdirSync(Path.get('chuoyichuo', Cfg.picPath))
      const imgfile = _.sample(files)
      if (!imgfile) return true
      await common.sleep(0.5)
      return this.reply(segment.image(Path.get('chuoyichuo', Cfg.picPath, imgfile)))
    }
    // 头像表情包
    if ((ret += Cfg.face) > random) {
      return this.reply(segment.image(_.sample(apiList) + this.userId), true)
    }
    // 禁言
    if (this.UC.botIsPow_user && (ret += Cfg.mute) > random) {
      const mutetype = _.sample([1, 2, 3, 4, 5])
      const reply = async (...msg) => {
        for (const m of msg) {
          await this.reply(m)
          await common.sleep(1)
        }
      }
      if (mutetype === 1) {
        await reply('说了不要戳了！\n坏孩子要接受惩罚！', '哼~')
      } else if (mutetype === 2) {
        await reply('不！', '准！', '戳！')
      } else if (mutetype === 3) {
        await this.reply('小黑屋伺候！')
      } else if (mutetype === 4) {
        reply('喜欢玩是吧？', segment.image(Path.get('img', 'fuqima.gif')))
      } else {
        this.reply([segment.at(this.userId), '你怎么不说话？是不喜欢说话吗？', segment.image(Path.get('img', 'shuohua.jpg'))])
      }
      return await this.group.muteMember(this.userId, Cfg.muteTime * 60)
    }
    // 反击
    await this.reply(count % 2 === 0 ? '还戳是吧，看我戳洗你！' : '反击！')
    await common.sleep(1)
    await this.group.pokeMember(this.userId)
    return true
  }

}