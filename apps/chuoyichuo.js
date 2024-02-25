import { Path, Data, UCDate, common, file, log, UCPr } from '../components/index.js'
import { UCPlugin, UCEvent } from '../models/index.js'
import { segment } from 'icqq'
import _ from 'lodash'

// 回复文字列表
const textList = [
  '看我超级无敌旋风！',
  '诅咒你买方便面没有叉子！',
  '救命啊，有变态\n>_<！！！',
  '哼~~~',
  '你戳谁呢！你戳谁呢！！！\no(´^｀)o',
  '是不是要我揍你一顿才开心啊！！！',
  '食不食油饼？',
  '不要再戳了！我真的要被你气死了！！！',
  '怎么会有你这么无聊的人啊！！！\n(￢_￢)',
  '旅行者副本零掉落，旅行者深渊打不过，旅行者抽卡全保底，旅行者小保底必歪，旅行者找不到女朋友....',
  '诅咒你在公共厕所大号没有纸!',
  '你干嘛！',
  '休息一下好不好',
  '我生气了！咋瓦乐多!木大！木大木大！',
  '你是不是喜欢我？',
  '有完没完！',
  '不准戳了！！！',
  '朗达哟？',
  '变态！',
  '要被戳坏掉了>_<',
  '大叔，你没工作的吗？一天天就知道戳我',
  '哇啊啊！！真是的不可以戳戳\n>_<',
  '别…别戳了……再戳…要戳坏掉了\n>_<',
  '呐…呜~>_<',
  '啊！请不要…碰我',
  '嗯！轻一点！',
  '唔呃！~',
  '不要！！',
  '不要……欺负…我',
  '你干嘛……呃~痛！',
  '哒咩！',
  '可恶！',
  '囊哒哟~',
  '达咩！',
  '呜哇！',
  '你个坏蛋~',
  '（摇头）',
  '（后空翻）',
  '（劈叉）',
  '（惊醒）',
  '（楞）',
  '（眨眼）',
  '？',
  '？？',
  '？？？',
  '气气！',
  '过分分！',
  '走开啦！',
  '੭ ᐕ)੭*⁾⁾',
  '｀⌒´メ',
  'o(´^｀)o',
  '(。’▽’。)♡',
  '(〟-_・)ﾝ?',
  'Σ(°Д°;',
  '⋟﹏⋞',
  '◦˙▽˙◦',
  'ξ( ✿＞◡❛)',
  '_(:3 ⌒ﾞ)_',
  '（╯‵□′）╯︵┴─┴',
  'QAQ呜哇啊啊啊啊啊！',
  '【旅行者命之座-1】',
  '【旅行者保底次数+1】',
  '【纠缠之缘-10】',
  '【空月祝福-30】',
  '【大冒险家的经验-100】',
  '【摩拉-300w】',
  '【原石-1600】',
  '再戳，我就咬你！rua',
  '真是的，不要再戳啦！！',
  '唔，我生气了~~~',
  '这个仇，我记下了！',
  'QAQ请不要再戳啦！',
  '哎，疼疼疼!',
  '你还戳……']

export default class UCChuoyichuo extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-chuoyichuo',
      dsc: '戳一戳回复',
      Cfg: 'config.chuoyichuo',
      event: 'notice.group.poke'
    })
    this.redisData = '[UC]chuoyichuo'
  }

  async accept(e) {
    const Cfg = this.Cfg
    if (!Cfg.isOpen) return false
    if (!this.verifyLevel()) return false
    if (e.target_id !== this.qq) return false
    log.whiteblod('戳一戳生效')
    let count = await Data.redisGet(this.redisData + this.groupId, 0)
    Data.redisSet(this.redisData + this.groupId, ++count, UCDate.EXsecondes)
    if (Cfg.isAutoSetCard) {
      e.group.setCard(this.qq, `${this.BotName}|${Cfg.groupCard.replace('num', count)}`)
    }
    const randomNum = Math.random()
    // 回复文本+图片
    if (randomNum < Cfg.textimg) {
      let replyMsg = _.sample(textList)
      if (count > 10 && Cfg.chuoimg && randomNum / Cfg.textimg < Cfg.chuoimg) {
        replyMsg = `${this.BotName}今天已经被戳${count}次了\n` + replyMsg
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
    if (await common.botIsGroupAdmin(e.group) && randomNum < (Cfg.textimg + Cfg.face, Cfg.mute)) {
      const mutetype = _.sample([1, 2])
      if (mutetype === 1) {
        await this.reply('说了不要戳了！\n坏孩子要接受' + this.BotName + '的惩罚！')
        await common.sleep(1)
        await e.group.muteMember(this.userId, Cfg.muteTime * 60)
        await common.sleep(2)
        return this.reply('哼~')
      } else {
        await this.reply('不！！')
        await common.sleep(1.5)
        await this.reply('准！！')
        await common.sleep(1.5)
        await this.reply('戳！！')
        await common.sleep(1)
        return e.group.muteMember(this.userId, Cfg.MuteTime * 60)
      }
    }
    // 反击
    await this.reply('还戳是吧，看我戳洗你！')
    await common.sleep(1)
    await e.group.pokeMember(this.userId)
  }

}

class UCChuoyichuoSwitchPicPath extends UCEvent {
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
    const picPaths = file.readdirSync(Path.chuoyichuo, { removes: '一键重命名.js' })
    return this.reply(`可选的戳一戳图包：\n${Data.makeArrStr(picPaths)}\n当前使用：${this.Cfg.picPath}\n使用#UC设置戳一戳图包+图包名 切换图包`)
  }

}

UCPr.EventInit(UCChuoyichuoSwitchPicPath)