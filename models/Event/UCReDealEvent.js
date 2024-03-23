import { common } from '../../components/index.js'
import UCEvent from '../UCEvent.js'
import _ from 'lodash'

export default class UCReDealEvent extends UCEvent {
  constructor(e, type) {
    super({
      e,
      name: 'UC-ReDealMsg',
      Cfg: 'config.switchBot'
    })
    /** 消息Event类型 */
    this.type = type
    this.reg = new RegExp(`^\\s*${UCPr.BotName}`, 'i')
    /** 是否匹配BotName前缀 */
    this.isPrefix = this.reg.test(this.msg)
    /** 群配置 */
    this.groupData = UCPr.botCfg.getConfig('group')
    /** 当前已下线 */
    this.isClosed = _.isEqual(_.get(this.groupData, `${this.groupId}.enable`), ['UC-switchBot'])
  }

  deal() {
    if (this.isClosed) {
      // 无下线响应指令权限
      if (!this.verifyPermission(this.Cfg.closedCommand, { isReply: false })) return 0
      // 响应艾特
      if (this.Cfg.isAt && this.e.atme) return this.dealAt()
      // 响应前缀
      if (this.Cfg.isPrefix && this.isPrefix) return this.dealPrefix()
    } else {
      // 全局前缀
      if (UCPr.globalPrefix && this.isPrefix) return this.dealPrefix()
    }
    return 0
  }

  dealAt() {
    this.e.message = this.e.message.filter(v => {
      if (v.type !== 'at') return true
      return v.qq !== this.qq
    })
    return this.ReDealMsg()
  }

  dealPrefix() {
    this.e.message.forEach(v => (v.type === 'text' && (v.text &&= v.text.replace(this.reg, ''))))
    return this.ReDealMsg()
  }

  async ReDealMsg() {
    // 避免重复处理
    this.e.isUCSwitchBot = true
    // 仅当关闭状态下才需要修改白名单
    this.isClosed && _.unset(this.groupData, `${this.groupId}.enable`)
    let result = await this.UCDealEvent(this.type, this.e)
    // 等待本体loader.deal处理完毕和本体CD
    await common.sleep(0.2)
    if (result === false && this.type === 'message.group' && !this.e.atme) {
      result = await this.BotDealEvent(this.e).catch(err => log.error('执行消息处理错误', err))
    }
    this.isClosed && _.set(this.groupData, `${this.groupId}.enable`, ['UC-switchBot'])
    return result
  }

}