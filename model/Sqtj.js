import Base from './Base.js'

export default class Sqtj extends Base {
  constructor(e) {
    super(e)
    this.model = 'sqtj'
  }

  static get(e, charArr, dsw, bqd, shwz) {
    const help = new Sqtj(e)
    return help.getData(charArr, dsw, bqd, shwz)
  }

  getData(charArr, dsw, bqd, shwz) {
    return {
      ...this.screenData,
      charArr,
      dsw,
      bqd,
      shwz,
      saveId: 'UC-sqtj'
    }
  }
}