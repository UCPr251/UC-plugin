import { Path, Check, Data, UCDate, common } from '../components/index.js'
import UCPlugin from '../model/UCPlugin.js'
import { segment } from 'icqq'

export default class UCBigjpg extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-bigjpg',
      dsc: 'AI无损放大图片',
      Cfg: 'config.bigjpg',
      rule: [
        {
          reg: /^#?(UC)?放大图片$/i,
          fnc: 'bigjpg'
        }
      ]
    })
    this.redisData = '[UC]bigjpg'
    this.setFnc = '_imgContext'
    this.setFnc2 = '_magnificationContext'
    this.setFnc3 = '_noiseContext'
  }

  init() {
    Check.floder(Path.bigjpg, true)
  }

  async bigjpg(e) {
    if (!this.check) return false
    if (!this.Cfg.isOpen) return false
    if (!this.verifyPermission(this.Cfg.use)) return false
    if (!this.M && this.Cfg.limits) {
      let new_times = 0
      const now_times = await Data.redisGet(this.redisData + e.sender.user_id, 0) || 0
      if (now_times) {
        if (now_times >= this.Cfg.limits) {
          return e.reply(`你今天已经放大了${now_times}次了，明天再来吧~`)
        }
        new_times = now_times
      }
      new_times++
      await Data.redisSet(this.redisData + e.sender.user_id, new_times, UCDate.EXsecondes)
    }
    if (!e.img) {
      this.setContext(this.setFnc)
      return e.reply('⚠ 喜欢的涩图图快发来吧')
    }
    Data.bigjpgRequest(e.img[0])
  }

  async _imgContext() {
    if (this.isCancel()) return false
    const url = await common.getPicUrl(this.e)
    if (!url) {
      this.reply('请发送图片')
    } else {
      this.e.url = url
      const c = [this.Cfg.x4 || this.M, this.Cfg.x8 || this.M, this.Cfg.x16 || this.M]
      if (c.every(v => !v)) {
        this.e.magnification = 2
        this.setContext(this.setFnc3)
        return this.finishReply('当前未开启4、8、16倍放大，自动选择2倍放大\n请选择降噪系数：0, 1, 2, 3, 4 \n分别表示降噪程度：无, 低, 中, 高, 最高')
      }
      this.setContext(this.setFnc2)
      this.finishReply(`请选择放大倍数：2${c[0] ? ', 4' : ''}${c[1] ? ', 8' : ''}${c[2] ? ', 16' : ''}`)
    }
  }

  _magnificationContext() {
    if (this.isCancel(this.setFnc2)) return false
    const { url } = this.getContext()._magnificationContext
    this.e.url = url
    this.e.magnification = parseInt(this.e.msg)
    if (isNaN(this.e.magnification) || !Check.str([2, 4, 8, 16], this.e.magnification)) {
      this.reply('无效参数，自动选择放大倍数：' + this.Cfg.magnification)
      this.e.magnification = this.Cfg.magnification
    } else if (!this.M && !this.Cfg[`x${this.e.magnification}`]) {
      this.reply(`当前未开启${this.e.magnification}倍放大哦~`)
    } else {
      this.setContext(this.setFnc3)
      this.finishReply('请选择降噪系数：0, 1, 2, 3, 4 \n分别表示降噪程度：无, 低, 中, 高, 最高', this.setFnc2)
    }
  }

  _noiseContext() {
    if (this.isCancel(this.setFnc3)) return false
    const { url, magnification } = this.getContext()._noiseContext
    let noise = parseInt(this.e.msg)
    if (isNaN(noise) || !Check.str([0, 1, 2, 3, 4], noise)) {
      this.reply('无效参数，自动选择降噪系数：' + this.Cfg.noise)
      noise = this.Cfg.noise
    }
    Data.bigjpgRequest.call(this, url, noise - 1, Math.log2(magnification))
    this.finishReply(`放大倍数：${magnification}\n降噪系数：${noise}\n正在放大图片…………\n可能需要较长时间，请耐心等待`, this.setFnc3)
  }

  async sendImage(buffer) {
    const name = `${this.e.sender.user_id}-${UCDate.NowTimeNum}.png`
    if (buffer.length > 5242880) {
      await common.sendFile(this.e, buffer, name, '放大成功咯，图片较大将会直接上传文件，注意查收哦~')
    } else {
      this.e.reply([segment.at(this.e.user_id), '放大成功咯'])
      this.e.reply(segment.image(buffer), true)
    }
  }
}