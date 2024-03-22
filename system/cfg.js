/* eslint-disable comma-dangle */
import { Data, Path, Check, file } from '../components/index.js'
import { judgeInfo } from '../components/Admin.js'
import _ from 'lodash'

/**
 * 对#UC设置 的每一项进行设置
 * @param {path} path config中的path，定位设置
 * @param {string} title 展示的小标题，仅展示
 * @param {string} desc 功能描述，仅展示
 * @param {'Input'|'InputNumber'|'Switch'|'Select'|'Power'} [type='Switch'] 指令修改value类型，数据处理分类
 * @param {string|number} def 默认值
 * @param {Function} input 对输入值的处理函数
 * @param {{}} [optional={}] 额外条件
 */
function s(path, title, desc, type = 'Switch', def = '', input, optional = {}) {
  if (prefix) {
    path = prefix + path
  }
  def &&= _.truncate(def, { length: 6, omission: '…' })
  if (type === 'Select') {
    if (optional.refresher) { // 选择时动态刷新列表
      def = _.truncate(optional.refresher().join('/'), { length: 18, omission: '…' })
      input = (str) => _.find(optional.refresher(), v => v == str)
    } else {
      def = _.truncate(input.join('/'), { length: 18, omission: '…' })
      const ret = input
      input = (str) => _.find(ret, v => v == str)
    }
  }
  return _.merge({
    path,
    title,
    desc,
    type,
    def,
    input
  }, optional)
}
/**
 * 对UC功能权限的设置
 * @param {string} [name='使用'] 权限名，仅展示，默认为“使用”，组装为：name权限
 * @param {string} [def=''] 默认值
 * @param {string} [_prefix=''] 权限path前缀，组装为：prefix_prefix
 * @param {Array} options 可配置项数组['群聊', '私聊', '仅主人', '插件管理', '群管理', '任何人']
 * @param {string} desc 额外描述
 * @returns {}
 */
function sPRO(name = '使用', def = '', _prefix = 'use', options = [0, 1, 2, 3, 4, 5], desc = '') {
  const property = name + '权限'
  return {
    ...s(
      _prefix,
      property,
      `${property}判断，${desc}${desc ? '，' : ''}1开0关，分别代表：` + options.map(i => judgeInfo[i]).join('、'),
      'Power',
      def
    ),
    options
  }
}

/** path前缀 */
let prefix = ''

const 系统 = {
  /** 一个设置组的标题 */
  title: 'UC系统——UC插件系统设置',
  /** 仅限全局设置 */
  GM: true,
  /** 一个设置组的各个单独设置 */
  cfg: {
    开发环境: s(
      'isWatch',
      '开发环境',
      '用于开发环境的功能，支持热更新，重启生效'
    ),
    调试日志: s(
      'debugLog',
      '系统调试日志',
      '是否在控制台输出UC插件调试日志。开发者模式下，会强制开启调试日志'
    ),
    日志: s(
      'log',
      '系统日志',
      '是否在控制台输出UC插件普通日志'
    ),
    合并主人: s(
      'isDefaultMaster',
      '合并插件主人',
      '是否合并插件主人和机器人主人'
    ),
    自动备份: s(
      'autoBackup',
      '每日自动备份',
      '是否每日零点自动备份云崽和插件数据，开启前请尝试#UC备份数据 是否可用'
    ),
    仅主人: s(
      'onlyMaster',
      '仅主人可操作',
      '是否仅主人可使用UC插件所有功能，开启后除主人的所有人UC功能皆不响应'
    ),
    优先级: s(
      'priority',
      '插件优先级',
      'UC插件优先级，优先级越小越优先响应，可为任意整数，重启生效',
      'InputNumber',
      251,
      (num) => parseInt(/-?\d+/.exec(num)?.[0])
    ),
    服务: s(
      'server',
      'api服务',
      '插件api服务的服务器，建议1，如遇api网络问题可以尝试切换',
      'InputNumber',
      1,
      (num) => parseInt(num.match(/[12]/)?.[0])
    ),
    机器人名称: s(
      'BotName',
      '机器人名称',
      'UC插件的机器人名称，用于个别时候的机器人回复或开关Bot的指令等',
      'Input',
      '纳西妲'
    ),
    全局前缀: s(
      'globalPrefix',
      '全局前缀',
      '全局开关响应前缀，不是“仅前缀”而是使BotName+指令也能正常触发，用于避免在多机器人的群内只想要操作某一机器人时“一呼百应”'
    ),
    // 过码提醒: s(
    //   'loveMysNotice',
    //   '过码剩余提醒',
    //   '每日零点loveMys（如果有）剩余过码次数小于等于该值时自动提醒主人，0则不提醒',
    //   'InputNumber',
    //   50
    // ),
    // 用户无权限回复: s(
    //   'noPerReply',
    //   '用户无权限回复',
    //   '用户无权限进行某操作时，机器人的回复',
    //   'Input',
    //   '无权限'
    // ),
    // 机器人无权限回复: s(
    //   'noPowReply',
    //   '无权限回复',
    //   '机器人无权限进行某操作时，机器人的回复',
    //   'Input',
    //   '主淫，小的权限不足，无法执行该操作嘤嘤嘤~'
    // ),
    // 连接失败回复: s(
    //   'fetchErrReply',
    //   '连接失败回复',
    //   'api服务连接失败时机器人的回复',
    //   'Input',
    //   '服务连接失败，请稍后重试'
    // )
  }
}

const config = { '': 系统 }

if (Check.file(Path.get('apps', 'qsignRestart.js'))) {
  prefix = 'qsignRestart.'
  config.签名 = {
    title: 'UC工具——签名自动重启设置（修改后重启生效）',
    GM: true,
    cfg: {
      自动重启: s(
        'isAutoOpen',
        '自动开启签名重启',
        '启动Bot后是否自动开启签名重启检测'
      ),
      自动清理日志: s(
        'isAutoClearLog',
        '自动清理签名日志',
        '是否开启每日零点自动清理签名日志'
      ),
      隐藏: s(
        'windowsHide',
        '隐藏签名窗口',
        '隐藏重启的签名窗口。注意：开启此项后，关闭机器人将同时关闭签名。不建议开启'
      ),
      崩溃检测: s(
        'switch1',
        '签名崩溃检测',
        '签名崩溃检测，检测签名是否崩溃，崩溃则尝试启动签名'
      ),
      异常检测: s(
        'switch2',
        '签名异常检测',
        '签名异常检测，检测签名是否异常（包括崩溃），异常则尝试重启签名'
      ),
      异常重启次数: s(
        'errorTimes',
        '签名异常重启次数',
        '签名异常次数大于等于该值时执行签名重启，避免高频重启，不建议低于2',
        'InputNumber',
        3
      ),
      路径: s(
        'qsign',
        '签名路径',
        '签名启动器执行路径，不填则取默认路径',
        'Input',
        Path.qsign,
        undefined,
        {
          value: Path.qsign.slice(0, 13) + '...'
        }
      ),
      host: s(
        'host',
        '签名host',
        '签名的host，默认127.0.0.1',
        'Input',
        '127.0.0.1'
      ),
      port: s(
        'port',
        '签名port',
        '签名的port，默认801',
        'InputNumber',
        801
      ),
      启动器名称: s(
        'qsingRunner',
        '启动器名称',
        '签名启动器的全称，插件会通过启动器启动签名，默认一键startAPI.bat',
        'Input',
        '一键startAPI.bat'
      ),
      检测间隔: s(
        'sleep',
        '签名崩溃检测间隔',
        '崩溃检测时间间隔，单位秒，不建议低于10',
        'InputNumber',
        60,
        (num) => Math.max(10, parseInt(num.match(/\d+/)?.[0]))
      )
    }
  }
}

if (Check.file(Path.get('apps', 'switchBot.js'))) {
  prefix = 'switchBot.'
  config.开关机器人 = {
    title: 'UC工具——指定群开关机器人设置',
    cfg: {
      开启指令: s(
        'openReg',
        '开启指令',
        '让Bot上班的指令：BotName+指令即可触发，多个用|间隔，仅以全局为准',
        'Input',
        '上班|工作',
        undefined,
        { global: true }
      ),
      关闭指令: s(
        'closeReg',
        '关闭指令',
        '让Bot下班的指令：BotName+指令即可触发，多个用|间隔，仅以全局为准',
        'Input',
        '下班|休息',
        undefined,
        { global: true }
      ),
      开启回复: s(
        'openMsg',
        '开启回复',
        '在群内开启Bot时的回复，“BotName”会被替换为系统设置的BotName的名称',
        'Input',
        '好哒，BotName开始上班啦！'
      ),
      关闭回复: s(
        'closeMsg',
        '关闭回复',
        '在群内开启Bot时的回复，“BotName”会被替换为系统设置的BotName的名称',
        'Input',
        'BotName休息去啦~'
      ),
      权限: sPRO('开关', '0100', 'use', [2, 3, 4, 5]),
      响应前缀: s(
        'isPrefix',
        '响应前缀',
        '在关闭群聊的情况下，以BotName开头的消息是否也响应'
      ),
      响应艾特: s(
        'isAt',
        '响应艾特',
        '在关闭群聊的情况下，艾特机器人的消息是否也响应'
      ),
      响应权限: sPRO('响应', '0100', 'closedCommand', [2, 3, 4, 5])
    }
  }
}

if (Check.file(Path.get('apps', 'JSsystem.js'))) {
  prefix = 'JSsystem.'
  config.js管理 = {
    title: 'UC工具——JS管理系统设置',
    GM: true,
    cfg: {
      '': s(
        'isOpen',
        'JS系统开关',
        '是否启用UC插件JS插件管理系统'
      ),
      压缩: s(
        'isZip',
        '多文件自动压缩',
        '一次性查看多个JS文件时是否自动压缩为zip发送'
      ),
      群聊撤回: s(
        'recallFileGroup',
        '群聊文件撤回时间',
        '群聊发送文件后自动撤回时长，0-120秒，0为不撤回',
        'InputNumber',
        0
      ),
      私聊撤回: s(
        'recallFilePrivate',
        '私聊文件撤回时间',
        '私聊发送文件后自动撤回时长，4-120秒，0为不撤回',
        'InputNumber',
        0,
        (num) => Math.min(120, num.match(/\d+/)?.[0])
      )
    }
  }
}

if (Check.file(Path.get('apps', 'ActReminder.js'))) {
  prefix = 'ActReminder.'
  config.活动提醒 = {
    title: 'UC工具——游戏活动截止提醒设置',
    cfg: {
      原神提醒: s(
        'opIsOpen',
        '原神提醒开关',
        '原神活动截止提醒开关，建议只在需要的群内单独开启'
      ),
      星铁提醒: s(
        'srIsOpen',
        '星铁提醒开关',
        '星铁活动截止提醒开关，建议只在需要的群内单独开启'
      ),
      原神cron: s(
        'opCron',
        '原神提醒cron',
        '原神活动检测时间cron表达式，仅以全局设置为准，修改后重启生效',
        'Input',
        '0 0 12 * * ?',
        undefined,
        { global: true }
      ),
      星铁cron: s(
        'srCron',
        '星铁提醒cron',
        '星铁活动检测时间cron表达式，仅以全局设置为准，修改后重启生效',
        'Input',
        '0 0 12 * * ?',
        undefined,
        { global: true }
      ),
      原神天数: s(
        'opDays',
        '原神提醒天数',
        '每次检测时若原神活动剩余天数小于等于该值则提醒',
        'InputNumber',
        1
      ),
      星铁天数: s(
        'srDays',
        '星铁提醒天数',
        '每次检测时若星铁活动剩余天数小于等于该值则提醒',
        'InputNumber',
        1
      ),
      原神艾特: s(
        'opAtAll',
        '原神全员艾特',
        '原神活动截止提醒是否艾特全员（需管理员权限）'
      ),
      星铁艾特: s(
        'srAtAll',
        '星铁全员艾特',
        '星铁活动截止提醒是否艾特全员（需管理员权限）'
      )
    }
  }
}

if (Check.file(Path.get('apps', 'chuoyichuo.js'))) {
  prefix = 'chuoyichuo.'
  config.戳一戳 = {
    title: 'UC娱乐——戳一戳回复设置',
    cfg: {
      '': s(
        'isOpen',
        '戳一戳开关',
        '是否开启UC戳一戳'
      ),
      群名片: s(
        'isAutoSetCard',
        '自动群名片',
        '被戳是否自动更新群名片：BotName|后缀'
      ),
      后缀: s(
        'groupCard',
        '群名片后缀',
        '更新群名片后缀内容，num会被替换为当前被戳次数',
        'Input',
        '今日已被戳num次~'
      ),
      图包: s(
        'picPath',
        '图包',
        '戳一戳使用的图包（自动群名片会取此图包名称）',
        'Select',
        '',
        '',
        { refresher: () => file.readdirSync(Path.chuoyichuo, { type: 'Directory' }) }
      ),
      冷却: s(
        'CD',
        '冷却',
        '戳一戳CD，0为不限制，各群独立，单位秒',
        'InputNumber',
        0
      ),
      文本图片概率: s(
        'textimg',
        '文本+图片概率',
        '被戳回复文本+图片的概率，可选0-1',
        'InputNumber',
        0.8,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      语音概率: s(
        'AiRecord',
        'AI语音概率',
        '当回复文字(汉字数>=3)时，将文字转语音的概率，speaker取图包名称，可选角色见#UC音色列表，此概率独立于整体概率，可选0-0.5',
        'InputNumber',
        0.1,
        (num) => Math.min(0.5, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      次数图片概率: s(
        'chuoimg',
        '次数+图片概率',
        '触发文本+图片回复时在文本前加上被戳次数的概率，独立于其他概率，可选0-1',
        'InputNumber',
        0.2,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      头像表情包概率: s(
        'face',
        '头像表情包概率',
        '被戳回复头像表情包概率，可选0-1',
        'InputNumber',
        0.1,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      禁言概率: s(
        'mute',
        '被戳禁言概率',
        '被戳禁言对方概率，可选0-1。1-(文本图片+表情包+禁言)即为反击概率',
        'InputNumber',
        0.05,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      禁言时长: s(
        'muteTime',
        '禁言时长',
        '禁言的时长，单位分，0为不禁言',
        'InputNumber',
        2
      )
    }
  }
}

if (Check.file(Path.get('apps', 'chuoMaster.js'))) {
  prefix = 'chuoMaster.'
  config.戳主人回复 = {
    title: 'UC娱乐——戳主人回复设置',
    cfg: {
      '': s(
        'isOpen',
        '戳主人回复开关',
        '是否开启UC戳主人回复'
      ),
      艾特: s(
        'isAt',
        '艾特回复',
        '回复时是否同时艾特对方'
      ),
      回复概率: s(
        'text',
        '回复概率',
        '戳主人回复消息的概率，0-1',
        'InputNumber',
        0.6,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      图片概率: s(
        'img',
        '图片概率',
        '戳主人发送合成表情包概率，0-1',
        'InputNumber',
        0.1,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      反击概率: s(
        'poke',
        '反击概率',
        '戳主人反击概率，0-1',
        'InputNumber',
        0.2,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      禁言概率: s(
        'mute',
        '禁言概率',
        '戳主人禁言概率，0-1',
        'InputNumber',
        0.1,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      禁言时长: s(
        'muteTime',
        '禁言时长',
        '禁言的时长，单位分，0为不禁言',
        'InputNumber',
        2
      )
    }
  }
}

if (Check.file(Path.get('apps', 'atMaster.js'))) {
  prefix = 'atMaster.'
  config.艾特主人回复 = {
    title: 'UC娱乐——艾特主人回复设置',
    cfg: {
      '': s(
        'isOpen',
        '艾特主人回复开关',
        '是否开启UC艾特主人回复'
      ),
      概率: s(
        'probability',
        '回复概率',
        '艾特主人回复的概率，0-1',
        'InputNumber',
        0.5,
        (num) => Math.min(1, num.match(/(?:0\.)?\d+/)?.[0])
      ),
      艾特: s(
        'isAt',
        '艾特回复',
        '回复时是否同时艾特对方'
      ),
      权限: sPRO(
        '回复',
        '0111',
        'use',
        [2, 3, 4, 5],
        '满足此权限条件的用户才可能会触发艾特主人回复'
      )
    }
  }
}

if (Check.file(Path.get('apps', 'randomWife.js'))) {
  prefix = 'randomWife.'
  config.随机老婆 = {
    title: 'UC娱乐——随机二次元老婆设置',
    cfg: {
      '': s(
        'isOpen',
        '随机老婆开关',
        '是否开启UC随机老婆'
      ),
      次数限制: s(
        'wifeLimits',
        '每日老婆限制',
        '每日随机老婆次数限制，包括主人',
        'InputNumber',
        1,
        (num) => Math.max(1, num.match(/\d+/)?.[0])
      ),
      上传权限: sPRO(
        '上传',
        '0110',
        'add',
        [2, 3, 4, 5]
      ),
      删除权限: sPRO(
        '删除',
        '0100',
        'del',
        [2, 3, 4, 5]
      )
    }
  }
}

if (Check.file(Path.get('apps', 'randomMember.js'))) {
  prefix = 'randomMember.'
  config.随机群友 = {
    title: 'UC娱乐——随机挑选群友设置',
    cfg: {
      '': s(
        'isOpen',
        '随机群友开关',
        '是否开启UC随机群友'
      ),
      艾特: s(
        'isAt',
        '是否自动艾特',
        '是否自动艾特随机到的群友'
      ),
      指令: s(
        'keyWords',
        '触发指令',
        '#加触发指令 就可以触发该功能，不区分字母大小写，仅以全局为准',
        'Input',
        '随机群友',
        undefined,
        { global: true }
      ),
      回复: s(
        'reply',
        '回复内容',
        '随机群友回复内容，info会被替换为：群友昵称（QQ）',
        'Input',
        '恭喜info成为天选之子！'
      ),
      权限: sPRO(
        undefined,
        '0111',
        'use',
        [2, 3, 4, 5]
      )
    }
  }
}

if (Check.file(Path.get('apps', 'sqtj.js'))) {
  prefix = 'sqtj.'
  config.水群统计 = {
    title: 'UC娱乐——统计群聊聊天数据设置',
    cfg: {
      '': s(
        'isOpen',
        '水群统计开关',
        '是否开启UC水群统计'
      ),
      机器人: s(
        'isSelf',
        '统计机器人自身',
        '水群统计是否也统计机器人自身记录'
      ),
      推送: s(
        'isAutoSend',
        '0点推送水群统计',
        '每日0点是否自动发送水群统计至群内，建议只在需要打开的群内单独开启，否则每个群都会发送'
      ),
      保存本地: s(
        'isSave',
        '保存本地',
        '查询的聊天记录是否保存至本地，关闭则每次都从零获取数据，建议开启'
      ),
      权限: sPRO(
        undefined,
        '0111',
        'use',
        [2, 3, 4, 5]
      )
    }
  }
}

if (Check.file(Path.get('apps', 'camouflage.js'))) {
  prefix = 'camouflage.'
  config.伪装 = {
    title: 'UC娱乐——群聊伪装群友设置',
    cfg: {
      '': s(
        'isOpen',
        '伪装开关',
        '是否开启UC伪装群友功能'
      ),
      时长: s(
        'time',
        '伪装时长',
        '单次伪装时长，单位分钟',
        'InputNumber',
        10
      ),
      冷却: s(
        'CD',
        '冷却时长',
        '单次伪装结束后CD，单位分钟，所有群共用CD，0为不冷却',
        'InputNumber',
        10
      ),
      次数限制: s(
        'timesLimit',
        '伪装次数限制',
        '每群每人每天伪装次数限制，0为不限制，但最多不超过10（主人不限）',
        'InputNumber',
        3,
        (num) => Math.min(10, num.match(/\d+/)?.[0])
      ),
      消息限制: s(
        'msgLimit',
        '伪装消息限制',
        '消息数量限制，单次伪装发送的消息数量超过此值会直接退出伪装，0为不限制',
        'InputNumber',
        251
      ),
      静默: s(
        'isSilent',
        '不响应指令',
        '伪装期间是否不响应指令（#结束伪装 除外）'
      ),
      权限: sPRO(
        undefined,
        '0111',
        'use',
        [2, 3, 4, 5]
      )
    }
  }
}

if (Check.file(Path.get('apps', 'BLivePush.js')) && Data.check('BlivePush')) {
  prefix = 'BlivePush.'
  config.直播推送 = {
    title: 'UC娱乐——B站直播推送设置',
    cfg: {
      群聊: s(
        'isGroup',
        '群聊推送开关',
        '群聊推送全局开关，关闭不再推送群聊'
      ),
      私聊: s(
        'isPrivate',
        '私聊推送开关',
        '私聊推送全局开关，关闭不再推送私聊'
      ),
      检测间隔: s(
        'mins',
        '推送检测间隔',
        '推送检测间隔，单位分钟，不建议小于4，仅以全局为准，重启生效',
        'InputNumber',
        4,
        (num) => Math.max(2, num.match(/\d+/)?.[0]),
        { global: true }
      ),
      权限: sPRO(
        '订阅',
        '100110',
        'use'
      )
    }
  }
}

if (Check.file(Path.get('apps', 'bigjpg.js')) && Data.check('BlivePush')) {
  prefix = 'bigjpg.'
  config.放大图片 = {
    title: 'UC娱乐——放大图片设置',
    cfg: {
      '': s(
        'isOpen',
        '放大图片开关',
        '是否开启UC放大图片'
      ),
      apikey: s(
        'apiKey',
        'ApiKey',
        '用于放大图片服务的密钥',
        'Input',
        '*****',
        undefined,
        { value: '请在锅巴查看', global: true }
      ),
      风格: s(
        'style',
        '放大风格',
        '可选卡通和照片，对于卡通图片放大效果最佳',
        'Select',
        '',
        ['art', 'photo']
      ),
      次数限制: s(
        'limits',
        '每日放大数量限制',
        '每人每天放大次数限制，0为不限制，主人不受限',
        'InputNumber',
        3
      ),
      保存本地: s(
        'isSave',
        '自动保存图片',
        '放大的图片是否自动保存本地。保存路径：UC-plugin/data/bigjpg'
      ),
      四倍: s(
        'x4',
        '4倍开关',
        '4倍放大开关，关闭仅允许主人放大4倍'
      ),
      八倍: s(
        'x8',
        '8倍开关',
        '8倍放大开关，关闭仅允许主人放大8倍'
      ),
      十六倍: s(
        'x16',
        '16倍开关',
        '16倍放大开关，关闭仅允许主人放大16倍'
      ),
      权限: sPRO(
        '放大',
        '100110',
        'use'
      )
    }
  }
}

prefix = ''

const 群管 = {
  title: 'UC群管——UC群管系统设置',
  cfg: {
    群管: s(
      'isOpen',
      '群管开关',
      '是否开启UC群管系统，群管总开关'
    ),
    仅前缀: s(
      'isPrefix',
      '仅响应UC前缀指令',
      '开启UC群管后，UC群管是否只响应以UC为前缀的指令（防冲突用）'
    ),
    超时时长: s(
      'overTime',
      '超时时长',
      '群管上下文操作的超时时间',
      'InputNumber',
      120,
      (num) => Math.max(10, parseInt(num.match(/\d+/)?.[0]))
    )
  }
}

const GAconfig = { '': 群管 }

if (Check.file(Path.get('groupAdmin', 'recall.js'))) {
  prefix = 'recall.'
  GAconfig.撤回 = {
    title: 'UC群管·撤回',
    cfg: {
      '': s(
        'isOpen',
        '群管撤回开关',
        '是否开启UC群管撤回'
      ),
      最大获取: s(
        'FILTER_MAX',
        '最大获取记录',
        '允许递归获取的群聊天记录最大深度',
        'InputNumber',
        520
      ),
      默认清屏: s(
        'defaultClear',
        '默认清屏数量',
        '清屏不指定数量时默认撤回数量',
        'InputNumber',
        10
      ),
      最大清屏: s(
        'CLEAR_MAX',
        '最大清屏数量',
        '允许清屏数量的最大值',
        'InputNumber',
        100
      ),
      最大数量: s(
        'RECALL_MAX',
        '最大撤回数量',
        '允许指定单人撤回的最大值',
        'InputNumber',
        20
      ),
      间隔: s(
        'intervalTime',
        '撤回间隔',
        '批量撤回群消息的间隔时间，单位秒，建议大于等于0.1',
        'InputNumber',
        0.1,
        (num) => Number(num.match(/(?:\d+\.)?\d+/)?.[0])
      ),
      权限: sPRO('使用', '0110', 'use', [2, 3, 4, 5])
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'mute.js'))) {
  prefix = 'mute.'
  GAconfig.禁言 = {
    title: 'UC群管·禁言',
    cfg: {
      '': s(
        'isOpen',
        '群管禁言开关',
        '是否开启UC群管禁言'
      ),
      最长: s(
        'MUTE_MAX',
        '最大禁言时长',
        '允许禁言最大时长，单位秒，默认一天（主人不限）',
        'InputNumber',
        86400
      ),
      默认: s(
        'defaultMute',
        '默认禁言时长',
        '禁言不指定时长时默认禁言时长，单位秒',
        'InputNumber',
        60
      ),
      回复: s(
        'muteReply',
        '禁言回复',
        '禁言回复，info会替换为 用户名（QQ），time会替换为禁言时长',
        'Input',
        '已经把info拖进小黑屋枪毙time啦！'
      ),
      解禁回复: s(
        'releaseReply',
        '解禁回复',
        '解禁时的回复，info会替换为 用户名（QQ）',
        'Input',
        '成功解救info'
      ),
      全体回复: s(
        'allMuteReply',
        '全体禁言回复',
        '全体禁言回复',
        'Input',
        '全都不许说话了哦~'
      ),
      全体解禁回复: s(
        'releaseAllMuteReply',
        '全体解禁回复',
        '全体解禁回复',
        'Input',
        '好耶~可以说话辽~'
      ),
      全部解禁回复: s(
        'releaseAllMutedReply',
        '全部解禁回复',
        '全部解禁回复，num会被替换为解禁群员的数量',
        'Input',
        '归还了num名群员的清白之身！'
      ),
      权限: sPRO('禁言', '011', 'use', [2, 3, 4]),
      全体权限: sPRO('全体禁言', '011', 'muteAll', [2, 3, 4])
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'kick.js'))) {
  prefix = 'kick.'
  GAconfig.踢人 = {
    title: 'UC群管·踢人',
    cfg: {
      '': s(
        'isOpen',
        '群管踢人开关',
        '是否开启UC群管踢人'
      ),
      群拉黑: s(
        'isAutoBlack',
        '群同时拉黑',
        '踢人后是否自动拉黑'
      ),
      回复: s(
        'kickReply',
        '踢人回复',
        '踢人回复',
        'Input',
        '已经把这个坏惹踢掉了！'
      ),
      权限: sPRO('踢人', '011', undefined, [2, 3, 4])
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'RequestAdd.js'))) {
  prefix = 'RequestAdd.'
  GAconfig.入群申请 = {
    title: 'UC群管·入群申请',
    cfg: {
      '': s(
        'isOpen',
        '入群申请开关',
        '是否开启UC群管入群申请处理（下列功能总开关）'
      ),
      自动同意: s(
        'isAutoApprove',
        '自动同意',
        '是否自动同意入群申请（黑名单除外）'
      ),
      拒绝黑名单: s(
        'isAutoRefuseBlack',
        '自动拒绝黑名单',
        '是否自动拒绝黑名单用户的入群申请'
      ),
      通知群聊: s(
        'isNoticeGroup',
        '通知群聊',
        '是否通知群（黑名单除外）'
      ),
      通知主人: s(
        'isNoticeMaster',
        '通知主人',
        '入群申请是否通知主人'
      ),
      权限: sPRO('#同意/拒绝', '0110', undefined, [2, 3, 4, 5])
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'WM.js'))) {
  prefix = 'welcome.'
  GAconfig.入群欢迎 = {
    title: 'UC群管·入群欢迎',
    cfg: {
      '': s(
        'isOpen',
        '入群欢迎开关',
        '是否开启UC群管入群欢迎'
      ),
      头像: s(
        'isAvatar',
        '展示头像',
        '入群欢迎同时展示新群员的头像'
      ),
      艾特: s(
        'isAt',
        '艾特新群员',
        '入群欢迎同时艾特新群员'
      ),
      修改权限: sPRO('修改', '0110', undefined, [2, 3, 4, 5])
    }
  }
  prefix = 'mourn.'
  GAconfig.退群通知 = {
    title: 'UC群管·退群通知',
    cfg: {
      '': s(
        'isOpen',
        '退群通知开关',
        '是否开启UC群管退群通知'
      ),
      头像: s(
        'isAvatar',
        '展示头像',
        '退群通知是否同时展示退群群员的头像'
      ),
      修改权限: sPRO('修改', '0110', undefined, [2, 3, 4, 5])
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'Increase.js'))) {
  prefix = 'Increase.'
  GAconfig.群员增加 = {
    title: 'UC群管·群员增加',
    cfg: {
      '': s(
        'isOpen',
        '群员增加开关',
        '是否开启UC群管群员增加处理（下列功能总开关）'
      ),
      通知主人: s(
        'isNotice',
        '通知主人',
        '群员增加是否通知主人'
      ),
      踢黑名单: s(
        'isKickBlack',
        '自动踢黑名单',
        '检测到是黑名单用户进群时是否自动踢出并撤回其所有消息'
      ),
      踢出回复: s(
        'kickBlackReply',
        '自动踢出回复',
        '自动踢出后的回复，info会替换为 用户名（QQ），BotName会替换为机器人名称',
        'Input',
        '黑名单用户info，BotName已经把TA踢掉了！'
      )
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'Decrease.js'))) {
  prefix = 'Decrease.'
  GAconfig.群员减少 = {
    title: 'UC群管·群员减少',
    cfg: {
      '': s(
        'isOpen',
        '群员减少开关',
        '是否开启UC群管群员减少处理（下列功能总开关）'
      ),
      通知主人: s(
        'isNotice',
        '通知主人',
        '群员减少是否通知主人'
      ),
      自动拉黑: s(
        'isAutoBlack',
        '自动拉黑',
        '群员主动退群是否自动拉黑'
      )
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'floodScreen.js'))) {
  prefix = 'floodScreen.'
  GAconfig.刷屏检测 = {
    title: 'UC群管·刷屏检测',
    cfg: {
      '': s(
        'isOpen',
        '刷屏检测开关',
        '是否开启UC群管刷屏检测'
      ),
      自动踢黑名单: s(
        'isDetecteBlack',
        '黑名单自动踢出',
        '检测到黑名单用户发言是否自动踢出并撤回其消息'
      ),
      时间范围: s(
        'timeRange',
        '检测时间范围',
        '刷屏检测时间范围，在该时间范围内连续刷屏则触发惩罚，单位秒',
        'InputNumber',
        10
      ),
      刷屏次数: s(
        'judgeNum',
        '刷屏次数',
        '刷屏次数，达到该次数则触发惩罚',
        'InputNumber',
        10
      ),
      警告群员: s(
        'isWarn',
        '警告群员',
        '是否警告群员，达到(刷屏数量-2)时警告'
      ),
      警告回复: s(
        'warnText',
        '警告回复',
        '刷屏警告的回复内容',
        'Input',
        '不要刷屏哦~'
      ),
      惩罚群员: s(
        'isPunish',
        '惩罚群员',
        '是否惩罚群员，达到刷屏惩罚阈值时惩罚'
      ),
      惩罚方式: s(
        'punishMode',
        '惩罚方式',
        '惩罚方式：mute 或 kick',
        'Select',
        '',
        ['mute', 'kick']
      ),
      惩罚回复: s(
        'punishText',
        '惩罚回复',
        '刷屏惩罚的回复内容',
        'Input',
        '天天就知道刷屏~✨杂鱼~✨杂鱼~'
      ),
      禁言时长: s(
        'muteTime',
        '禁言时长',
        '设置为禁言时的禁言时长，单位分钟',
        'InputNumber',
        5
      ),
      自动拉黑: s(
        'isAutoBlack',
        '自动拉黑',
        '设置为踢人时是否同时拉黑'
      )
    }
  }
}

/** #UC设置信息 */
export default { config, GAconfig }