import { Path, Data, UCDate, common, file, log, UCPr } from '../components/index.js'
import { segment } from 'icqq'
import path from 'path'

// 回复文字列表
const textList = [
  '看我超级无敌旋风！',
  '诅咒你买方便面没有叉子！',
  '救命啊，有变态\n>_<！！！',
  '哼~~~',
  '你戳谁呢！你戳谁呢！！！\no(´^｀)o',
  '是不是要本萝莉揍你一顿才开心啊！！！',
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
  '变态萝莉控！',
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

export class UCChuoyichuo extends plugin {
  constructor() {
    super({
      name: 'UC-chuoyichuo',
      dsc: '戳一戳回复',
      event: 'notice.group.poke',
      priority: UCPr.priority
    })
    this.redisData = '[UC]chuoyichuo'
  }

  async accept(e) {
    if (!UCPr.chuoyichuo.isOpen) return false
    if (e.target_id !== UCPr.qq) return false
    log.whiteblod('戳一戳生效')
    let count = await Data.redisGet(this.redisData + e.group_id, 0) || 0
    Data.redisSet(this.redisData + e.group_id, ++count, UCDate.EXsecondes)
    const Cfg = UCPr.chuoyichuo
    if (Cfg.isAutoSetCard) {
      e.group.setCard(UCPr.qq, `${UCPr.BotName}|${Cfg.groupCard.replace('num', count)}`)
    }
    const randomNum = Math.random()
    // 回复文本+图片
    if (randomNum < Cfg.textimg) {
      let replyMsg = textList[Math.ceil(Math.random() * textList.length)]
      if (Cfg.chuoimg && Math.random() < Cfg.chuoimg) {
        replyMsg = `${UCPr.BotName}今天已经被戳${count}次了\n` + replyMsg
      }
      await e.reply(replyMsg)
      const files = file.readdirSync(Path.chuoyichuo)
      const imgfile = files[Math.ceil(Math.random() * files.length)]
      await common.sleep(0.5)
      return e.reply(segment.image(path.join(Path.chuoyichuo, imgfile)))
    }
    // 头像表情包
    if (randomNum < (Cfg.textimg + Cfg.face)) {
      return e.reply(segment.image(Buffer.from(await UCPr.fetch('qiao', e.operator_id))), true)
    }
    // 禁言
    if (await common.botIsGroupAdmin(e.group) && randomNum < (Cfg.textimg + Cfg.face, Cfg.mute)) {
      const mutetype = Math.ceil(Math.random() * 2)
      if (mutetype === 1) {
        await e.reply('说了不要戳了！\n坏孩子要接受' + UCPr.BotName + '的惩罚！')
        await common.sleep(1)
        await e.group.muteMember(e.operator_id, Cfg.muteTime * 60)
        await common.sleep(2)
        return e.reply('哼~')
      } else {
        await e.reply('不！！')
        await common.sleep(1.5)
        await e.reply('准！！')
        await common.sleep(1.5)
        await e.reply('戳！！')
        await common.sleep(1)
        return await e.group.muteMember(e.operator_id, Cfg.MuteTime * 60)
      }
    }
    // 反击
    await e.reply('还戳是吧，看我戳洗你！')
    await common.sleep(1)
    await e.group.pokeMember(e.operator_id)
  }

}