import Admin, { judgePriority, judgeInfo, judgeProperty, judgeHelpInfo } from './components/Admin.js'
import { Path, file, Data, UCPr } from './components/index.js'
import { guoba_config } from './components/UCPr.js'
import _ from 'lodash'

try {
  Data.refresh()
} catch (err) {
  logger.error(err)
}
/** config前缀 */
let cfgPrefix = 'config.'
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
  field = cfgPrefix + prefix + field
  const display = {
    field,
    label,
    component,
    bottomHelpMessage,
    componentProps
  }
  return _.merge({}, display, optional)
}

function sPRO(name, _prefix = 'use.', options = [1, 1, 1, 1, 1, 1], name_prefix = '') {
  const info = []
  for (const i in judgeProperty) {
    if (!options[i]) continue
    info.push(s(_prefix + judgeProperty[i], name_prefix + judgeInfo[i], 'Switch',
      judgeHelpInfo[i] + name, {},
      { helpMessage: judgePriority }))
  }
  return info
}

let js = []

if (file.existsSync(Path.get('apps', 'qsignRestart.js')) && process.platform === 'win32') {
  prefix = 'qsignRestart.'
  const newCfg = [
    {
      label: '【UC】签名自动重启设置（修改后重启生效！）',
      component: 'Divider'
    },
    s('isAutoOpen', '签名自动重启', 'Switch',
      '开启后Bot启动时自动开启签名自动重启'),
    s('isAutoClearLog', '自动清理日志', 'Switch',
      '是否开启每日零点自动清理签名日志'),
    s('windowsHide', '隐藏签名窗口', 'Switch',
      '隐藏重启的签名的窗口。注意：开启此项后，关闭机器人将同时关闭签名。不建议开启'),
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
    ...sPRO('群开关Bot', undefined, [0, 0, 1, 1, 1, 0]),
    s('isPrefix', '响应前缀', 'Switch',
      '在关闭群聊的情况下，以BotName开头的消息是否也响应'),
    s('isAt', '响应艾特', 'Switch',
      '在关闭群聊的情况下，以BotName开头的消息是否也响应'),
    ...sPRO('响应前缀和响应艾特', 'closedCommand.', [0, 0, 1, 1, 1, 1])
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
    ...sPRO('#上传随机老婆', 'add.', [0, 0, 1, 1, 1, 1], '上传 · '),
    ...sPRO('#删除随机老婆', 'del.', [0, 0, 1, 1, 1, 1], '删除 · ')
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
    ...sPRO('#随机群友', undefined, [0, 0, 1, 1, 1, 1])
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'sqtj.js'))) {
  prefix = 'sqtj.'
  const newCfg = [
    {
      label: '【UC】水群统计设置',
      component: 'Divider'
    },
    s('isOpen', '水群统计开关', 'Switch',
      '是否开启UC水群统计'),
    s('isSelf', '统计机器人自身', 'Switch',
      '水群统计是否也统计机器人自身记录'),
    s('isAutoSend', '0点推送水群统计', 'Switch',
      '每日0点是否自动发送水群统计至群内，建议只在需要打开的群内单独开启，否则每个群都会发送'),
    s('isSave', '保存本地', 'Switch',
      '查询的聊天记录是否保存至本地，关闭则每次都从零获取数据，建议开启'),
    ...sPRO('#水群统计', undefined, [0, 0, 1, 1, 1, 1])
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
cfgPrefix = 'GAconfig.'
const GAconfig = [
  {
    label: '【UC】群管设置',
    component: 'Divider'
  },
  s('isOpen', '群管开关', 'Switch',
    '是否开启UC群管系统，群管总开关'),
  s('overTime', '超时时长', 'InputNumber',
    '群管上下文操作的超时时间')
]

prefix = 'recall.'
GAconfig.push(
  {
    label: '【UC】群管 · 撤回',
    component: 'Divider'
  },
  s('isOpen', '群管撤回开关', 'Switch',
    '是否开启UC群管撤回'),
  s('FILTER_MAX', '最大获取记录', 'InputNumber',
    '允许递归获取的群聊天记录最大深度'),
  s('defaultClear', '默认清屏数量', 'InputNumber',
    '清屏不指定数量时默认撤回数量'),
  s('CLEAR_MAX', '最大清屏数量', 'InputNumber',
    '允许清屏数量的最大值'),
  s('RECALL_MAX', '最大撤回数量', 'InputNumber',
    '允许指定单人撤回的最大值'),
  s('intervalTime', '撤回间隔', 'InputNumber',
    '批量撤回群消息的间隔时间，单位秒，建议大于等于0.1',
    { min: 0 }),
  ...sPRO('#撤回', undefined, [0, 0, 1, 1, 1, 1])
)

prefix = 'mute.'
GAconfig.push(
  {
    label: '【UC】群管 · 禁言',
    component: 'Divider'
  },
  s('isOpen', '群管禁言开关', 'Switch',
    '是否开启UC群管禁言'),
  s('MUTE_MAX', '最大禁言时长', 'InputNumber',
    '允许禁言最大时长，单位秒，默认一天（主人不限）'),
  s('defaultMute', '默认禁言时长', 'InputNumber',
    '禁言不指定时长时默认禁言时长，单位秒'),
  s('muteReply', '禁言回复', 'Input',
    '禁言回复，info会替换为 用户名（QQ），time会替换为禁言时长'),
  s('releaseReply', '解禁回复', 'Input',
    '解禁时的回复，info会替换为 用户名（QQ）'),
  s('allMuteReply', '全体禁言回复', 'Input',
    '全体禁言回复'),
  s('releaseAllMuteReply', '全体解禁回复', 'Input',
    '全体解禁回复'),
  s('releaseAllMutedReply', '全部解禁回复', 'Input',
    '全部解禁回复，num会被替换为解禁群员的数量'),
  ...sPRO('#禁言', undefined, [0, 0, 1, 1, 1, 0]),
  ...sPRO('#全体禁言', 'muteAll.', [0, 0, 1, 1, 1, 0])
)

prefix = 'kick.'
GAconfig.push(
  {
    label: '【UC】群管 · 踢人',
    component: 'Divider'
  },
  s('isOpen', '群管踢人开关', 'Switch',
    '是否开启UC群管踢人'),
  s('isAutoBlack', '群同时拉黑', 'Switch',
    '踢人是否同时在该群拉黑该用户'),
  s('isAutoGlobalBlack', '全局拉黑', 'Switch',
    '踢人是否同时在全局拉黑该用户'),
  s('kickReply', '踢人回复', 'Input',
    '踢人回复'),
  ...sPRO('#踢', undefined, [0, 0, 1, 1, 1, 0])
)

prefix = 'welcome.'
GAconfig.push(
  {
    label: '【UC】群管 · 入群欢迎',
    component: 'Divider'
  },
  s('isOpen', '入群欢迎开关', 'Switch',
    '是否开启UC群管入群欢迎'),
  s('isAvatar', '展示头像', 'Switch',
    '入群欢迎同时展示新群员的头像'),
  s('isAt', '艾特新群员', 'Switch',
    '入群欢迎同时艾特新群员'),
  ...sPRO('#修改入群欢迎', undefined, [0, 0, 1, 1, 1, 1])
)

prefix = 'mourn.'
GAconfig.push(
  {
    label: '【UC】群管 · 退群通知',
    component: 'Divider'
  },
  s('isOpen', '退群通知开关', 'Switch',
    '是否开启UC群管退群通知'),
  s('isAvatar', '艾特新群员', 'Switch',
    '退群通知同时艾特新群员'),
  ...sPRO('#修改退群通知', undefined, [0, 0, 1, 1, 1, 1])
)

prefix = ''
cfgPrefix = 'permission.'
const permission = [
  s('GlobalMaster', 'UC全局主人', 'InputTextArea',
    '拥有本插件全局主人权限的QQ，多个请用中文逗号间隔'),
  s('GlobalAdmin', 'UC全局管理', 'InputTextArea',
    '拥有本插件全局群管理权限的QQ，多个请用中文逗号间隔'),
  s('GlobalBlackQQ', 'UC全局黑名单', 'InputTextArea',
    '插件全局拉黑QQ，无法使用本插件，多个请用中文逗号间隔')
]

cfgPrefix = 'config.'

export function supportGuoba() {
  return {
    pluginInfo: {
      name: Path.Plugin_Name,
      title: `${Path.Plugin_Name}（${UCPr.version}）`,
      author: Path.Author,
      authorLink: UCPr.authorUrl,
      link: UCPr.repoUrl,
      isV3: true,
      isV2: false,
      description: UCPr.package.description,
      iconPath: Path.get('img', 'xiubi.png')
    },
    configInfo: {
      schemas: [
        {
          label: '【UC】系统设置',
          component: 'Divider'
        },
        ...permission,
        s('isWatch', '开发环境', 'Switch',
          '开发环境下使用，热更新app，重启生效'),
        s('log', '普通日志输出', 'Switch', '是否输出普通日志'),
        s('debugLog', '调试日志输出', 'Switch', '是否输出调试日志'),
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
        s('defaultYear', '默认年份', 'InputNumber',
          '部分功能不指定年份时默认补全年份',
          { min: 2000, max: 2510 }),
        s('autoYear', '自动年份', 'Switch',
          '是否自动以当前年份为准补全年份，开启后将无视默认年份'),
        s('loveMysNotice', '过码次数预警值', 'InputNumber',
          '每日0点自动检测过码剩余次数，低于该值则提醒主人，0则不提醒',
          { min: 0 }),
        s('noPerReply', '用户无权限回复', 'Input',
          '用户权限不足以操作机器人时的回复'),
        s('noPowReply', 'Bot无权限回复', 'Input',
          'Bot权限不足无法执行操作时的回复'),
        s('fetchErrReply', '连接失败回复', 'Input',
          'Api服务连接失败回复'),
        ...GAconfig
      ].concat(js),

      getConfigData() {
        return guoba_config
      },

      setConfigData(data, { Result }) {
        let changed = false
        for (let [property, value] of Object.entries(data)) {
          const [cfg, ...ret] = property.split('.')
          const path = ret.join('.')
          if (!path) continue
          _.set(guoba_config, property, value) // 同步数据
          if (path === 'GlobalMaster' || path === 'GlobalAdmin' || path === 'GlobalBlackQQ') {
            value = _.sortBy(value
              .split('，')
              .filter(num => num.length >= 7 && num.length <= 10)
            ).map(Number)
          }
          if (Admin.globalCfg(path, value, cfg)) changed = true
        }
        if (changed) {
          Data.refreshLock()
          return Result.ok({}, '保存成功~')
        }
        return Result.ok({}, '什么都没变哦~')
      }
    }
  }
}