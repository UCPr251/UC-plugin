import { Data, file, log, Check } from '../../components/index.js'
import Base from './Base.js'
import _ from 'lodash'

export default class Help extends Base {
  constructor(thisArg) {
    super(thisArg)
    this.model = 'help'
    /** 用户权限等级 */
    this.level = Check.level(this.userId, this.groupId)
    /** 已开启折叠的帮助组 */
    this.helpFold = UCPr.config.helpFold
  }

  static get(thisArg, command) {
    const help = new Help(thisArg, command)
    return help.getData(command)
  }

  static getCommand(msg) {
    let command = _.map(UCPr.CFG.helpData, 'command').filter(Boolean).find(command => new RegExp(`^${command}`, 'i').test(msg))
    if (command) {
      log.debug(`直接匹配到command：${command}`)
    } else {
      const useReg = _.filter(UCPr.CFG.helpData, 'reg')
      command = useReg.find(v => new RegExp(v.reg, 'i').test(msg))?.command
      log.debug(`模糊匹配到command：${command}`)
    }
    return command
  }

  getFoldGroup(fold) {
    const list = fold.map(group => {
      const { command, desc } = group
      const title = `#UC${command}帮助`
      return { title, desc }
    })
    if (!list.length) return
    return { group: '更多UC帮助', list }
  }

  getIcon(iconNum) {
    return { x: -((iconNum - 1) % 10) * 50, y: -Math.floor((iconNum - 1) / 10) * 50 }
  }

  getData(command) {
    const groupCFG = UCPr.groupCFG(this.thisArg.groupId)
    const oriData = command
      ? [_.cloneDeep(_.find(UCPr.CFG.helpData, { command })) ?? {}]
      : _.cloneDeep(UCPr.CFG.helpData)
    /** 折叠的组 */
    const fold = []
    const data = oriData.filter(group => {
      const { isOpen, command: _command, require } = group
      // 实时开关判断
      if (typeof isOpen === 'function' && !isOpen(groupCFG)) return false
      // 组类折叠判断
      if (!command && this.helpFold.includes(_command)) {
        if (this.level >= require) fold.push(group)
        return false
      }
      // 组类权限判断
      return this.level >= require
    })
    // 筛选元素
    for (const i in data) {
      const filterPower = data[i].list.filter(groupInfo => {
        const { require, swh } = groupInfo
        // 功能开关判断
        if (swh && !_.get(groupCFG[data[i].cfg], swh, true)) return false
        else if (swh === false) return false
        // 单独权限判断
        if (!require) return true
        if (typeof require === 'number') {
          return this.level >= require
        }
        const per = this.Permission(_.get(groupCFG[data[i].cfg], require))
        log.debug(`[Help.getData]判断用户${per.userId} ${require}权限：${per.isPermission}`)
        return per.isPermission
      })
      data[i].list = filterPower
      _.isEmpty(data[i].list) && data.splice(i, 1)
    }
    if (!data.length) return
    const folded = this.getFoldGroup(fold)
    !command && folded && data.unshift(folded)
    // 处理icon
    const iconNum = data.reduce((a, b) => a + b.list.length, 0)
    const randomNumArr = Data.generateRandomArray(1, 350, iconNum)
    let count = 0
    for (const group of data) {
      if (group?.list) {
        group.color = this.getRandomLightColor()
        const Oor1 = Math.round(Math.random())
        for (const i in group.list) {
          const xy = this.getIcon(group.list[i].icon || randomNumArr[count])
          count++
          const interval = i % 2 === Oor1
          group.list[i] = { ...group.list[i], ...xy, interval }
        }
      }
    }
    const backgroupColor = this.getRandomColor()
    return {
      ...this.screenData,
      helpData: data,
      saveId: 'UC-Help',
      headImg: `${this.imgPath}/namecard/${_.sample(file.readdirSync(`${this.imgPath}/namecard`, { type: '.png' }))}`,
      quality: 100,
      backgroupColor
    }
  }

}