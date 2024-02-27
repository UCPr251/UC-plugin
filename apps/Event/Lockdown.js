import { Path, Check, Data, common, file, UCPr } from '../../components/index.js'
import { UCEvent } from '../../models/index.js'
import loader from '../../../../lib/plugins/loader.js'
import _ from 'lodash'

const removes = {}

let pluginsData, lockedData

class UCLockdown extends UCEvent {
  constructor(e) {
    super({
      e,
      name: 'UC-Lockdown',
      dsc: '锁定功能，禁止使用',
      event: 'message',
      rule: [
        {
          reg: /^#?(UC)?(锁定|解锁)功能(?!列表).*/i,
          fnc: 'lockdown'
        },
        {
          reg: /^#?(UC)?锁定功能列表$/i,
          fnc: 'lockdownList'
        }
      ]
    })
  }

  init() {
    if (!Check.file(Path.lockdownjson)) {
      file.JSONsaver(Path.lockdownjson, [])
    } else {
      this.refreshLocked()
      setImmediate(this.lock)
    }
  }

  lock() {
    lockedData.forEach(({ name }) => {
      const info = Data.remove(loader.priority, name, 'name')[0]
      if (!removes[name] && info) {
        removes[name] = info
      }
    })
  }

  refreshLocked() {
    lockedData = file.JSONreader(Path.lockdownjson)
  }

  refreshPluginsData() {
    pluginsData = _.sortBy(_.map(loader.priority, ({ name, key }) => ({ name, key })), 'key')
  }

  async lockdown(e) {
    if (!this.GM) return false
    const isLock = /锁定/.test(this.msg)
    const lockedName = _.map(lockedData, 'name')
    this.refreshPluginsData()
    const filterPlugins = isLock ? pluginsData.filter(({ name }) => !lockedName.includes(name)) : lockedData
    const fnc = isLock ? '_newLock' : '_unlock'
    const fncStr = this.msg.match(/功能(.*)/)?.[1].trim()
    if (fncStr) {
      const toOperate = fncStr.split(/\s+/).reduce((acc, str) => {
        const info = filterPlugins.find(v => v.name === str)
        if (info) acc.push(info)
        return acc
      }, [])
      if (!toOperate.length) {
        return this.reply(`无有效参数：${fncStr}`)
      }
      return this[fnc](toOperate)
    }
    const operate = isLock ? '锁定' : '解锁'
    const info = Data.makeArrStr(filterPlugins, { chunkSize: 100, length: 3500, property: 'name', property2: 'key' })
    const title = `请选择要${operate}的功能`
    const replyMsg = await common.makeForwardMsg(e, [title, `请选择要${operate}的功能的序号\n间隔可一次${operate}多个\n也可使用1-10一次${operate}多个`, ...info], title)
    e.data = {
      list: filterPlugins,
      fnc
    }
    this.setUCcontext()
    return this.reply(replyMsg)
  }

  async lockdownList() {
    if (!this.GM) return false
    return this.reply(`已锁定功能如下：\n\n${Data.empty(Data.makeArrStr(lockedData, { length: 2000, property: 'name', property2: 'key' }))}\n\n可通过#UC解锁功能 解除锁定`)
  }

  _newLock(arr) {
    const newData = _.uniqWith(_.concat(lockedData, arr), _.isEqual)
    file.JSONsaver(Path.lockdownjson, newData)
    this.refreshLocked()
    this.lock()
    const msg = Data.makeArrStr(_.map(arr, 'name'))
    this.reply(`操作成功，锁定功能：\n${msg}`)
  }

  _unlock(arr) {
    for (const { name } of arr) {
      const info = removes[name]
      if (info) {
        loader.priority.push(info)
        delete removes[name]
      }
    }
    loader.priority = _.sortBy(loader.priority, 'priority')
    log.red('刷新插件优先级排序')
    const newData = _.difference(lockedData, arr)
    file.JSONsaver(Path.lockdownjson, newData)
    this.refreshLocked()
    const msg = Data.makeArrStr(_.map(arr, 'name'))
    this.reply(`操作成功，解锁功能：\n${msg}`)
  }

}

UCPr.EventInit(UCLockdown)