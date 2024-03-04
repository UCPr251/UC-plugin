import { Data, UCPr, file, log, Check } from '../components/index.js'
import Base from './Base.js'
import _ from 'lodash'

export default class Help extends Base {
  constructor(thisArg) {
    super(thisArg)
    this.model = 'help'
    /** 用户权限等级 */
    this.level = Check.level(this.userId, this.groupId)
  }

  static get(thisArg) {
    const help = new Help(thisArg)
    return help.getData()
  }

  getIcon(iconNum) {
    return { x: -((iconNum - 1) % 10) * 50, y: -Math.floor((iconNum - 1) / 10) * 50 }
  }

  getData() {
    const groupCFG = UCPr.groupCFG(this.thisArg.groupId)
    const data = _.cloneDeep(UCPr.CFG.helpData.filter(group => {
      const { isOpen } = group
      if (isOpen && !isOpen(groupCFG)) return false
      // 筛选组
      return this.level >= group.require
    }))
    // 筛选元素
    for (const i in data) {
      const filterPower = data[i].list.filter(groupInfo => {
        const { require, swh } = groupInfo
        // 功能开关判断
        if (swh && !_.get(groupCFG[data[i].cfg], swh, true)) return false
        else if (swh === false) return false
        // 权限判断
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
      saveId: 'UC-help',
      headImg: `${this.imgPath}/namecard/${_.sample(file.readdirSync(`${this.imgPath}/namecard`, { type: '.png' }))}`,
      quality: 100,
      backgroupColor
    }
  }

}