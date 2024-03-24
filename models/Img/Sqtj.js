import { file, Path } from '../../components/index.js'
import Base from './Base.js'

export default class Sqtj extends Base {
  constructor(thisArg, model = 'sqtj') {
    super(thisArg)
    this.model = model
  }

  static get(thisArg, Data, model) {
    const help = new Sqtj(thisArg, model)
    return help.getData(Data)
  }

  getData(Data) {
    const bgImgFolder = Path.get('unNecRes', 'sqtj')
    const imgs = file.readdirSync(bgImgFolder, { type: 'File' })
    const bgImg = imgs.length ? Path.join(bgImgFolder, imgs[Math.floor(imgs.length * Math.random())]).replace(/\\/g, '/') : null
    return {
      ...this.screenData,
      ...Data,
      bgImg,
      saveId: 'UC-Sqtj'
    }
  }
}