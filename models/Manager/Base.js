/** 管理器 */
export default class ManagerBase {
  constructor(folderPath, thisArg, note = '') {
    /** 目标文件目录 */
    this.folderPath = folderPath
    /** UCPluignClient */
    this.arg = thisArg
    /** 回复 */
    this.reply = thisArg.reply
    /** e */
    this.e = thisArg.e
    /** 提示信息 */
    this.note = note
    /** 选择hook */
    this.chooseFnc = '__chooseContext'
    /** 中转hook */
    this.transferFnc = '__transferStation'
  }
}