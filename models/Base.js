import { Path, UCDate, UCPr } from '../components/index.js'
import Permission from './Permission.js'

const letters = '0123456789ABCDEF'

export default class Base {
  constructor(thisArg = {}) {
    /** UCPlugin实例对象 */
    this.thisArg = thisArg
    /** 用户Id */
    this.userId = this.thisArg.userId
    /** 群id */
    this.groupId = this.thisArg.groupId
    this.model = Path.Plugin_Name
    this._path = Path._path.replace(/\\/g, '/')
    this.imgPath = Path.img.replace(/\\/g, '/')
    this.pluResPath = Path.resources.replace(/\\/g, '/')
  }

  /** 获取用户权限实例 */
  Permission(cfg = {}) {
    return Permission.get(this.thisArg, cfg)
  }

  /** 群配置 */
  get groupCFG() {
    return UCPr.groupCFG(this.groupId)
  }

  /** 基础截图数据 */
  get screenData() {
    return {
      saveId: this.userId,
      cwd: this._path,
      tempPath: `${Path.Plugin_Name}/${this.model}`,
      tplFile: `./plugins/${Path.Plugin_Name}/resources/html/${this.model}/${this.model}.html`,
      pluResPath: this.pluResPath,
      imgType: 'jpeg',
      quality: 95,
      nowTime: UCDate.NowTime,
      version: UCPr.version
    }
  }

  /** 随机颜色 */
  getRandomColor() {
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  /** 随机浅色系颜色 */
  getRandomLightColor() {
    let color = '#'
    for (let i = 0; i < 3; i++) {
      const randomValue = Math.floor(Math.random() * 8)
      const lightValue = 8 + randomValue
      color += letters[lightValue]
    }
    return color
  }

}
