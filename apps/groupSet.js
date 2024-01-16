import { Path, Data, common, file } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import loader from '../../../lib/plugins/loader.js'
import _ from 'lodash'

let Cfg = {}, pluginsData

function getNewCfg() {
  Cfg = file.YAMLreader(Path.get('botConfig', 'group.yaml'))
  pluginsData = _.sortBy(_.map(loader.priority, ({ name, key }) => ({ name, key })), 'key')
}

Data.watch(Path.get('botConfig', 'group.yaml'), getNewCfg)

const noticeForGM = `温馨提示：
云崽的底层功能黑白名单生效逻辑是：
1、如果在某群内没有单独配置该群的功能黑白名单，则根据默认的（即全局）的功能黑白名单生效
2、如果在某群内单独配置了该群的功能黑白名单，则会忽略默认的（即全局）的功能黑白名单
3、比如说你在锅巴的默认群配置中禁用了A功能，然后新增了某群的配置并在该群内禁用了B功能，那么实际在该群被禁用的功能只有B而没有A
4、同理，如果你在锅巴默认群配置的功能白名单中启用了功能A，然后新增了某群的配置并在该群配置的功能白名单内添加了B功能，那么在该群内能够生效的功能只有B而没有A
5、再同理，其他的群配置也是如此，单独的群配置中存在的项会覆盖默认配置中同名项
6、如果你想要彻底禁用某一个功能而不受单独的群配置的影响，那么你可以选择卸载该功能（废话），也可以使用#UC锁定功能，不同于云崽底层的禁用，被#UC锁定的功能在任何位置都不会生效（相当于被删除）
7、顺带一提，默认群配置的功能黑名单等也会对私聊生效`

export default class UCGroupSet extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-groupSet',
      dsc: '指令修改config/group.yaml',
      rule: [
        {
          reg: /^#?(全局)?设置(群|个人)(冷却|CD)(\s*\d+){1,2}$/i,
          fnc: 'CD'
        },
        {
          reg: /^#?(全局)?(开启|关闭)仅艾特\s*\d*$/i,
          fnc: 'onlyReplyAt'
        },
        {
          reg: /^#?(全局)?(禁用|解禁)功能(?!列表).*/,
          fnc: 'disable'
        },
        {
          reg: /^#?(全局)?禁用功能列表.*/,
          fnc: 'disableList'
        }
      ]
    })
    this.init = getNewCfg
    this.setFnc = '_getNum'
  }

  save() {
    file.YAMLsaver(Path.get('botConfig', 'group.yaml'), Cfg)
  }

  getDisabled(isGlobal, groupId) {
    if (isGlobal) return Cfg.default.disable || []
    return Cfg[groupId]?.disable || []
  }

  getLoc() {
    const numMatch = this.msg.match(/\d{5,10}/)?.[0]
    let isGlobal = /全局/.test(this.msg)
    let groupId
    if (this.isGroup) {
      if (!this.GM) {
        if (isGlobal) return this.noPerReply()
        if (numMatch && numMatch != this.groupId) return this.noPerReply()
      }
      if (!isGlobal) {
        if (numMatch) {
          groupId = Number(numMatch)
          this.msg = this.msg.replace(numMatch, '').trim()
        } else {
          groupId = this.groupId
        }
      }
    } else {
      if (!numMatch) {
        isGlobal = true
      } else {
        groupId = numMatch
      }
    }
    return { isGlobal, groupId }
  }

  async CD(e) {
    if (!this.verifyLevel(3)) return
    const locData = this.getLoc()
    if (!locData) return
    const { isGlobal, groupId } = locData
    const cd = Number(this.msg.match(/\d+/)?.[0])
    const locStr = isGlobal ? '默认' : `群${groupId}`
    if (!cd) return e.reply(`请同时指定${locStr}配置中要设置的CD值，单位毫秒`)
    const isGroupCD = /群/.test(this.msg)
    const path = (isGlobal ? 'default' : groupId) + (isGroupCD ? '.groupGlobalCD' : '.singleCD')
    _.set(Cfg, path, cd)
    this.save()
    return e.reply(`操作成功，修改${locStr}配置${isGroupCD ? '群' : '个人'}CD为${cd}`)
  }

  async onlyReplyAt(e) {
    if (!this.verifyLevel(3)) return
    const locData = this.getLoc()
    if (!locData) return
    const { isGlobal, groupId } = locData
    const operation = Number(/开启/.test(this.msg))
    const path = (isGlobal ? 'default' : groupId) + '.onlyReplyAt'
    _.set(Cfg, path, operation)
    this.save()
    return e.reply(`操作成功，${operation ? '开启' : '关闭'}${isGlobal ? '默认' : `群${groupId}`}配置仅回复艾特`)
  }

  async singleCD(e) {
    if (!this.verifyLevel(3)) return
    const locData = this.getLoc()
    if (!locData) return
    const { isGlobal, groupId } = locData
    const cd = Number(this.msg.match(/\d+/)?.[0])
    const locStr = isGlobal ? '默认' : `群${groupId}`
    if (!cd) return e.reply(`请同时指定${locStr}配置中要设置的CD值，单位毫秒`)
    const path = isGlobal ? 'default.groupGlobalCD' : `${groupId}.groupGlobalCD`
    _.set(Cfg, path, cd)
    this.save()
    return e.reply(`操作成功，修改${locStr}配置群CD为${cd}`)
  }

  async disable(e) {
    if (!this.verifyLevel(3)) return
    const locData = this.getLoc()
    if (!locData) return
    const { isGlobal, groupId } = locData
    const path = isGlobal ? 'default.disable' : `${groupId}.disable`
    const disabled = this.getDisabled(isGlobal, groupId)
    const isDisable = /禁用/.test(this.msg)
    const filterPlugins = pluginsData.filter(v => isDisable === !disabled.includes(v.name))
    const list = _.map(filterPlugins, 'name')
    const fnc = isDisable ? '_disable' : '_cancelDisable'
    const fncStr = this.msg.match(/功能(.*)/)?.[1].trim()
    if (fncStr) {
      const toOperate = fncStr.split(/\s+/).filter(str => list.includes(str))
      if (!toOperate.length) {
        return e.reply(`无有效参数：${fncStr}`)
      }
      return this[fnc](toOperate, { path, disabled, groupId })
    }
    const operate = isDisable ? '禁用' : '解禁'
    const info = Data.makeArrStr(filterPlugins, { chunkSize: 50, length: 2000, property: 'name', property2: 'key' })
    const title = `请选择要${operate}的功能`
    const msg = [title]
    if (this.GM) msg.push(noticeForGM)
    const replyMsg = await common.makeForwardMsg(e, [...msg, `请选择要在${isGlobal ? '默认' : `群${groupId}`}配置中${operate}的功能的序号\n间隔可一次${operate}多个\n也可使用1-10可一次${operate}多个`, ...info], title)
    e.data = {
      list,
      fnc,
      path,
      disabled,
      groupId
    }
    this.setContext(this.setFnc, false, 300)
    return e.reply(replyMsg)
  }

  async disableList(e) {
    if (!this.verifyLevel(3)) return
    const locData = this.getLoc()
    if (!locData) return
    const { isGlobal, groupId } = locData
    const disabled = this.getDisabled(isGlobal, groupId)
    const infoData = _.sortBy(disabled.map(name => pluginsData.find(obj => obj.name === name)).filter(v => v), 'key')
    const infoMsg = Data.makeArrStr(infoData, { chunkSize: 50, length: 2000, property: 'name', property2: 'key' })
    const title = `${isGlobal ? '默认' : `群${groupId}`}禁用功能`
    const replyMsg = await common.makeForwardMsg(e, [title, ...infoMsg, '如需解禁功能可使用#解禁功能'])
    return e.reply(replyMsg)
  }

  async _disable(toDisable, data) {
    const { path, disabled, groupId } = data
    _.set(Cfg, path, _.sortBy(disabled.concat(toDisable)))
    this.save()
    this.reply(`操作成功，${groupId ? `群${groupId}` : '默认'}功能禁用：\n${Data.makeArrStr(toDisable, { length: 2000 })}`)
  }

  async _cancelDisable(toCancelDisable, data) {
    const { path, disabled, groupId } = data
    const canceledData = _.difference(disabled, toCancelDisable)
    _.set(Cfg, path, canceledData)
    if (groupId && _.isEmpty(canceledData) && Object.keys(Cfg[groupId]).length === 1) {
      _.unset(Cfg, groupId)
    }
    this.save()
    this.reply(`操作成功，${groupId ? `群${groupId}` : '默认'}功能解禁：\n${Data.makeArrStr(toCancelDisable, { length: 2000 })}`)
  }

}