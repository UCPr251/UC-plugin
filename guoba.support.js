import { judgePriority, judgeInfo, judgeProperty, judgeHelpInfo } from './components/Admin.js'
import { UCPr, Path, file, Data } from './components/index.js'
import { guoba_config } from './components/UCPr.js'
import _ from 'lodash'

Data.refresh()
/** field前缀 */
let prefix = ''
/**
 * 设置锅巴展示配置
 * @param {property} field 属性名
 * @param {string} label 展示名
 * @param {'Input'|'InputNumber'|'InputTextArea'|'Switch'|'Select'|'InputPassword'} component 展示值属性
 * @param {string} bottomHelpMessage 帮助信息
 * @param {object} componentProps 配置项：max, min, placeholder等
 * @param {object} optional 可选项
 */
function s(field, label, component, bottomHelpMessage, componentProps = {}, optional = { required: false, helpMessage: undefined }) {
  if (prefix) {
    field = prefix + field
  }
  let display = {
    field,
    label,
    component,
    bottomHelpMessage,
    componentProps
  }
  return _.merge(display, optional)
}

function sPRO(name, _prefix = '', options = [true, true, true, true, true, true], name_prefix = '') {
  const info = []
  for (let i in judgeProperty) {
    if (!options[i]) continue
    info.push(s(_prefix + judgeProperty[i], name_prefix + judgeInfo[i], 'Switch',
      judgeHelpInfo[i] + name, {},
      { helpMessage: judgePriority }))
  }
  return _.flatMap(info)
}

let js = []

// 搜小说分支内容
if (file.existsSync(Path.get('apps', 'searchNovel.js'))) {
  prefix = 'searchNovel.'
  const newCfg = [
    {
      label: '【UC】小说 · 基础设置',
      component: 'Divider'
    },
    s('recallIndexMsg', '索引消息撤回间隔', 'InputNumber',
      '小说序号选择信息撤回时间间隔，单位秒，0则不撤回', { min: 0 }),
    s('recallNoticeMsg', '其他消息撤回间隔', 'InputNumber',
      '索引消息以外的消息的撤回时间间隔，单位秒，0则不撤回', { min: 0 }),
    s('recallFileG', '群聊文件撤回间隔', 'InputNumber',
      '群聊发送文件的撤回时间间隔，单位秒，0则不撤回', { min: 0 }),
    s('recallFileP', '私聊文件撤回间隔', 'InputNumber',
      '私聊发送文件的撤回时间间隔，单位秒，0则不撤回', { min: 0, max: 119 }),
    s('overtime', '超时时间', 'InputNumber',
      '超时时间，单位秒，#搜小说 后超过该时间不操作则自动取消操作', { min: 10 }),
    s('cd', '冷却时间', 'InputNumber',
      '#搜小说 冷却时间，单位秒，主人不受限', { min: 10 }),
    s('cdReply', '冷却中回复', 'Input',
      'cd中回复，对主人以外的处于cd中的用户再次#搜小说 时的回复'),
    s('novelPath', '小说资源路径', 'InputTextArea',
      '本地小说资源绝对路径，多个请回车间隔'),
    {
      label: '【UC】小说 · 搜索权限',
      component: 'Divider'
    },
    ...sPRO('#搜小说', 'search.', undefined, '搜索 · '),
    {
      label: '【UC】小说 · 上传权限',
      component: 'Divider'
    },
    ...sPRO('#上传小说', 'add.', undefined, '上传 · '),
    {
      label: '【UC】小说 · 删除权限',
      component: 'Divider'
    },
    ...sPRO('#删', 'del.', undefined, '删除 · ')
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'qsignRestart.js'))) {
  prefix = 'qsignRestart.'
  const newCfg = [
    {
      label: '【UC】签名自动重启设置（修改后重启生效！）',
      component: 'Divider'
    },
    s('isAutoOpen', '签名自动重启', 'Switch',
      '开启后Bot启动时自动开启签名自动重启'),
    s('switch1', '签名崩溃检测', 'Switch',
      '签名崩溃检测，检测签名是否崩溃，崩溃则尝试启动签名'),
    s('switch2', '签名异常检测', 'Switch',
      '签名异常检测，检测签名是否异常（包括崩溃），异常则尝试重启签名'),
    s('errorTimes', '异常重启次数', 'InputNumber',
      '签名异常次数大于等于该值时执行签名重启，避免高频重启，不建议低于2', { min: 1 }),
    s('qsign', '签名路径', 'Input',
      '签名启动器执行路径，不填则取默认路径',
      { placeholder: Path.qsign }),
    s('host', '签名host', 'Input'),
    s('port', '签名port', 'InputNumber'),
    s('qsingRunner', '启动器名称', 'Input'),
    s('sleep', '崩溃检测间隔', 'InputNumber',
      '崩溃检测时间间隔，单位秒，不建议低于10', { min: 10 })
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'switchBot.js'))) {
  prefix = 'switchBot.'
  const newCfg = [
    {
      label: '【UC】指定群开关Bot设置',
      component: 'Divider'
    },
    s('openReg', '开启触发词', 'Input',
      '让Bot上班的指令：BotName+关键词即可触发，多个用|间隔'),
    s('closeReg', '关闭触发词', 'Input',
      '让Bot下班的指令：BotName+关键词即可触发，多个用|间隔'),
    s('openMsg', '开启Bot回复', 'Input',
      '开启Bot的回复，BotName会被替换为上面设置的BotName的名称'),
    s('closeMsg', '关闭Bot回复', 'Input',
      '关闭Bot的回复，BotName会被替换为上面设置的BotName的名称'),
    ...sPRO('群开关Bot', '', [false, false, true, true, true, false])
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'chuoyichuo.js'))) {
  prefix = 'chuoyichuo.'
  const newCfg = [
    {
      label: '【UC】戳一戳回复设置',
      component: 'Divider'
    },
    s('isOpen', '是否开启戳一戳', 'Switch',
      '是否启用UC戳一戳'),
    s('isAutoSetCard', '被戳更新群名片', 'Switch',
      '被戳是否自动更新群名片'),
    s('groupCard', '更新群名片后缀', 'Input',
      '开启被戳自动更新群名片后，群名片后缀内容，num会被替换为被戳次数'),
    s('textimg', '文本+图片概率', 'InputNumber',
      '被戳回复文本+图片概率', { min: 0, max: 1 }),
    s('chuoimg', '次数+图片概率', 'InputNumber',
      '被戳回复被戳次数+文本+图片概率，此概率独立于整体概率，意为触发文本+图片回复时又有多少概率在文本前加上被戳次数，可选0-1',
      { min: 0, max: 1 }),
    s('face', '头像表情包概率', 'InputNumber',
      '被戳回复头像表情包概率', { min: 0, max: 1 }),
    s('mute', '禁言概率', 'InputNumber',
      '被戳禁言对方概率，剩下的就是反击概率', { min: 0, max: 1 }),
    s('muteTime', '禁言时长', 'InputNumber',
      '禁言的时长，单位分，0为不禁言', { min: 1 })
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'randomWife.js'))) {
  prefix = 'randomWife.'
  const newCfg = [
    {
      label: '【UC】随机老婆设置',
      component: 'Divider'
    },
    s('isOpen', '是否开启', 'Switch',
      '是否开启UC随机老婆'),
    s('wifeLimits', '老婆次数限制', 'InputNumber',
      '每日随机老婆次数限制，包括主人', { min: 1 }),
    ...sPRO('#上传随机老婆', 'add.', [false, false, true, true, true, true], '上传 · '),
    ...sPRO('#删除随机老婆', 'del.', [false, false, true, true, true, true], '删除 · ')
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'randomMember.js'))) {
  prefix = 'randomMember.'
  const newCfg = [
    {
      label: '【UC】随机群友设置',
      component: 'Divider'
    },
    s('isOpen', '是否开启', 'Switch',
      '是否开启UC随机群友'),
    s('isAt', '是否自动艾特', 'Switch',
      '是否自动艾特随机到的群友'),
    s('keyWords', '触发指令', 'Input',
      '触发指令，#你设置的值 就可以触发该功能，修改后直接生效，英语字母大小写都可以触发'),
    s('reply', '回复内容', 'Input',
      '随机群友回复内容，info会被替换为群友信息：群友昵称（QQ）'),
    ...sPRO('#随机群友', '', [false, false, true, true, true, true])
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'BlivePush.js'))) {
  prefix = 'BlivePush.'
  const newCfg = [
    {
      label: `【UC】B站直播推送设置${Data.check('BlivePush') ? '' : '（您当前未购买此插件）'}`,
      component: 'Divider'
    },
    s('isGroup', '群聊推送开关', 'Switch',
      '群聊推送全局开关，关闭不再推送群聊'),
    s('isPrivate', '私聊推送开关', 'Switch',
      '私聊推送全局开关，关闭不再推送私聊'),
    s('mins', '推送检测间隔', 'InputNumber',
      '推送检测间隔，单位分钟，不建议小于4',
      { min: 2 }),
    ...sPRO('订阅推送')
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'bigjpg.js'))) {
  prefix = 'bigjpg.'
  const newCfg = [
    {
      label: `【UC】放大图片设置${Data.check('bigjpg') ? '' : '（您当前未购买此插件）'}`,
      component: 'Divider'
    },
    s('isOpen', '放大图片开关', 'Switch'),
    s('apiKey', 'ApiKey', 'InputPassword'),
    s('style', '放大图片风格', 'Select',
      '可选卡通和照片，对于卡通图片放大效果最佳',
      {
        options: [
          { label: '卡通', value: 'art' },
          { label: '照片', value: 'photo' }
        ]
      }),
    s('noise', '默认降噪程度', 'Select',
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
    s('magnification', '默认放大倍数', 'Select',
      '默认放大倍数，可选[2倍，4倍，8倍，16倍]',
      {
        options: [
          { label: '2倍', value: 2 },
          { label: '4倍', value: 4 },
          { label: '8倍', value: 8 },
          { label: '16倍', value: 16 }
        ]
      }),
    s('limits', '每日放大数量限制', 'InputNumber',
      '每人每天放大次数限制，0为不限制，主人不受限',
      { min: 0 }),
    s('isSave', '是否自动保存图片', 'Switch',
      '放大的图片是否自动保存本地。保存路径：' + Path.bigjpg),
    s('x4', '4倍放大', 'Switch',
      '4倍，关闭仅允许主人放大4倍'),
    s('x8', '8倍放大', 'Switch',
      '8倍，关闭仅允许主人放大8倍'),
    s('x16', '16倍放大', 'Switch',
      '16倍，关闭仅允许主人放大16倍'),
    ...sPRO('#放大图片')
  ]
  js = js.concat(newCfg)
}

// if (file.existsSync(Path.join(Path.apps, )))

prefix = ''

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
      iconPath: Path.get('img', 'xiubi.png')
    },
    configInfo: {
      schemas: [
        {
          label: '【UC】系统设置',
          component: 'Divider'
        },
        s('Master', '插件主人', 'InputTextArea',
          '拥有本插件主人权限的QQ，多个请用中文逗号间隔'),
        s('BlackQQ', '插件黑名单', 'InputTextArea',
          '插件拉黑QQ，无法使用本插件，多个请用中文逗号间隔'),
        s('WhiteQQ', '插件白名单', 'InputTextArea',
          '插件加白QQ，暂时没什么b用，多个请用中文逗号间隔'),
        s('log', '普通日志输出', 'Switch', '是否输出普通日志'),
        s('debugLog', '调试日志输出', 'Switch', '是否输出调试日志'),
        s('isWatch', '开发环境', 'Switch',
          '开发环境下使用，热更新app，重启生效'),
        s('isDefaultMaster', '合并主人', 'Switch',
          '是否合并插件主人和机器人主人，不影响管理员设置'),
        s('onlyMaster', '仅主人可操作', 'Switch',
          '开启后仅主人可操作本插件'),
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
        return guoba_config
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
          if (property === 'searchNovel.novelPath') {
            value = value.split('\n').map(path => path.trim())
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