import Base from './Base.js'

export default class Sqtj extends Base {
  constructor(thisArg) {
    super(thisArg)
    this.model = 'sqtj'
  }

  static get(thisArg, Data) {
    const help = new Sqtj(thisArg)
    return help.getData(Data)
  }

  getData(Data) {
    return {
      ...this.screenData,
      ...Data,
      saveId: 'UC-sqtj',
      quality: 100
    }
  }
}