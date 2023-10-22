import { UCPr, Path, file, Data } from './components/index.js'
import { now_config } from './components/UCPr.js'
import path from 'path'
import _ from 'lodash'

Data.refresh()

/**
 * 设置锅巴展示配置
 * @param {property} field 属性名
 * @param {string} label 展示名
 * @param {'Input'|'InputNumber'|'InputTextArea'|'Switch'|'Select'} component 展示属性
 * @param {string} bottomHelpMessage 帮助信息
 * @param {object} componentProps 配置项, max, min等
 * @param {object} optional 可选项
 */
function s(field, label, component, bottomHelpMessage, componentProps = {}, optional = { required: false, helpMessage: undefined }) {
  let display = {
    field,
    label,
    component,
    bottomHelpMessage,
    componentProps
  }
  return _.merge(display, optional)
}
const judgePriority = '权限判断优先级：主人>黑名单>全局仅主人>功能仅主人>允许群聊=允许私聊>允许任何人>允许插件管理员=允许群管理员'
const judgeProperty = ['isG', 'isP', 'isM', 'isA', 'isGA', 'isE']
const judgeInfo = ['允许群聊使用', '允许私聊使用', '仅主人', '允许插件管理', '允许群管理', '允许任何人']
const judgeHelpInfo = [
  '是否允许群聊使用，关闭仅主人可群聊使用',
  '是否允许私聊使用，关闭仅主人可私聊使用',
  '是否仅允许主人使用',
  '是否允许群插件管理员使用，关闭仅主人或群原生管理员可使用',
  '是否允许群原生管理员使用，关闭仅主人或插件群管理员可使用',
  '是否允许任何人使用，关闭仅主人或管理员可使用'
]

function sPRO(property, name, options = [true, true, true, true, true, true]) {
  const info = []
  for (let i in judgeProperty) {
    if (!options[i]) continue
    info.push(s(property + '.' + judgeProperty[i], judgeInfo[i], 'Switch',
      judgeHelpInfo[i] + name, {},
      { helpMessage: judgePriority }))
  }
  return _.flatMap(info)
}

let js = []

if (file.existsSync(path.join(Path.apps, 'switchBot.js'))) {
  const newCfg = [
    {
      label: '【UC】指定群开关Bot设置',
      component: 'Divider'
    },
    s('switchBot.openMsg', '开启Bot回复', 'Input',
      '开启Bot的回复，BotName会被替换为上面设置的BotName的名称'),
    s('switchBot.closeMsg', '关闭Bot回复', 'Input',
      '关闭Bot的回复，BotName会被替换为上面设置的BotName的名称'),
    s('switchBot.openReg', '开启触发词', 'Input',
      '让Bot上班的指令：BotName+关键词即可触发，多个请用|间隔'),
    s('switchBot.closeReg', '关闭触发词', 'Input',
      '让Bot下班的指令：BotName+关键词即可触发，多个请用|间隔'),
    ...sPRO('switchBot', '群开关Bot', [false, false, true, true, true, false])
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(path.join(Path.apps, 'BlivePush.js'))) {
  const newCfg = [
    {
      label: `【UC】B站直播推送设置${Data.check('BlivePush') ? '' : '（您当前未购买此插件）'}`,
      component: 'Divider'
    },
    s('BlivePush.isGroup', '群聊推送开关', 'Switch',
      '群聊推送全局开关，关闭不再推送群聊'),
    s('BlivePush.isPrivate', '私聊推送开关', 'Switch',
      '私聊推送全局开关，关闭不再推送私聊'),
    s('BlivePush.mins', '推送检测间隔', 'InputNumber',
      '推送检测间隔，单位分钟，不建议小于4',
      { min: 2 }),
    ...sPRO('BlivePush', '直播推送')
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(path.join(Path.apps, 'bigjpg.js'))) {
  const newCfg = [
    {
      label: `【UC】放大图片设置${Data.check('bigjpg') ? '' : '（您当前未购买此插件）'}`,
      component: 'Divider'
    },
    s('bigjpg.apiKey', 'ApiKey', 'Input'),
    s('bigjpg.style', '放大图片风格', 'Select',
      '可选卡通和照片，对于卡通图片放大效果最佳',
      {
        options: [
          { label: '卡通', value: 'art' },
          { label: '照片', value: 'photo' }
        ]
      }),
    s('bigjpg.noise', '默认降噪程度', 'Select',
      '默认降噪级别，可选[无，低，中，高，最高]',
      {
        options: [
          { label: '无', value: 0 },
          { label: '低', value: 1 },
          { label: '中', value: 2 },
          { label: '高', value: 3 },
          { label: '最高', value: 4 }
        ]
      }),
    s('bigjpg.magnification', '默认放大倍数', 'Select',
      '默认放大倍数，可选[2倍，4倍，8倍，16倍]',
      {
        options: [
          { label: '2倍', value: 2 },
          { label: '4倍', value: 4 },
          { label: '8倍', value: 8 },
          { label: '16倍', value: 16 }
        ]
      }),
    s('bigjpg.limits', '每日放大数量限制', 'InputNumber',
      '每人每天放大次数限制，0为不限制，主人不受限',
      { min: 0 }),
    s('bigjpg.isSave', '是否自动保存图片', 'Switch',
      '放大的图片是否自动保存本地。路径UC-plugin/resources/bigjpg'),
    s('bigjpg.x4Limit', '4倍放大限制', 'Switch',
      '4倍限制，开启仅允许主人放大4倍'),
    s('bigjpg.x8Limit', '8倍放大限制', 'Switch',
      '8倍限制，开启仅允许主人放大8倍'),
    s('bigjpg.x16Limit', '16倍放大限制', 'Switch',
      '16倍限制，开启仅允许主人放大16倍'),
    ...sPRO('bigjpg', '放大图片')
  ]
  js = js.concat(newCfg)
}

// if (file.existsSync(path.join(Path.apps, )))

export function supportGuoba() {
  return {
    pluginInfo: {
      name: Path.Plugin_Name,
      title: Path.Plugin_Name,
      author: Path.Author,
      authorLink: 'https://gitee.com/UCPr251',
      link: 'https://gitee.com/UCPr251/UC-plugin',
      isV3: true,
      isV2: false,
      description: 'UC-plugin，为更多有趣的功能',
      iconPath: path.join(Path.resources, 'xiubi.png')
    },
    configInfo: {
      schemas: [
        {
          label: '【UC】系统设置',
          component: 'Divider'
        },
        s('Master', '插件主人', 'InputTextArea',
          '拥有租管主人权限的QQ，多个请用中文逗号间隔'),
        s('BlackQQ', '插件黑名单', 'InputTextArea',
          '插件拉黑QQ，无法使用本插件，多个请用中文逗号间隔'),
        s('WhiteQQ', '插件白名单', 'InputTextArea',
          '插件加白QQ，暂时没什么b用，多个请用中文逗号间隔'),
        s('isDefaultMaster', '合并主人', 'Switch',
          '是否合并插件主人和机器人主人，不影响管理员设置'),
        s('log', '日志输出', 'Switch', '是否输出本插件日志'),
        s('priority', '插件优先级', 'InputNumber',
          '本插件优先级，修改后重启生效'),
        s('server', '连接服务', 'Select',
          'Api服务选择，若频繁Api连接失败可尝试更改重试',
          {
            options: [
              { label: '服务1', value: 1 },
              { label: '服务2', value: 2 }
            ]
          }),
        s('BotName', '机器人自称', 'Input',
          '机器人个别时候回复消息时的自称，不填写则取QQ昵称'),
        s('loveMysNotice', '过码次数预警值', 'InputNumber',
          '每日0点自动检测过码剩余次数，低于该值则提醒主人，0则不提醒',
          { min: 0 }),
        s('onlyMaster', '仅主人可操作', 'Switch',
          '开启后仅主人可操作本插件'),
        s('onlyMasterReply', '仅主人回复', 'Input',
          '开启仅主人后，对原本拥有管理权限的插件管理员的回复'),
        s('noPerReply', '用户无权限回复', 'Input',
          '用户权限不足以操作机器人时的回复'),
        s('noPowReply', 'Bot无权限回复', 'Input',
          'Bot权限不足无法执行操作时的回复'),
        s('fetchErrReply', '连接失败回复', 'Input',
          'Api服务连接失败回复')
      ].concat(js),

      getConfigData() {
        return now_config
      },

      setConfigData(data, { Result }) {
        const newCfg = {}
        const cfgArr = ['config', 'permission']
        cfgArr.forEach(cfg => (newCfg[cfg] = _.cloneDeep(UCPr[cfg])))
        for (let [property, value] of Object.entries(data)) {
          if (property === 'Master' || property === 'WhiteQQ' || property === 'BlackQQ') {
            value = _.sortBy(value
              .split('，')
              .filter(num => num.length >= 7 && num.length <= 10)
              .map(Number))
            _.set(newCfg.permission, property, value)
            continue
          }
          _.set(newCfg.config, property, value)
        }
        let changed = false
        cfgArr.forEach(cfg => {
          if (!_.isEqual(newCfg[cfg], UCPr[cfg])) {
            changed = true
            file.YAMLsaver(Path[`${cfg}yaml`], newCfg[cfg])
          }
        })
        if (changed) return Result.ok({}, '保存成功~')
        return Result.ok({}, '什么都没变哦~')
      }
    }
  }
}