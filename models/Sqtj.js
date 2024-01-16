import Base from './Base.js'

export default class Sqtj extends Base {
  constructor(e) {
    super(e)
    this.model = 'sqtj'
  }

  static get(e, Data) {
    const help = new Sqtj(e)
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