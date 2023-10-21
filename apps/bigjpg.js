import { Path, Check, Data, UCDate, UCPr, Permission, Admin } from '../components/index.js'
import plugin from '../../../lib/plugins/plugin.js'
import { segment } from 'icqq'

Check.floder(Path.bigjpg, true)

export class UCBigjpg extends plugin {
  constructor() {
    super({
      name: 'UC-bigjpg',
      dsc: 'AI无损放大图片',
      event: 'message',
      priority: UCPr.priority,
      rule: [
        {
          reg: /^#?(UC)?放大图片$/i,
          fnc: 'bigjpg'
        },
        {
          reg: /^#(UC)?(开启|关闭)放大(图片)?((4|8|16)倍)?$/,
          fnc: 'Switch'
        },
        {
          reg: /^#?(UC)?放大图片切换(卡通|图片)$/i,
          fnc: 'SwitchMode'
        }
      ]
    })
    this.redisData = '[UC]bigjpg'
    this.setFnc = '_imgContext'
    this.setFnc2 = '_magnificationContext'
    this.setFnc3 = '_noiseContext'
  }

  async Switch(e) {
    const per = new Permission(e, { ...UCPr.bigjpg })
    if (!per.isMaster && !per.isAdmin) return per.judge(true)
    const num = e.msg.match(/\d+/)?.[0]
    const isOpen = !/开启/.test(e.msg)
    if (num) {
      Admin.changeCfg(`bigjpg.x${num}Limit`, isOpen)
    } else {
      Admin.changeCfg('bigjpg.isM', !isOpen)
      Admin.changeCfg('bigjpg.isE', isOpen)
    }
    return e.reply('操作成功', true)
  }

  async SwitchMode(e) {
    const per = new Permission(e, { ...UCPr.bigjpg })
    if (!per.isMaster && !per.isAdmin) return per.judge(true)
    const isArt = /卡通/.test(e.msg)
    Admin.changeCfg('bigjpg.style', isArt ? 'art' : 'photo')
    return e.reply('操作成功', true)
  }

  async bigjpg(e) {
    if (!Data.check.call(this)) return false
    const per = new Permission(e, { ...UCPr.bigjpg })
    if (!per.judge()) return false
    if (!per.isMaster && UCPr.bigjpg.limits) {
      let new_times = 0
      const now_times = await Data.redisGet(this.redisData + e.sender.user_id, 0) || 0
      if (now_times) {
        if (now_times >= UCPr.bigjpg.limits) {
          return e.reply(`你今天已经放大了${now_times}次了，明天再来吧~`)
        }
        new_times = now_times
      }
      new_times++
      await Data.redisSet(this.redisData + e.sender.user_id, new_times, UCDate.EXsecondes)
    }
    if (!e.img) {
      e.per = per
      this.setContext(this.setFnc)
      return e.reply('⚠ 喜欢的涩图图快发来吧')
    }
    Data.bigjpgRequest(e.img[0])
  }

  _imgContext() {
    if (Data.isCancel.call(this)) return false
    if (!this.e.img) {
      this.reply('请发送图片')
    } else {
      this.e.per = this.getContext()._imgContext.per
      const Cfg = UCPr.bigjpg
      const c = [Cfg.x4Limit, Cfg.x8Limit, Cfg.x16Limit]
      if (!this.e.per.isMaster && c.every(v => v)) {
        this.e.magnification = 2
        this.setContext(this.setFnc3)
        return Data.finish.call(this, '当前已开启4、8、16倍放大限制，自动选择2倍放大\n请选择降噪系数：0, 1, 2, 3, 4 \n分别表示降噪程度：无, 低, 中, 高, 最高')
      }
      this.setContext(this.setFnc2)
      Data.finish.call(this, `请选择放大倍数：2${c[0] ? '' : ', 4'}${c[1] ? '' : ', 8'}${c[2] ? '' : ', 16'}`)
    }
  }

  _magnificationContext() {
    if (Data.isCancel.call(this, this.setFnc2)) return false
    const { img, per } = this.getContext()._magnificationContext
    this.e.img = img
    this.e.magnification = parseInt(this.e.msg)
    if (isNaN(this.e.magnification) || !Check.str([2, 4, 8, 16], this.e.magnification)) {
      this.reply('无效参数，自动选择放大倍数：' + UCPr.bigjpg.magnification)
      this.e.magnification = UCPr.bigjpg.magnification
    } else if (!per.isMaster && UCPr.bigjpg[`x${this.e.magnification}Limit`]) {
      this.reply(`当前未开启${this.e.magnification}倍放大哦~`)
      return this.finish(this.setFnc2)
    }
    this.setContext(this.setFnc3)
    Data.finish.call(this, '请选择降噪系数：0, 1, 2, 3, 4 \n分别表示降噪程度：无, 低, 中, 高, 最高', this.setFnc2)
  }

  _noiseContext() {
    if (Data.isCancel.call(this, this.setFnc3)) return false
    const { img, magnification } = this.getContext()._noiseContext
    let noise = parseInt(this.e.msg)
    if (isNaN(noise) || !Check.str([0, 1, 2, 3, 4], noise)) {
      this.reply('无效参数，自动选择降噪系数：' + UCPr.bigjpg.noise)
      noise = UCPr.bigjpg.noise
    }
    Data.bigjpgRequest.call(this, img[0], noise - 1, Math.log2(magnification))
    Data.finish.call(this, `放大倍数：${magnification}\n降噪系数：${noise}\n正在放大图片…………\n可能需要较长时间，请耐心等待`, this.setFnc3)
  }

  sendImage(buffer) {
    const name = `${this.e.user_id}-${UCDate.NowTime}.png`
    if (buffer.length > 5242880) {
      if (this.e.isGroup) {
        this.e.reply([segment.at(this.e.user_id), '放大成功咯,图片较大将会直接发送文件，注意查收哦'])
        this.e.group.fs.upload(buffer, undefined, name)
      } else {
        this.e.friend.sendFile(buffer, name)
      }
    } else {
      this.e.reply([segment.at(this.e.user_id), '放大成功咯'])
      this.e.reply(segment.image(buffer), true)
    }
  }
}