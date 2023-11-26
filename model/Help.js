import { helpData } from '../components/UCPr.js'
import { Data, UCPr, file, log } from '../components/index.js'
import Base from './Base.js'
import _ from 'lodash'

export default class Help extends Base {
  constructor(e) {
    super(e)
    this.model = 'help'
  }

  static get(e) {
    const help = new Help(e)
    return help.getData()
  }

  getIcon(iconNum) {
    return { x: -((iconNum - 1) % 10) * 50, y: -Math.floor((iconNum - 1) / 10) * 50 }
  }

  getData() {
    let data = _.cloneDeep(helpData.filter(group => _.get(UCPr, group.swh, true)))
    const power = this.power
    let iconNum = 0
    for (const i in data) {
      const filterPower = data[i].list.filter(groupInfo => {
        const { require, swh } = groupInfo
        // 功能开关判断
        if (swh && !_.get(UCPr.config, swh, true)) return false
        // 权限判断
        if (!require) return true
        if (typeof require === 'number') {
          return power >= require
        }
        const per = this.permission(require)
        log.debug(`[Help.getData]判断用户${per.userId} ${require}权限：${per.isPer}`)
        return per.isPer
      })
      iconNum += filterPower.length
      data[i].list = filterPower
    }
    data.iconNum = iconNum
    const randomNumArr = Data.generateRandomArray(1, 350, data.iconNum)
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