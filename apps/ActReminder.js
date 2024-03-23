import { log, UCDate, common, Data, UCPr } from '../components/index.js'
import { UCPlugin } from '../models/index.js'
import fetch from 'node-fetch'
import _ from 'lodash'

/**
 * 此功能由
 * @Gimme
 * 定制并自愿于UC中集成公开
 * 定制日期：2024.3.10
 */

/** 排除的公告id */
const removes = {
  op: [],
  sr: [262, 356, 421]
}

/** 额外添加的公告id */
const additional = {
  op: [],
  sr: []
}

const API = {
  op: 'https://hk4e-api.mihoyo.com/common/hk4e_cn/announcement/api/getAnnList?game=hk4e&game_biz=hk4e_cn&lang=zh-cn&bundle_id=hk4e_cn&platform=pc&region=cn_gf01&level=55&uid=100000000',
  sr: 'https://hkrpg-api.mihoyo.com/common/hkrpg_cn/announcement/api/getAnnList?game=hkrpg&game_biz=hkrpg_cn&lang=zh-cn&auth_appid=announcement&authkey_ver=1&bundle_id=hkrpg_cn&channel_id=1&level=65&platform=pc&region=prod_gf_cn&sdk_presentation_style=fullscreen&sdk_screen_transparent=true&sign_type=2&uid=100000000'
}

const groupsToPush = {
  op: [],
  sr: []
}

export default class UCActReminder extends UCPlugin {
  constructor(e) {
    super({
      e,
      name: 'UC-ActReminder',
      dsc: '原神、星铁活动到期前提醒',
      event: 'message.group',
      rule: [
        {
          reg: /^#?(UC)?活动提醒测试$/i,
          fnc: 'test'
        }
      ]
    })
  }

  init() {
    ['op', 'sr'].forEach(mode => {
      Data.loadTask({
        cron: UCPr.config.ActReminder?.[`${mode}Cron`] ?? '0 0 12 * * *',
        name: this.name + mode,
        fnc: this.ActReminder.bind(this, mode)
      })
    })
  }

  async test() {
    if (!this.verifyLevel(4)) return
    await this.ActReminder('op')
    await this.ActReminder('sr')
  }

  async ActReminder(mode) {
    const gl = Array.from(Bot.gl.keys())
    for (const groupId of gl) {
      const Cfg = UCPr.groupCFG(groupId).config.ActReminder
      if (Cfg[`${mode}IsOpen`]) {
        groupsToPush[mode].push({ groupId, Cfg })
      }
    }
    // log.debug(mode)
    // log.debug(groupsToPush[mode])
    if (groupsToPush[mode].length) await this.reminder(mode)
  }

  async reminder(mode) {
    const type = mode === 'op' ? '原神' : '星铁'
    log.whiteblod(`开始进行${type}活动截止提醒推送`)
    const res = await fetch(API[mode])
      .then(res => res.json())
      .then(res => res.data)
    const list = mode === 'op' ? res?.list : res?.pic_list?.[0]?.type_list
    if (!list) return log.error(`获取${type}活动公告数据失败`)
    let _data
    if (mode === 'op') {
      _data = _.find(list, { type_id: 1, type_label: '活动公告' })?.list
    } else {
      _data = _.find(list, { pic_type: 2 })?.list
    }
    if (!_data) return log.error(`筛选${type}活动公告数据失败`)
    this.additional(_data, res, mode)
    const data = _data
      .filter(v => !removes[mode].includes(v.ann_id))
      .map(v => _.pick(v, ['title', 'subtitle', 'start_time', 'end_time', 'banner', 'img']))
    const diffs = data.map(v => UCDate.diffDate(undefined, v.end_time))
    const subtracts = diffs.map(v => v.toStr())
    // log.debug(subtracts)
    const daysSubtracts = diffs.map(v => v.Y * 365 + v.M * 30 + v.D)
    // log.debug(daysSubtracts)
    const duration = data.map(v => UCDate.diffDate(v.start_time, v.end_time).toStr())
    const msgToPush = []
    for (const i in daysSubtracts) {
      const info = data[i]
      const msg = [`【 ${type}活动截止通知 】`]
      msg.push('\n活动：' + (info.subtitle || info.title))
      msg.push(segment.image(info.banner || info.img))
      info.subtitle && msg.push('描述：' + info.title, '\n')
      msg.push('开始日期：' + info.start_time)
      msg.push('\n截止日期：' + info.end_time)
      msg.push('\n持续时间：' + duration[i])
      msg.push('\n剩余时间：' + subtracts[i])
      msgToPush.push(msg)
    }
    log.whiteblod(`${type}活动数据获取完毕，开始推送`)
    await this.sendMsg(msgToPush, daysSubtracts, mode)
  }

  additional(arr, res, mode) {
    if (!additional[mode].length) return
    const list = res.list[0].list
    for (const id of additional[mode]) {
      const ann = list.find(v => v.ann_id === id)
      // log.debug(ann)
      if (ann) arr.push(ann)
    }
  }

  async sendMsg(msgToPush, daysSubtracts, mode) {
    log.debug(daysSubtracts)
    for (const { groupId, Cfg } of groupsToPush[mode]) {
      log.debug('推送处理' + groupId)
      for (const i in daysSubtracts) {
        if (daysSubtracts[i] > Cfg[`${mode}Days`]) continue
        await common.sendMsgTo(groupId, Cfg[`${mode}AtAll`] ? [segment.at('all'), '\n', ...msgToPush[i]] : msgToPush[i], 'Group')
        await common.sleep(1)
      }
    }
    groupsToPush[mode] = []
  }

}