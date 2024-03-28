import Admin, { judgePriority, judgeInfo, judgeProperty } from './components/Admin.js'
import { Path, file, Data, UCPr } from './components/index.js'
import { guoba_config } from './components/UCPr.js'
import _ from 'lodash'

const addUserPrompt = {
  content: '请输入QQ号：',
  placeholder: '请输入QQ号',
  okText: '添加',
  rules: [
    { required: true, message: 'QQ都忘了填了吗~真是杂鱼呢❤️~杂鱼❤️~' },
    { min: 5, message: '短短的也很可爱哟❤️~❤️~' },
    { max: 12, message: '好长🥵~瘦不了了🥵~' }
  ]
}

/**
 * @component 组件类型
 * @param Switch 开关
 * @param Select 选择框
 * @param Input 单行输入框
 * @param InputTextArea 多行输入框，可自行调整高度
 * @param InputNumber 数字输入框
 * @param InputPassword 密码输入框，默认不显示明文
 * @param Slider 滑动输入条
 * @param EasyCron cron表达式输入框
 * @param RadioGroup 单选按钮组，布局在同一个逻辑组内
 * @param GTags 锅巴自定义-手动输入、添加或删除标签，布局在同一个逻辑组内
 * @param GSelectFriend 锅巴自定义-选择好友组件，弹出式选择框
 * @param GSelectGroup 锅巴自定义-选择群组件，弹出式选择框
 * @param GSubForm 锅巴自定义-子表单，可以添加或删除
 */

/** config前缀 */
let cfgPrefix = 'config.'
/** field前缀 */
let prefix = ''
/**
 * 设置锅巴展示配置
 * @param {property} field 属性名
 * @param {string} label 展示名
 * @param {string} bottomHelpMessage 描述信息
 * @param {'Input'|'InputNumber'|'InputTextArea'|'Switch'|'Select'|'InputPassword'|'Slider'|'EasyCron'|'RadioGroup'|'GTags'|'GSelectFriend'|'GSelectGroup'|'GSubForm'} component 展示值属性
 * @param {object} componentProps 配置项：max, min, placeholder, valueFormatter等
 * @param {object} optional 可选项
 * @returns {{}} 返回展示配置
 */
function s(field, label, bottomHelpMessage, component = 'Switch', componentProps = {}, optional = { required: false, helpMessage: undefined }) {
  field = cfgPrefix + prefix + field
  const display = {
    field,
    label,
    bottomHelpMessage,
    component,
    componentProps
  }
  return _.merge({}, display, optional)
}

// function sPRO(name, _prefix = 'use.', options = [1, 1, 1, 1, 1, 1], name_prefix = '') {
//   const info = []
//   for (const i in judgeProperty) {
//     if (!options[i]) continue
//     info.push(s(
//       _prefix + judgeProperty[i],
//       name_prefix + judgeInfo[i],
//       judgeHelpInfo[i] + name,
//       'Switch', {},
//       { helpMessage: judgePriority }
//     ))
//   }
//   return info
// }

function sPRO(name, _prefix = 'use.', choose = [1, 1, 1, 1, 1, 1], name_prefix = '使用', desc = '') {
  const options = []
  for (const i in judgeProperty) {
    if (!choose[i]) continue
    options.push({ label: judgeInfo[i], value: judgeProperty[i] })
  }
  return s(
    _prefix + 'power',
    name_prefix + '权限设置',
    name + ' 功能使用权限判断' + (desc ? '，' + desc : ''),
    'Select',
    {
      allowAdd: true,
      allowDel: true,
      mode: 'multiple',
      options
    },
    { helpMessage: judgePriority }
  )
}

// 模板

// if (file.existsSync(Path.get('apps', '.js'))) {
//   prefix = '.'
//   const newCfg = [
//     {
//       label: '【UC】设置',
//       component: 'Divider'
//     },
//     sPRO('#', undefined, [0, 0, 1, 1, 1, 1])
//   ]
//   js = js.concat(newCfg)
// }

let js = []

if (file.existsSync(Path.get('apps', 'qsignRestart.js')) && process.platform === 'win32') {
  prefix = 'qsignRestart.'
  const newCfg = [
    {
      label: '【UC】签名自动重启设置（修改后重启生效）',
      component: 'Divider'
    },
    s(
      'isAutoOpen',
      '签名自动重启',
      '开启后Bot启动时自动开启签名自动重启'
    ),
    s(
      'isAutoClearLog',
      '自动清理日志',
      '是否开启每日零点自动清理签名日志'
    ),
    s(
      'windowsHide',
      '隐藏签名窗口',
      '隐藏重启的签名的窗口。注意：开启此项后，关闭机器人将同时关闭签名。不建议开启'
    ),
    s(
      'switch1',
      '签名崩溃检测',
      '签名崩溃检测，检测签名是否崩溃，崩溃则尝试启动签名'
    ),
    s(
      'switch2',
      '签名异常检测',
      '签名异常检测，检测签名是否异常（包括崩溃），异常则尝试重启签名'
    ),
    s(
      'errorTimes',
      '异常重启次数',
      '签名异常次数大于等于该值时执行签名重启，避免高频重启，不建议低于2',
      'InputNumber',
      { min: 1 }
    ),
    s(
      'qsign',
      '签名路径',
      '签名启动器执行路径，不填则取默认路径',
      'Input',
      { placeholder: Path.qsign }
    ),
    s(
      'host',
      '签名host',
      '',
      'Input'
    ),
    s(
      'port',
      '签名port',
      '',
      'InputNumber'
    ),
    s(
      'qsingRunner',
      '启动器名称',
      '',
      'Input'
    ),
    s(
      'sleep',
      '崩溃检测间隔',
      '崩溃检测时间间隔，单位秒，不建议低于10',
      'InputNumber',
      { min: 10 }
    )
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'switchBot.js'))) {
  prefix = 'switchBot.'
  const newCfg = [
    {
      label: '【UC】单独群上下班Bot设置',
      component: 'Divider'
    },
    s(
      'openReg',
      '开启指令',
      '让Bot上班的指令，可设置多个，BotName+其一指令即可触发，仅以全局为准',
      'Input'
    ),
    s(
      'closeReg',
      '关闭指令',
      '让Bot下班的指令：BotName+指令即可触发，多个用|间隔，仅以全局为准',
      'Input'
    ),
    s(
      'openMsg',
      '开启回复',
      '开启Bot的回复，BotName会被替换为上面设置的BotName的名称',
      'Input'
    ),
    s(
      'closeMsg',
      '关闭回复',
      '关闭Bot的回复，BotName会被替换为上面设置的BotName的名称',
      'Input'
    ),
    sPRO('群开关Bot', undefined, [0, 0, 1, 1, 1, 1]),
    s(
      'isPrefix',
      '响应前缀',
      '在关闭群聊的情况下，以BotName开头的消息是否也响应'
    ),
    s(
      'isAt',
      '响应艾特',
      '在关闭群聊的情况下，以BotName开头的消息是否也响应'
    ),
    sPRO('响应前缀和响应艾特', 'closedCommand.', [0, 0, 1, 1, 1, 1])
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'JSsystem.js'))) {
  prefix = 'JSsystem.'
  const newCfg = [
    {
      label: '【UC】JS管理系统设置',
      component: 'Divider'
    },
    s(
      'isOpen',
      'JS系统开关',
      '是否启用UC插件JS插件管理系统'
    ),
    s(
      'isZip',
      '多文件自动压缩',
      '一次性查看多个JS文件时是否自动压缩为zip发送'
    ),
    s(
      'recallFileGroup',
      '群聊文件撤回时间',
      '群聊发送文件后自动撤回时长，0-120秒，0为不撤回',
      'InputNumber',
      { min: 0 }
    ),
    s(
      'recallFilePrivate',
      '私聊文件撤回时间',
      '私聊发送文件后自动撤回时长，4-120秒，0为不撤回',
      'InputNumber',
      { min: 0, max: 120 }
    )
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'ActReminder.js'))) {
  prefix = 'ActReminder.'
  const newCfg = [
    {
      label: '【UC】游戏活动截止提醒',
      component: 'Divider'
    },
    s(
      'opIsOpen',
      '原神提醒开关',
      '原神活动截止提醒开关，建议只在需要的群内单独开启'
    ),
    s(
      'srIsOpen',
      '星铁提醒开关',
      '星铁活动截止提醒开关，建议只在需要的群内单独开启'
    ),
    s(
      'opCron',
      '原神提醒cron',
      '原神活动检测时间cron表达式，仅以全局设置为准，修改后重启生效',
      'EasyCron'
    ),
    s(
      'srCron',
      '星铁提醒cron',
      '星铁活动检测时间cron表达式，仅以全局设置为准，修改后重启生效',
      'EasyCron'
    ),
    s(
      'opDays',
      '原神提醒天数',
      '每次检测时若原神活动剩余天数小于等于该值则提醒，忽略时分秒值，建议大于等于1',
      'InputNumber',
      { min: 0 }
    ),
    s(
      'srDays',
      '星铁提醒天数',
      '每次检测时若星铁活动剩余天数小于等于该值则提醒，忽略时分秒值，建议大于等于1',
      'InputNumber',
      { min: 0 }
    ),
    s(
      'opAtAll',
      '原神全员艾特',
      '原神活动截止提醒是否艾特全员（需管理员权限）'
    ),
    s(
      'srAtAll',
      '星铁全员艾特',
      '星铁活动截止提醒是否艾特全员（需管理员权限）'
    )
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'BackupRestore.js'))) {
  prefix = 'BackupRestore.'
  const newCfg = [
    {
      label: '【UC】备份还原设置',
      component: 'Divider'
    },
    s(
      'autoBackup',
      '自动备份',
      '是否自动备份云崽、example、插件数据和JS，开启前请尝试#UC备份数据 是否可用'
    ),
    s(
      'cron',
      '自动备份cron',
      '自动备份执行的cron，默认为每天23点59分执行，修改后重启生效',
      'EasyCron'
    ),
    s(
      'retentionDays',
      '备份保留天数',
      '备份文件保存天数，超过此天数的以前的备份数据将会被清理，减少磁盘占用，0为不限制',
      'InputNumber',
      { min: 0 }
    ),
    s(
      'Directory',
      '备份文件夹',
      '要备份的各个插件根目录下的文件夹，数据主要保存于data和config，可自行添加文件夹',
      'GTags',
      {
        placeholder: '请输入要备份插件文件夹名',
        allowAdd: true,
        allowDel: true,
        valueFormatter: value => value.trim()
      }
    ),
    s(
      'removeDirectory',
      '排除文件夹',
      '要排除的备份文件夹，递归复制时如果遇见此类文件夹会跳过',
      'GTags',
      {
        placeholder: '请输入备份时要排除的文件夹名',
        allowAdd: true,
        allowDel: true,
        valueFormatter: value => value.trim()
      }
    ),
    s(
      'extra',
      '额外文件(夹)',
      '除上述包括的、需要额外备份的指定文件或文件夹，若为文件则备份文件，若为文件夹则递归备份文件夹，必须使用相对于崽根目录的路径，比如./logs',
      'GTags',
      {
        placeholder: '请输入备份时要排除的文件夹名',
        allowAdd: true,
        allowDel: true,
        valueFormatter: value => value.trim()
      }
    )
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
    s(
      'isOpen',
      '是否开启戳一戳',
      '是否启用UC戳一戳'
    ),
    s(
      'isAutoSetCard',
      '被戳更新群名片',
      '被戳是否自动更新群名片：当前图包名称|后缀'
    ),
    s(
      'groupCard',
      '更新群名片后缀',
      '开启被戳自动更新群名片后，群名片后缀内容，num会被替换为被戳次数',
      'Input'
    ),
    s(
      'picPath',
      '图包',
      '戳一戳使用的图包，自动群名片会取此图包名称。若新加图包此处未展示，请使用指令#UC设置戳一戳图包+图包名',
      'Select',
      { options: file.readdirSync(Path.chuoyichuo, { removes: '一键重命名.js' }).map(item => ({ label: item, value: item })) }
    ),
    s(
      'CD',
      '冷却',
      '戳一戳CD，0为不限制，各群独立，单位秒',
      'InputNumber',
      { min: 0 }
    ),
    s(
      'textimg',
      '文本+图片概率',
      '被戳回复文本+图片概率',
      'Slider',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'AiRecord',
      'AI语音概率',
      '当回复文字(汉字数>=3)时，将文字转语音的概率，speaker取图包名称，可选角色见#UC音色列表，此概率独立于整体概率，可选0-0.5',
      'Slider',
      { min: 0, max: 0.5, step: 0.01 }
    ),
    s(
      'chuoimg',
      '次数+图片概率',
      '被戳回复被戳次数+文本+图片概率，此概率独立于整体概率，意为触发文本+图片回复时又有多少概率在文本前加上被戳次数，可选0-1',
      'Slider',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'face',
      '头像表情包概率',
      '被戳回复头像表情包概率',
      'Slider',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'mute',
      '禁言概率',
      '被戳禁言对方概率，剩下的就是反击概率',
      'Slider',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'muteTime',
      '禁言时长',
      '禁言的时长，单位分，0为不禁言',
      'InputNumber',
      { min: 0 })
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'chuoMaster.js'))) {
  prefix = 'chuoMaster.'
  const newCfg = [
    {
      label: '【UC】戳主人回复设置',
      component: 'Divider'
    },
    s(
      'isOpen',
      '戳主人回复开关',
      '是否开启UC戳主人回复'
    ),
    s(
      'isAt',
      '艾特回复',
      '回复时是否同时艾特对方'
    ),
    s(
      'text',
      '回复概率',
      '戳主人回复消息的概率，0-1',
      'Slider',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'img',
      '图片概率',
      '戳主人发送合成表情包概率，0-1',
      'InputNumber',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'poke',
      '反击概率',
      '戳主人反击概率，0-1',
      'InputNumber',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'mute',
      '禁言概率',
      '戳主人禁言概率，0-1',
      'InputNumber',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'muteTime',
      '禁言时长',
      '禁言的时长，单位分，0为不禁言',
      'InputNumber',
      { min: 0 }
    )
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'atMaster.js'))) {
  prefix = 'atMaster.'
  const newCfg = [
    {
      label: '【UC】艾特主人回复设置',
      component: 'Divider'
    },
    s(
      'isOpen',
      '艾特主人回复开关',
      '是否开启UC艾特主人回复'
    ),
    s(
      'probability',
      '回复概率',
      '艾特主人回复的概率，0-1',
      'Slider',
      { min: 0, max: 1, step: 0.01 }
    ),
    s(
      'isAt',
      '艾特回复',
      '回复时是否同时艾特对方'
    ),
    sPRO(
      '艾特主人回复',
      undefined,
      [0, 0, 1, 1, 1, 1],
      '回复',
      '满足此权限条件的用户才可能会触发艾特主人回复'
    )
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
    s(
      'isOpen',
      '是否开启',
      '是否开启UC随机老婆'
    ),
    s(
      'wifeLimits',
      '老婆次数限制',
      '每日随机老婆次数限制，包括主人',
      'InputNumber',
      { min: 1 }
    ),
    sPRO('#上传随机老婆', 'add.', [0, 0, 1, 1, 1, 1], '上传'),
    sPRO('#删除随机老婆', 'del.', [0, 0, 1, 1, 1, 1], '删除')
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
    s(
      'isOpen',
      '是否开启',
      '是否开启UC随机群友'
    ),
    s(
      'isAt',
      '是否自动艾特',
      '是否自动艾特随机到的群友'
    ),
    s(
      'keyWords',
      '触发指令',
      '触发指令，#你设置的值 就可以触发该功能，修改后直接生效，英语字母大小写都可以触发，仅以全局为准',
      'Input'
    ),
    s(
      'reply',
      '回复内容',
      '随机群友回复内容，info会被替换为群友信息：群友昵称（QQ）',
      'Input'
    ),
    sPRO('#随机群友', undefined, [0, 0, 1, 1, 1, 1])
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
    s(
      'isOpen',
      '水群统计开关',
      '是否开启UC水群统计'
    ),
    s(
      'isSelf',
      '统计机器人自身',
      '水群统计是否也统计机器人自身记录'
    ),
    s(
      'rankNum',
      '排名人数',
      '水群统计排名人数',
      'InputNumber',
      { min: 1 }
    ),
    s(
      'isAutoSend',
      '0点推送水群统计',
      '每日0点是否自动发送水群统计至群内，建议只在需要打开的群内单独开启，否则每个群都会发送'
    ),
    sPRO('#水群统计', undefined, [0, 0, 1, 1, 1, 1])
  ]
  js = js.concat(newCfg)
}

if (file.existsSync(Path.get('apps', 'camouflage.js'))) {
  prefix = 'camouflage.'
  const newCfg = [
    {
      label: '【UC】伪装群友设置',
      component: 'Divider'
    },
    s(
      'isOpen',
      '伪装开关',
      '是否开启UC伪装群友功能'
    ),
    s(
      'time',
      '伪装时长',
      '单次伪装时长，单位分钟',
      'InputNumber'
    ),
    s(
      'CD',
      '冷却时长',
      '单次伪装结束后CD，单位分钟，所有群共用CD，0为不冷却',
      'InputNumber',
      { min: 0 }
    ),
    s(
      'timesLimit',
      '伪装次数限制',
      '每群每人每天伪装次数限制，0为不限制，但最多不超过10（主人不限）',
      'InputNumber',
      { min: 0, max: 10 }
    ),
    s(
      'msgLimit',
      '伪装消息限制',
      '消息数量限制，单次伪装发送的消息数量超过此值会直接退出伪装，0为不限制',
      'InputNumber'
    ),
    s(
      'isSilent',
      '不响应指令',
      '伪装期间是否不响应指令（#结束伪装 除外）'
    ),
    sPRO('#伪装 #结束伪装', undefined, [0, 0, 1, 1, 1, 1])
  ]
  js = js.concat(newCfg)
}

await Data.refresh()

if (Data.check('BlivePush') && file.existsSync(Path.get('apps', 'BlivePush.js'))) {
  prefix = 'BlivePush.'
  const newCfg = [
    {
      label: '【UC】B站直播推送设置',
      component: 'Divider'
    },
    s(
      'isGroup',
      '群聊推送开关',
      '群聊推送全局开关，关闭不再推送群聊'
    ),
    s(
      'isPrivate',
      '私聊推送开关',
      '私聊推送全局开关，关闭不再推送私聊'
    ),
    s(
      'mins',
      '推送检测间隔',
      '推送检测间隔，单位分钟，不建议小于4，仅以全局为准，重启生效',
      'InputNumber',
      { min: 2 }
    ),
    sPRO('订阅推送')
  ]
  js = js.concat(newCfg)
}

if (Data.check('bigjpg') && file.existsSync(Path.get('apps', 'bigjpg.js'))) {
  prefix = 'bigjpg.'
  const newCfg = [
    {
      label: '【UC】放大图片设置',
      component: 'Divider'
    },
    s(
      'isOpen',
      '放大图片开关'
    ),
    s(
      'apiKey',
      'ApiKey',
      '',
      'InputPassword'
    ),
    s(
      'style',
      '放大图片风格',
      '可选卡通和照片，对于卡通图片放大效果最佳',
      'Select',
      {
        options: [
          { label: '卡通', value: 'art' },
          { label: '照片', value: 'photo' }]
      }
    ),
    s(
      'limits',
      '每日放大数量限制',
      '每人每天放大次数限制，0为不限制，主人不受限',
      'InputNumber',
      { min: 0 }
    ),
    s(
      'isSave',
      '是否自动保存图片',
      '放大的图片是否自动保存本地。保存路径：' + Path.bigjpg
    ),
    s(
      'x4',
      '4倍放大',
      '4倍，关闭仅允许主人放大4倍'
    ),
    s(
      'x8',
      '8倍放大',
      '8倍，关闭仅允许主人放大8倍'
    ),
    s(
      'x16',
      '16倍放大',
      '16倍，关闭仅允许主人放大16倍'
    ),
    sPRO('#放大图片')
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
  s(
    'isOpen',
    '群管开关',
    '是否开启UC群管系统，群管总开关'
  ),
  s(
    'isPrefix',
    '仅响应UC前缀指令',
    '开启UC群管后，UC群管是否只响应以UC为前缀的指令（防冲突用）'
  ),
  s(
    'overTime',
    '超时时长',
    '群管上下文操作的超时时间',
    'InputNumber'
  )
]

if (file.existsSync(Path.get('groupAdmin', 'recall.js'))) {
  prefix = 'recall.'
  GAconfig.push(
    {
      label: '【UC】群管 · 撤回',
      component: 'Divider'
    },
    s(
      'isOpen',
      '群管撤回开关',
      '是否开启UC群管撤回'
    ),
    s(
      'FILTER_MAX',
      '最大获取记录',
      '允许递归获取的群聊天记录最大深度',
      'InputNumber'
    ),
    s(
      'defaultClear',
      '默认清屏数量',
      '清屏不指定数量时默认撤回数量',
      'InputNumber'
    ),
    s(
      'CLEAR_MAX',
      '最大清屏数量',
      '允许清屏数量的最大值',
      'InputNumber'
    ),
    s(
      'RECALL_MAX',
      '最大撤回数量',
      '允许指定单人撤回的最大值',
      'InputNumber'
    ),
    s(
      'intervalTime',
      '撤回间隔',
      '批量撤回群消息的间隔时间，单位秒，建议大于等于0.1',
      'InputNumber',
      { min: 0 }
    ),
    sPRO('#撤回', undefined, [0, 0, 1, 1, 1, 1])
  )
}

if (file.existsSync(Path.get('groupAdmin', 'mute.js'))) {
  prefix = 'mute.'
  GAconfig.push(
    {
      label: '【UC】群管 · 禁言',
      component: 'Divider'
    },
    s(
      'isOpen',
      '群管禁言开关',
      '是否开启UC群管禁言'
    ),
    s(
      'MUTE_MAX',
      '最大禁言时长',
      '允许禁言最大时长，单位秒，默认一天（主人不限）',
      'InputNumber',
      { min: 60 }
    ),
    s(
      'defaultMute',
      '默认禁言时长',
      '禁言不指定时长时默认禁言时长，单位秒',
      'InputNumber',
      { min: 60 }
    ),
    s(
      'muteReply',
      '禁言回复',
      '禁言回复，info会替换为 用户名（QQ），time会替换为禁言时长',
      'Input'
    ),
    s(
      'releaseReply',
      '解禁回复',
      '解禁时的回复，info会替换为 用户名（QQ）',
      'Input'
    ),
    s(
      'allMuteReply',
      '全体禁言回复',
      '全体禁言回复',
      'Input'
    ),
    s(
      'releaseAllMuteReply',
      '全体解禁回复',
      '全体解禁回复',
      'Input'
    ),
    s(
      'releaseAllMutedReply',
      '全部解禁回复',
      '全部解禁回复，num会被替换为解禁群员的数量',
      'Input'
    ),
    sPRO('#禁言', undefined, [0, 0, 1, 1, 1, 0]),
    sPRO('#全体禁言', 'muteAll.', [0, 0, 1, 1, 1, 0])
  )
}

if (file.existsSync(Path.get('groupAdmin', 'kick.js'))) {
  prefix = 'kick.'
  GAconfig.push(
    {
      label: '【UC】群管 · 踢人',
      component: 'Divider'
    },
    s(
      'isOpen',
      '群管踢人开关',
      '是否开启UC群管踢人'
    ),
    s(
      'isAutoBlack',
      '群同时拉黑',
      '踢人后是否自动拉黑'
    ),
    s(
      'kickReply',
      '踢人回复',
      '踢人回复',
      'Input'
    ),
    sPRO('#踢', undefined, [0, 0, 1, 1, 1, 0])
  )
}

if (file.existsSync(Path.get('groupAdmin', 'RequestAdd.js'))) {
  prefix = 'RequestAdd.'
  GAconfig.push(
    {
      label: '【UC】群管 · 入群申请',
      component: 'Divider'
    },
    s(
      'isOpen',
      '入群申请开关',
      '是否开启UC群管入群申请处理（下列功能总开关）'
    ),
    s(
      'isAutoApprove',
      '自动同意',
      '是否自动同意入群申请（黑名单除外）'
    ),
    s(
      'isAutoRefuseBlack',
      '自动拒绝黑名单',
      '是否自动拒绝黑名单用户的入群申请'
    ),
    s(
      'isNoticeGroup',
      '通知群聊',
      '是否通知群（黑名单除外）'
    ),
    s(
      'isNoticeMaster',
      '通知主人',
      '入群申请是否通知主人'
    ),
    sPRO('#同意/拒绝', undefined, [0, 0, 1, 1, 1, 0])
  )
}

if (file.existsSync(Path.get('groupAdmin', 'welcome.js'))) {
  prefix = 'welcome.'
  GAconfig.push(
    {
      label: '【UC】群管 · 入群欢迎',
      component: 'Divider'
    },
    s(
      'isOpen',
      '入群欢迎开关',
      '是否开启UC群管入群欢迎'
    ),
    s(
      'isAvatar',
      '展示头像',
      '入群欢迎同时展示新群员的头像'
    ),
    s(
      'isAt',
      '艾特新群员',
      '入群欢迎同时艾特新群员'
    ),
    sPRO('#修改入群欢迎', undefined, [0, 0, 1, 1, 1, 1])
  )
}

if (file.existsSync(Path.get('groupAdmin', 'mourn.js'))) {
  prefix = 'mourn.'
  GAconfig.push(
    {
      label: '【UC】群管 · 退群通知',
      component: 'Divider'
    },
    s(
      'isOpen',
      '退群通知开关',
      '是否开启UC群管退群通知'
    ),
    s(
      'isAvatar',
      '展示头像',
      '退群通知是否同时展示退群群员的头像'
    ),
    sPRO('#修改退群通知', undefined, [0, 0, 1, 1, 1, 1])
  )
}

if (file.existsSync(Path.get('groupAdmin', 'Increase.js'))) {
  prefix = 'Increase.'
  GAconfig.push(
    {
      label: '【UC】群管 · 群员增加',
      component: 'Divider'
    },
    s(
      'isOpen',
      '群员增加开关',
      '是否开启UC群管群员增加处理（下列功能总开关）'
    ),
    s(
      'isNotice',
      '通知主人',
      '群员增加是否通知主人'
    ),
    s(
      'isKickBlack',
      '自动踢黑名单',
      '检测到是黑名单用户进群时是否自动踢出并撤回其所有消息'
    ),
    s(
      'kickBlackReply',
      '自动踢出回复',
      '自动踢出后的回复，info会替换为 用户名（QQ），BotName会替换为机器人名称',
      'Input'
    )
  )
}

if (file.existsSync(Path.get('groupAdmin', 'Decrease.js'))) {
  prefix = 'Decrease.'
  GAconfig.push(
    {
      label: '【UC】群管 · 群员减少',
      component: 'Divider'
    },
    s(
      'isOpen',
      '群员减少开关',
      '是否开启UC群管群员减少处理（下列功能总开关）'
    ),
    s(
      'isNotice',
      '通知主人',
      '群员减少是否通知主人'
    ),
    s(
      'isAutoBlack',
      '自动拉黑',
      '群员主动退群是否自动拉黑'
    )
  )
}

if (file.existsSync(Path.get('groupAdmin', 'floodScreen.js'))) {
  prefix = 'floodScreen.'
  GAconfig.push(
    {
      label: '【UC】群管 · 刷屏检测',
      component: 'Divider'
    },
    s(
      'isOpen',
      '刷屏检测开关',
      '是否开启UC群管刷屏检测'
    ),
    s(
      'isDetecteBlack',
      '自动踢黑名单',
      '检测到黑名单用户发言是否自动踢出并撤回其消息'
    ),
    s(
      'timeRange',
      '检测时间范围',
      '刷屏检测时间范围，在该时间范围内连续刷屏则触发惩罚，单位秒',
      'InputNumber',
      { min: 1 }
    ),
    s(
      'judgeNum',
      '刷屏阈值',
      '刷屏惩罚阈值，达到该次数则触发惩罚',
      'InputNumber',
      { min: 2 }
    ),
    s(
      'isWarn',
      '警告群员',
      '是否警告群员，达到(刷屏惩罚阈值-2)时警告'
    ),
    s(
      'warnText',
      '警告回复',
      '刷屏警告的回复内容',
      'Input'
    ),
    s(
      'isPunish',
      '惩罚群员',
      '是否惩罚，达到刷屏惩罚阈值时惩罚'
    ),
    s(
      'punishMode',
      '惩罚方式',
      '惩罚方式：无或禁言或踢出',
      'Select',
      {
        options: [
          { label: '禁言', value: 'mute' },
          { label: '踢出', value: 'kick' }
        ]
      }
    ),
    s(
      'punishText',
      '惩罚回复',
      '刷屏惩罚前的回复内容（关闭惩罚后仍会回复）',
      'Input'
    ),
    s(
      'muteTime',
      '禁言时长',
      '设置为禁言时的禁言时长，单位分钟',
      'InputNumber',
      { min: 1 }
    ),
    s(
      'isAutoBlack',
      '自动拉黑',
      '设置为踢人时是否同时拉黑'
    )
  )
}

prefix = ''
cfgPrefix = 'permission.'
const permission = [
  s(
    'GlobalMaster',
    'UC全局主人',
    '拥有本插件全局主人权限的用户，可与底层主人独立设置',
    'GSelectFriend'
  ),
  s(
    'GlobalAdmin',
    'UC全局管理',
    '拥有本插件全局群管理权限的用户',
    'GSelectFriend'
  ),
  s(
    'GlobalBlackQQ',
    'UC全局黑名单',
    '插件全局拉黑用户，无法使用本插件',
    'GTags',
    {
      placeholder: '请输入黑名单QQ',
      allowAdd: true,
      allowDel: true,
      showPrompt: true,
      promptProps: addUserPrompt,
      valueFormatter: (value) => parseInt(value)
    }
  )
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
        s(
          'isWatch',
          '开发环境',
          '开发环境下使用，支持热更新，重启生效'
        ),
        s(
          'debugLog',
          '调试日志输出',
          '是否在控制台输出UC插件调试日志。开发者模式下，会强制开启调试日志'
        ),
        s(
          'log',
          '普通日志输出',
          '是否在控制台输出UC插件普通日志'
        ),
        s(
          'isDefaultMaster',
          '合并主人',
          '是否合并插件主人和机器人主人'
        ),
        s(
          'onlyMaster',
          '仅主人可操作',
          '是否仅主人可使用UC插件所有功能，开启后除主人的所有人UC功能皆不响应'
        ),
        s(
          'priority',
          '插件优先级',
          'UC插件优先级，优先级越小越优先响应，可为任意整数，重启生效',
          'InputNumber'
        ),
        s(
          'server',
          '连接服务',
          'Api服务选择，若频繁Api连接失败可尝试更改重试',
          'Select',
          {
            options: [
              { label: '服务1', value: 1 },
              { label: '服务2', value: 2 }
            ]
          }
        ),
        s(
          'BotName',
          '机器人名称',
          'UC插件的机器人名称，用于个别时候的机器人回复或开关Bot的指令等',
          'Input'
        ),
        s(
          'globalPrefix',
          '允许前缀',
          '开关允许响应前缀，不是“仅前缀”而是使BotName+指令也能正常触发，用于避免在多机器人的群内只想要操作某一机器人时“一呼百应”'
        ),
        s(
          'loveMysNotice',
          '过码次数预警值',
          '每日0点自动检测过码剩余次数，低于该值则提醒主人，0则不提醒',
          'InputNumber',
          { min: 0 }
        ),
        s(
          'noPerReply',
          '用户无权限回复',
          '用户无权限进行某操作时，机器人的回复',
          'Input'
        ),
        s(
          'noPowReply',
          'Bot无权限回复',
          '机器人无权限进行某操作时，机器人的回复',
          'Input'
        ),
        s(
          'fetchErrReply',
          '连接失败回复',
          'api服务连接失败时机器人的回复',
          'Input'
        ),
        s(
          'helpFold',
          '帮助图折叠',
          '帮助图折叠展示的部分，不直接在#UC帮助中展示，仅可通过专用指令查看该组帮助',
          'Select',
          {
            allowAdd: true,
            allowDel: true,
            mode: 'multiple',
            options: _.map(UCPr.CFG.helpData, 'command').filter(Boolean).map(item => ({ value: item }))
          }
        )
      ].concat(js, GAconfig),

      getConfigData() {
        return guoba_config
      },

      setConfigData(data, { Result }) {
        const change = (path, value, cfg) => {
          if (!path) return
          Admin.globalCfg(path, value, cfg) && changed.push(path)
        }
        const changed = []
        for (const [property, value] of Object.entries(data)) {
          const [cfg, ...ret] = property.split('.')
          _.set(guoba_config, property, value)
          if (ret.at(-1) === 'power') {
            ret.pop()
            const path = ret.join('.')
            Reflect.ownKeys(_.get(UCPr[cfg], path)).forEach(item => change(path + '.' + item, value.includes(item), cfg))
            continue
          }
          change(ret.join('.'), value, cfg)
        }
        if (changed.length) {
          Data.refreshLock()
          return Result.ok({}, '保存成功~')
        }
        return Result.ok({}, '什么都没变哦~')
      }
    }
  }
}