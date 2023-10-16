import { Path, common, file, UCPr } from './index.js'

/** 对config设置的Admin操作 */

const Admin = {
  /**
   * 修改config.yaml属性对应值
   * @param {*} element 需要操作的元素
   * @param {*} operation 修改值
   * @returns {undefined|true|'error'|'already'} 操作结果code
   */
  changeCfg(element, operation) {
    const cfg = UCPr.config
    if (cfg[element] === undefined) return undefined
    if (cfg[element] === operation) return 'already'
    cfg[element] = operation
    file.YAMLsaver(Path.configyaml, cfg)
  },

  /** 修改定时任务执行corn小时数 */
  setTaskCron(taskEnglish, hour) {
    if (hour > 23 || hour < 0) return false
    const cfg = UCPr.config
    const corn = cfg.cron
    corn[taskEnglish] = parseInt(hour)
    file.YAMLsaver(Path.configyaml, cfg)
  },

  /** 踢指定群员 */
  async kickMemberArr(groupId, kickArr) {
    for (let userId of kickArr) {
      await common.sleep(10)
      await this.kickMember(groupId, userId)
    }
    this.reply('清理任务结束')
    this.finish('_chooseNum')
  }

}

export default Admin
