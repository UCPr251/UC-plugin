import { Path, file, Check, UCDate, UCPr } from '../components/index.js'
import Permission from './Permission.js'

export default class Base {
  constructor(e = {}) {
    this.e = e
    /** 用户权限等级 */
    this.level = Check.level.call(this)
    /** 用户Id */
    this.userId = e.sender?.user_id || e.user_id
    /** 群id */
    this.groupId = e.group_id
    this.model = Path.Plugin_Name
    this._path = Path._path.replace(/\\/g, '/')
    this.imgPath = Path.img.replace(/\\/g, '/')
    this.pluResPath = Path.resources.replace(/\\/g, '/')
  }

  /** 获取用户权限实例 */
  Permission(cfg = {}) {
    return Permission.get(this.e, cfg)
  }

  /** 更新日志数据 */
  get changlogData() {
    return file.readFileSync(Path.join(Path.UC, 'CHANGELOG.md'))
  }

  get groupCFG() {
    return UCPr.groupCFG(this.groupId)
  }

  /** 插件最近更新日期 */
  get updateTime() {
    return this.changlogData.match(/\d{1,2}-\d{1,2}/)[0]
  }

  /** 基础截图数据 */
  get screenData() {
    return {
      saveId: this.userId,
      cwd: this._path,
      tempPath: `${Path.Plugin_Name}/${this.model}`,
      tplFile: `./plugins/UC-plugin/resources/html/${this.model}/${this.model}.html`,
      pluResPath: this.pluResPath,
      imgType: 'jpeg',
      quality: 95,
      nowTime: UCDate.NowTime,
      updateTime: this.updateTime
    }
  }

  /** 随机颜色 */
  getRandomColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  /** 随机浅色系颜色 */
  getRandomLightColor() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 3; i++) {
      const randomValue = Math.floor(Math.random() * 8)
      const lightValue = 8 + randomValue
      color += letters[lightValue]
    }
    return color
  }

}
