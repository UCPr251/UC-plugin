import BotDealEvent from './Event/BotDealEvent.js'
import UCDealEvent from './Event/UCDealEvent.js'
import UCPlugin from './UCPlugin.js'
import _ from 'lodash'

/** UC插件Event类 */
export default class UCEvent extends UCPlugin {
  constructor({
    e,
    name = 'UC插件·事件',
    dsc = 'UC插件·事件',
    event = 'message.group',
    priority,
    rule,
    Cfg
  }) {
    super({ e, name, dsc, event, priority, rule, Cfg })
    /**
     * - `message.group`: normal anonymous
     * <br>
     * - `message.private`: group friend other self
     * <br>
     * - `notice.group`: increase decrease recall sign admin ban transfer poke
     * <br>
     * - `request.group`: invite add
     */
    this.sub_type = ''
  }

  /** 获取群员info */
  getMemInfo(memId) {
    const memClient = this.group.pickMember(memId)
    if (!memClient?.info) return null
    return memClient.info
  }

  /** 获取群员名称 */
  getMemName(memId) {
    const memberInfo = this.getMemInfo(memId)
    if (!memberInfo) return memId
    const { card, nickname } = memberInfo
    return card || nickname || memId
  }

  /** 创建上下文，返回false再处理 */
  setUCcontext(fnc = this.setFnc, time = this.GAconfig.overTime) {
    const key = this.conKey()
    if (_.some(UCPr.hook, { key })) return
    const info = {
      key,
      fnc
    }
    UCPr.hook.push(info)
    super.setUCcontext(fnc, time)
    time && setTimeout(() => {
      if (_.remove(UCPr.hook, info).length) {
        log.yellow(`${key}操作超时已取消`)
      }
    }, time * 1000)
  }

  /** 完成并删除UCPr.hook数据 */
  finishUCcontext(fnc = this.setFnc) {
    _.remove(UCPr.hook, { key: this.conKey(), fnc })
    super.finishUCcontext(fnc = this.setFnc)
  }

  /**
   * 本体处理e
   * @returns {Promise<Boolean>} 是否有走底层的功能成功处理
   */
  async BotDealEvent(e = this.e) {
    return BotDealEvent(e).catch(err => log.error('[UCEvent]执行BotDealEvent消息处理错误', err))
  }

  /**
   * UC处理e
   * @param {} type 消息type
   * @returns {Promise<Boolean>} 是否有UC功能成功处理
   */
  async UCDealEvent(type, e = this.e) {
    return UCDealEvent(type, e).catch(err => log.error('[UCEvent]执行UCDealEvent消息处理错误', err))
  }

}