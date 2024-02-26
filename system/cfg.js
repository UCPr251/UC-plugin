/* eslint-disable comma-dangle */
import { Data, Path, Check, file } from '../components/index.js'
import { judgeInfo } from '../components/Admin.js'
import _ from 'lodash'

/**
 * 对#UC设置 的每一项进行设置
 * @param {path} path config中的path，定位设置
 * @param {string} title 展示的小标题，仅展示
 * @param {string} desc 功能描述，仅展示
 * @param {'num'|'input'|'switch'|'power'|'select'} [type='switch'] 指令修改value类型，数据处理分类
 * @param {string|number} def 默认值
 * @param {Function} input 对输入值的处理函数
 * @param {{}} [optional={}] 额外条件
 */
function s(path, title, desc, type = 'switch', def = '', input, optional = {}) {
  if (prefix) {
    path = prefix + path
  }
  def &&= _.truncate(def, { length: 10, omission: '…' })
  if (type === 'select') {
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
 * @returns {}
 */
function sPRO(name = '使用', def = '', _prefix = 'use', options = [0, 1, 2, 3, 4, 5]) {
  const property = name + '权限'
  return {
    ...s(
      _prefix,
      property,
      property + '判断，1开0关，分别代表：' + options.map(i => judgeInfo[i]).join('、'),
      'power',
      def
    ),
    options
  }
}

/** path前缀 */
let prefix = ''

const 系统 = {
  /** 一个设置组的标题 */
  title: '系统——UC插件系统设置',
  /** 仅限全局设置 */
  GM: true,
  /** 一个设置组的各个单独设置 */
  cfg: {
    开发环境: s(
      'isWatch',
      '开发环境',
      '用于开发环境的功能，可热更新apps，重启生效'
    ),
    日志: s(
      'log',
      '系统日志',
      '是否在控制台输出UC插件普通日志'
    ),
    调试日志: s(
      'debugLog',
      '系统调试日志',
      '是否在控制台输出UC插件调试日志。开发者模式下，会强制开启调试日志'
    ),
    合并主人: s(
      'isDefaultMaster',
      '合并插件主人',
      '插件主人是否和机器人主人合并，不影响插件管理员设置'
    ),
    自动备份: s(
      'autoBackup',
      '每日自动备份',
      '是否每日零点自动备份云崽和插件数据，开启前请尝试#UC备份数据 是否可用'
    ),
    仅主人: s(
      'onlyMaster',
      '仅主人可操作',
      '是否仅主人可使用UC插件功能'
    ),
    优先级: s(
      'priority',
      '插件优先级',
      'UC插件优先级，优先级越小越优先响应，可为任意整数',
      'num',
      251,
      (num) => parseInt(/-?\d+/.exec(num)?.[0])
    ),
    服务: s(
      'server',
      'api服务',
      '插件api服务的服务器，建议1，如遇api网络问题可以尝试切换',
      'num',
      1,
      (num) => parseInt(num.match(/[12]/)?.[0])
    ),
    机器人名称: s(
      'BotName',
      '机器人名称',
      'UC插件的机器人名称，用于个别时候的机器人回复或开关Bot的指令等',
      'input',
      '纳西妲'
    ),
    // 过码提醒: s(
    //   'loveMysNotice',
    //   '过码剩余提醒',
    //   '每日零点loveMys（如果有）剩余过码次数小于等于该值时自动提醒主人，0则不提醒',
    //   'num',
    //   50
    // ),
    // 用户无权限回复: s(
    //   'noPerReply',
    //   '用户无权限回复',
    //   '用户无权限进行某操作时，机器人的回复',
    //   'input',
    //   '无权限'
    // ),
    // 机器人无权限回复: s(
    //   'noPowReply',
    //   '无权限回复',
    //   '机器人无权限进行某操作时，机器人的回复',
    //   'input',
    //   '主淫，小的权限不足，无法执行该操作嘤嘤嘤~'
    // ),
    // 连接失败回复: s(
    //   'fetchErrReply',
    //   '连接失败回复',
    //   'api服务连接失败时机器人的回复',
    //   'input',
    //   '服务连接失败，请稍后重试'
    // )
  }
}

const config = { '': 系统 }

if (Check.file(Path.get('apps', 'qsignRestart.js'))) {
  prefix = 'qsignRestart.'
  config.签名 = {
    title: '签名——签名自动重启设置，重启生效',
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
        'num',
        3
      ),
      路径: s(
        'qsign',
        '签名路径',
        '签名启动器执行路径，不填则取默认路径',
        'input',
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
        'input',
        '127.0.0.1'
      ),
      port: s(
        'port',
        '签名port',
        '签名的port，默认801',
        'num',
        801
      ),
      启动器名称: s(
        'qsingRunner',
        '启动器名称',
        '签名启动器的全称，插件会通过启动器启动签名，默认一键startAPI.bat',
        'input',
        '一键startAPI.bat'
      ),
      检测间隔: s(
        'sleep',
        '签名崩溃检测间隔',
        '崩溃检测时间间隔，单位秒，不建议低于10',
        'num',
        60,
        (num) => Math.max(10, parseInt(num.match(/\d+/)?.[0]))
      )
    }
  }
}

if (Check.file(Path.get('apps', 'switchBot.js'))) {
  prefix = 'switchBot.'
  config.开关机器人 = {
    title: '开关机器人——指定群开关机器人设置',
    cfg: {
      开启指令: s(
        'openReg',
        '开启指令',
        '让Bot上班的指令：BotName+指令即可触发，多个用|间隔',
        'input',
        '上班|工作'
      ),
      关闭指令: s(
        'closeReg',
        '关闭指令',
        '让Bot下班的指令：BotName+指令即可触发，多个用|间隔',
        'input',
        '下班|休息'
      ),
      开启回复: s(
        'openMsg',
        '开启回复',
        '在群内开启Bot时的回复，“BotName”会被替换为系统设置的BotName的名称',
        'input',
        '好哒，BotName开始上班啦！'
      ),
      关闭回复: s(
        'closeMsg',
        '关闭回复',
        '在群内开启Bot时的回复，“BotName”会被替换为系统设置的BotName的名称',
        'input',
        'BotName休息去啦~'
      ),
      权限: sPRO('开关', '010', 'use', [2, 3, 4]),
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

if (Check.file(Path.get('apps', 'chuoyichuo.js'))) {
  prefix = 'chuoyichuo.'
  config.戳一戳 = {
    title: '戳一戳——群聊戳一戳回复设置',
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
        'input',
        '今日已被戳num次~'
      ),
      图包: s(
        'picPath',
        '图包',
        '戳一戳使用的图包',
        'select',
        '',
        '',
        { refresher: () => file.readdirSync(Path.chuoyichuo, { removes: '一键重命名.bat' }) }
      ),
      文本图片概率: s(
        'textimg',
        '文本+图片概率',
        '被戳回复文本+图片的概率，可选0-1',
        'num',
        0.8,
        (num) => Math.min(1, Number(num.match(/(?:0\.)?\d+/)?.[0]))
      ),
      次数图片概率: s(
        'chuoimg',
        '次数+图片概率',
        '触发文本+图片回复时在文本前加上被戳次数的概率，独立于其他概率，可选0-1',
        'num',
        0.2,
        (num) => Math.min(1, Number(num.match(/(?:0\.)?\d+/)?.[0]))
      ),
      头像表情包概率: s(
        'face',
        '头像表情包概率',
        '被戳回复头像表情包概率，可选0-1',
        'num',
        0.1,
        (num) => Math.min(1, Number(num.match(/(?:0\.)?\d+/)?.[0]))
      ),
      禁言概率: s(
        'mute',
        '被戳禁言概率',
        '被戳禁言对方概率，可选0-1。1-(文本图片+表情包+禁言)即为反击概率',
        'num',
        0.05,
        (num) => Math.min(1, Number(num.match(/(?:0\.)?\d+/)?.[0]))
      ),
      禁言时长: s(
        'muteTime',
        '禁言时长',
        '禁言的时长，单位分，0为不禁言',
        'num',
        2
      )
    }
  }
}

if (Check.file(Path.get('apps', 'randomWife.js'))) {
  prefix = 'randomWife.'
  config.随机老婆 = {
    title: '随机老婆',
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
        'num',
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
    title: '随机群友',
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
        '#加触发指令 就可以触发该功能，不区分字母大小写',
        'input',
        '随机群友'
      ),
      回复: s(
        'reply',
        '回复内容',
        '随机群友回复内容，info会被替换为：群友昵称（QQ）',
        'input',
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
    title: '水群统计',
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

if (Check.file(Path.get('apps', 'BLivePush.js')) && Data.check('BlivePush')) {
  prefix = 'BlivePush.'
  config.直播推送 = {
    title: '直播推送',
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
        '推送检测间隔，单位分钟，不建议小于4',
        'num',
        4,
        (num) => Math.max(2, num.match(/\d+/)?.[0])
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
    title: '放大图片',
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
        'input',
        '*****',
        undefined,
        { value: '请在锅巴查看' }
      ),
      风格: s(
        'style',
        '放大风格',
        '可选卡通和照片，对于卡通图片放大效果最佳',
        'select',
        '',
        ['art', 'photo']
      ),
      默认降噪: s(
        'noise',
        '默认降噪程度',
        '默认降噪级别，可选0-4，分别代表[无，低，中，高，最高]',
        'select',
        '',
        [0, 1, 2, 3, 4]
      ),
      默认放大: s(
        'magnification',
        '默认放大倍数',
        '默认放大倍数，可选2、4、8、16',
        'select',
        '',
        [2, 4, 8, 16]
      ),
      次数限制: s(
        'limits',
        '每日放大数量限制',
        '每人每天放大次数限制，0为不限制，主人不受限',
        'num',
        3
      ),
      保存本地: s(
        'isSave',
        '自动保存图片',
        '放大的图片是否自动保存本地。保存路径：' + Path.bigjpg
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
  title: '群管——UC群管系统设置',
  cfg: {
    群管: s(
      'isOpen',
      '群管开关',
      '是否开启UC群管系统，群管总开关'
    ),
    超时时长: s(
      'overTime',
      '超时时长',
      '群管上下文操作的超时时间',
      'num',
      120,
      (num) => Math.max(10, parseInt(num.match(/\d+/)?.[0]))
    )
  }
}

const GAconfig = { '': 群管 }

if (Check.file(Path.get('groupAdmin', 'recall.js'))) {
  prefix = 'recall.'
  GAconfig.撤回 = {
    title: '群管·撤回',
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
        'num',
        520
      ),
      默认清屏: s(
        'defaultClear',
        '默认清屏数量',
        '清屏不指定数量时默认撤回数量',
        'num',
        10
      ),
      最大清屏: s(
        'CLEAR_MAX',
        '最大清屏数量',
        '允许清屏数量的最大值',
        'num',
        100
      ),
      最大数量: s(
        'RECALL_MAX',
        '最大撤回数量',
        '允许指定单人撤回的最大值',
        'num',
        20
      ),
      间隔: s(
        'intervalTime',
        '撤回间隔',
        '批量撤回群消息的间隔时间，单位秒，建议大于等于0.1',
        'num',
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
    title: '群管·禁言',
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
        'num',
        86400
      ),
      默认: s(
        'defaultMute',
        '默认禁言时长',
        '禁言不指定时长时默认禁言时长，单位秒',
        'num',
        60
      ),
      回复: s(
        'muteReply',
        '禁言回复',
        '禁言回复，info会替换为 用户名（QQ），time会替换为禁言时长',
        'input',
        '已经把info拖进小黑屋枪毙time啦！'
      ),
      解禁回复: s(
        'releaseReply',
        '解禁回复',
        '解禁时的回复，info会替换为 用户名（QQ）',
        'input',
        '成功解救info'
      ),
      全体回复: s(
        'allMuteReply',
        '全体禁言回复',
        '全体禁言回复',
        'input',
        '全都不许说话了哦~'
      ),
      全体解禁回复: s(
        'releaseAllMuteReply',
        '全体解禁回复',
        '全体解禁回复',
        'input',
        '好耶~可以说话辽~'
      ),
      全部解禁回复: s(
        'releaseAllMutedReply',
        '全部解禁回复',
        '全部解禁回复，num会被替换为解禁群员的数量',
        'input',
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
    title: '群管·踢人',
    cfg: {
      '': s(
        'isOpen',
        '群管踢人开关',
        '是否开启UC群管踢人'
      ),
      群拉黑: s(
        'isAutoBlack',
        '群同时拉黑',
        '踢人是否同时在该群拉黑该用户'
      ),
      全局拉黑: s(
        'isAutoGlobalBlack',
        '全局拉黑',
        '踢人是否同时在全局拉黑该用户'
      ),
      回复: s(
        'kickReply',
        '踢人回复',
        '踢人回复',
        'input',
        '已经把这个坏惹踢掉了！'
      ),
      权限: sPRO('踢人', '011', undefined, [2, 3, 4])
    }
  }
}

if (Check.file(Path.get('groupAdmin', 'WM.js'))) {
  prefix = 'welcome.'
  GAconfig.入群欢迎 = {
    title: '群管·入群欢迎',
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
    title: '群管·退群通知',
    cfg: {
      '': s(
        'isOpen',
        '退群通知开关',
        '是否开启UC群管退群通知'
      ),
      头像: s(
        'isAvatar',
        '展示头像',
        '退群通知同时展示退群群员的头像'
      ),
      修改权限: sPRO('修改', '0110', undefined, [2, 3, 4, 5])
    }
  }
}

/** #UC设置信息 */
export default { config, GAconfig }