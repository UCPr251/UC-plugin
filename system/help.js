import { UCPr, Path, Check, Data } from '../components/index.js'

const isWin = process.platform === 'win32'

/**
 * 生成帮助信息
 * @param {string} title 帮助标题
 * @param {string} desc 帮助描述
 * @param {string|number} require 使用所需权限或path
 * @param {string} swh 功能开关path
 */
function s(title, desc, require = 0, swh) {
  return {
    title,
    desc,
    require,
    swh
  }
}

const helpData = []

helpData.push({
  // 展示title
  group: 'UC系统管理（支持艾特）',
  // 所需权限等级
  require: 2,
  // 设置所属类
  cfg: 'config',
  // 折叠显示的块title + 单独触发指令 #UC${command}帮助
  command: '系统',
  // 折叠显示的块描述
  desc: 'UC插件系统帮助',
  list: [
    s(
      '#UC设置',
      '查看当前UC插件设置'
    ),
    s(
      '#UC全局设置',
      '查看当前UC插件全局设置',
      4
    ),
    s(
      '#UC群管设置',
      '查看当前UC插件群管设置'
    ),
    s(
      '#UC全局群管设置',
      '查看当前UC插件全局群管设置',
      4
    ),
    s(
      '#UC(加|删)主人',
      '加删UC指定用户指定群主人',
      4
    ),
    s(
      '#UC全局(加|删)主人',
      '加删UC全局插件主人',
      4
    ),
    s(
      '#UC(加|删)管理',
      '加删UC指定用户指定群管理',
      3
    ),
    s(
      '#UC全局(加|删)管理',
      '加删UC全局插件管理',
      4
    ),
    s(
      '#UC(拉|解)黑',
      '加删UC插件群黑名单'
    ),
    s(
      '#UC全局(拉|解)黑',
      '加删UC插件全局黑名单',
      4
    ),
    s(
      '#UC(主人|管理)列表',
      '查看UC插件群主人/管理列表',
      3
    ),
    s(
      '#UC全局(主人|管理)列表',
      '查看UC插件所有主人/管理列表',
      4
    ),
    s(
      '#UC黑名单列表',
      '查看UC插件群黑名单列表'
    ),
    s(
      '#UC全局黑名单列表',
      '查看UC插件全局黑名单列表',
      4
    ),
    s(
      '#UC查',
      '查某用户的UC权限',
      3
    ),
    s(
      '#UC(删除)?错误日志',
      '查看/删除UC错误日志',
      4
    ),
    s(
      '#UC帮助',
      '查看本插件帮助图(动态)'
    ),
    s(
      '#UC安装插件',
      '安装UC的插件',
      4
    ),
    s(
      '#UC(强制)?刷新授权',
      '更新UC授权文件和数据',
      4
    ),
    s(
      '#UC(强制)?更新',
      '(强制)?更新UC插件',
      4
    ),
    s(
      '#UC(强制)?更新资源',
      '(强制)?更新UC插件资源',
      4
    )
  ]
})

helpData.push({
  group: 'UC群管',
  require: 1,
  isOpen: (groupCFG) => groupCFG.GAconfig.isOpen,
  // 折叠显示的块title + 单独触发指令 #UC${command}帮助
  command: '群管',
  // 折叠显示的块描述
  desc: 'UC插件群管帮助',
  cfg: 'GAconfig',
  list: [
    s(
      '#清屏20',
      '清屏群聊天记录',
      'recall.use',
      'recall.isOpen'
    ),
    s(
      '#撤回5',
      '撤回群员聊天记录，可艾特或引用',
      'recall.use',
      'recall.isOpen'
    ),
    s(
      '@XXX #禁言2分钟',
      '禁言群员指定时长',
      'mute.use',
      'mute.isOpen'
    ),
    s(
      '@XXX #解禁',
      '解除指定群员禁言',
      'mute.use',
      'mute.isOpen'
    ),
    s(
      '#全体禁言/解禁',
      '开启或关闭群全体禁言',
      'mute.muteAll',
      'mute.isOpen'
    ),
    s(
      '#全部解禁',
      '解除所有正在禁言中的群员的禁言',
      'mute.use',
      'mute.isOpen'
    ),
    s(
      '#禁言信息',
      '查看本群禁言信息',
      'mute.use',
      'mute.isOpen'
    ),
    s(
      '@XXX #踢',
      '将指定群员踢出群聊',
      'kick.use',
      'kick.isOpen'
    ),
    s(
      '#踢黑名单',
      '将群黑名单用户踢出群聊',
      'kick.use',
      'kick.isOpen'
    ),
    s(
      '#全局踢黑名单',
      '踢出Bot所有群聊的黑名单用户',
      4,
      'kick.isOpen'
    ),
    s(
      '@XXX #让我康康',
      '康康群u发育正不正常'
    ),
    s(
      '#获取群列表',
      '获取Bot所在群列表',
      4
    ),
    s(
      '#获取群信息',
      '获取Bot所在群详细信息',
      4
    ),
    s(
      '#查看/修改入群欢迎',
      '查看或修改本群入群欢迎',
      'welcome.use',
      'welcome.isOpen'
    ),
    s(
      '#查看/修改退群通知',
      '查看或修改本群退群通知',
      'mourn.use',
      'mourn.isOpen'
    ),
    s(
      '#查看/修改全局入群欢迎',
      '查看或修改全局默认入群欢迎',
      4,
      'welcome.isOpen'
    ),
    s(
      '#查看/修改全局退群通知',
      '查看或修改全局默认退群通知',
      4,
      'mourn.isOpen'
    )
  ]
})

helpData.push({
  group: 'UC娱乐功能',
  require: 0,
  command: '娱乐',
  desc: 'UC-娱乐功能帮助',
  cfg: 'config',
  list: [
    s(
      `#${UCPr.randomMember.keyWords?.trim() || '随机群友'}`,
      '随机挑选一名幸运群友',
      'randomMember.use',
      'randomMember.isOpen'
    ),
    s(
      '#随机老婆',
      '每日随机二次元老婆',
      '',
      'randomWife.isOpen'
    ),
    s(
      'UC戳一戳#poke#',
      '戳一戳回复',
      '',
      'chuoyichuo.isOpen'
    ),
    s(
      '#今/昨日水群统计',
      '查看水群统计，可指定日期',
      'sqtj.use',
      'sqtj.isOpen'
    ),
    s(
      '#(结束)?伪装',
      '(结束)?伪装群员',
      'camouflage.use',
      'camouflage.isOpen'
    )
  ]
})

if (Check.file(Path.get('apps', 'chuoyichuo.js'))) {
  helpData.push({
    group: 'UC娱乐——戳一戳',
    require: 4,
    isOpen: (groupCFG) => groupCFG.config.chuoyichuo.isOpen,
    command: '戳一戳',
    desc: 'UC-戳一戳帮助',
    cfg: 'config',
    list: [
      s(
        '#查看戳一戳文本',
        '查看戳一戳回复文本'
      ),
      s(
        '#新增戳一戳文本',
        '新增戳一戳回复文本'
      ),
      s(
        '#删除戳一戳文本',
        '删除戳一戳回复文本'
      ),
      s(
        '#戳一戳图包列表',
        '查看戳一戳图包列表'
      ),
      s(
        '#创建戳一戳图包',
        '创建戳一戳图包文件夹'
      ),
      s(
        '#删除戳一戳图包',
        '删除戳一戳图包文件夹及图片'
      ),
      s(
        '#查看戳一戳图片',
        '查看当前戳一戳图包内图片'
      ),
      s(
        '#上传戳一戳图片',
        '上传图片至当前戳一戳图包内'
      ),
      s(
        '#删除戳一戳图片',
        '删除当前戳一戳图包内图片'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'randomWife.js'))) {
  helpData.push({
    group: 'UC娱乐——随机老婆',
    require: 0,
    isOpen: (groupCFG) => groupCFG.config.randomWife.isOpen,
    command: '随机老婆',
    desc: 'UC-随机老婆帮助',
    cfg: 'config',
    list: [
      s(
        '#随机老婆',
        '每日随机二次元老婆'
      ),
      s(
        '#查看随机老婆',
        '查看随机二次元老婆图片'
      ),
      s(
        '#上传随机老婆+名称',
        '新增随机老婆图片',
        'randomWife.add'
      ),
      s(
        '#删除随机老婆+名称',
        '删除指定随机老婆图片',
        'randomWife.del'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'chuoMaster.js'))) {
  helpData.push({
    group: 'UC娱乐——戳主人回复',
    require: 3,
    isOpen: (groupCFG) => groupCFG.config.chuoMaster.isOpen,
    command: '戳主人',
    desc: 'UC-戳主人回复帮助',
    cfg: 'config',
    list: [
      s(
        '#查看戳主人回复',
        '查看当前已有戳主人回复'
      ),
      s(
        '#新增戳主人回复',
        '增加新的戳主人回复'
      ),
      s(
        '#删除戳主人回复',
        '删除已添加的戳主人回复'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'atMaster.js'))) {
  helpData.push({
    group: 'UC娱乐——艾特主人回复',
    require: 3,
    isOpen: (groupCFG) => groupCFG.config.atMaster.isOpen,
    command: '艾特主人',
    desc: 'UC-艾特主人回复帮助',
    cfg: 'config',
    list: [
      s(
        '#查看艾特主人回复',
        '查看当前已有艾特主人回复'
      ),
      s(
        '#新增艾特主人回复',
        '增加新的艾特主人回复'
      ),
      s(
        '#删除艾特主人回复',
        '删除已添加的艾特主人回复'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'randomWife.js'))) {
  helpData.push({
    group: 'UC娱乐——水群统计',
    require: 0,
    isOpen: (groupCFG) => groupCFG.config.sqtj.isOpen,
    command: '水群统计',
    desc: 'UC-水群统计帮助',
    cfg: 'config',
    list: [
      s(
        '#水群统计',
        '分析今日水群统计',
        'sqtj.use'
      ),
      s(
        '#一周水群统计',
        '分析今日水群统计',
        'sqtj.use'
      ),
      s(
        '#一月水群统计',
        '分析今日水群统计',
        'sqtj.use'
      ),
      s(
        '#昨日水群统计',
        '分析昨日水群统计',
        'sqtj.use'
      ),
      s(
        '#水群统计3-19',
        '查看3-19本地水群统计',
        'sqtj.use'
      ),
      s(
        '#分析水群统计3-19',
        '分析获取3-19水群统计',
        'sqtj.use'
      ),
      s(
        '#重新分析水群统计3-19',
        '重新获取3-19水群统计',
        3
      )
    ]
  })
}

helpData.push({
  group: 'UC工具——杂项',
  require: 2,
  cfg: 'config',
  command: '工具',
  desc: 'UC-杂项工具帮助',
  list: [
    s(
      '@XXX#UC代 #XXX',
      '代发言，以他人身份处理命令',
      3
    ),
    s(
      `#${UCPr.BotName}(${UCPr.switchBot?.openReg?.trim() || '上班|工作'})`,
      '群内开启Bot',
      'switchBot.use'
    ),
    s(
      `#${UCPr.BotName}(${UCPr.switchBot?.closeReg?.trim() || '下班|休息'})`,
      '群内关闭Bot',
      'switchBot.use'
    ),
    s(
      '#UC全部(强制)?更新',
      '全部更新，但不会自动重启',
      4
    ),
    s(
      '#UC重启',
      '前台重启云崽，不转后台',
      4,
      isWin
    ),
    s(
      '#UC锁定/解锁功能',
      '锁定功能，全局禁用',
      4
    ),
    s(
      '#UC锁定功能列表',
      '锁定功能列表',
      4
    )
  ]
})

if (Check.file(Path.get('apps', 'loveMys.js'))) {
  helpData.push({
    group: 'UC工具——loveMys管理系统（此功能不再维护）',
    require: 4,
    command: 'loveMys',
    desc: 'UC-loveMys帮助',
    cfg: 'config',
    list: [
      s(
        '#UC安装loveMys',
        '安装loveMys插件'
      ),
      s(
        '#UC注入loveMysapi',
        '注入loveMys api'
      ),
      s(
        '#UC注入loveMystk',
        '注入loveMys token'
      ),
      s(
        '#UCloveMys查询',
        '查询当前token剩余次数'
      ),
      s(
        '#UC更新loveMys',
        '更新插件loveMys'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'JSsystem.js'))) {
  helpData.push({
    group: 'UC工具——JS插件管理系统',
    require: 4,
    command: 'JS',
    desc: 'UC-JS管理系统帮助',
    cfg: 'config',
    list: [
      s(
        '#安装JS',
        '发送JS插件自动安装至example'
      ),
      s(
        '#JS列表',
        '查看已安装的JS插件列表'
      ),
      s(
        '#停用JS列表',
        '查看已停用的JS插件列表'
      ),
      s(
        '#搜索JS',
        '在已安装的JS插件中搜索'
      ),
      s(
        '#查看JS',
        '查看JS插件，发送源文件'
      ),
      s(
        '#停用JS',
        '停用JS插件，可重新启用'
      ),
      s(
        '#启用JS',
        '启用被停用了的JS插件'
      ),
      s(
        '#卸载JS',
        '⚠彻底卸载JS插件⚠'
      ),
      s(
        '#重新查看JS',
        '重新查看JS插件'
      )
    ]
  })
}

if (isWin && Check.file(Path.get('apps', 'qsignRestart.js'))) {
  helpData.push({
    group: 'UC工具——签名自动重启系统',
    require: 4,
    command: '签名',
    desc: 'UC-签名重启帮助',
    cfg: 'config',
    list: [
      s(
        '#开启签名自动重启',
        '开启签名自动重启'
      ),
      s(
        '#关闭签名自动重启',
        '关闭签名自动重启'
      ),
      s(
        '#UC设置签名自动重启开启',
        '无需每次启动后手动开启签名重启'
      ),
      s(
        '#清理签名日志',
        '删除签名产生的日志文件'
      ),
      s(
        '#签名重启日志',
        '查看当日签名重启日志'
      ),
      s(
        '#重启签名',
        '指令重启签名'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'otherSet.js'))) {
  helpData.push({
    group: 'UC工具——otherSet（指令修改崽other.yaml）',
    require: 4,
    command: 'other',
    desc: 'UC-otherSet帮助',
    cfg: 'config',
    list: [
      s(
        '注：本功能可批量操作',
        '如#拉黑123456 456789……'
      ),
      s(
        '#开启/关闭自动好友申请',
        '开/关机器人QQ自动同意好友申请'
      ),
      s(
        '#设置退群人数5000',
        '设置拉群自动退出的群人数阈值'
      ),
      s(
        '#增加/删除主人123',
        '增删机器人主人(非UC主人)'
      ),
      s(
        '#拉黑/解黑123456',
        '拉/解黑名单用户'
      ),
      s(
        '#拉黑/解黑群987654',
        '拉/解黑名单群'
      ),
      s(
        '#加白/解白群987654',
        '加/解白名单群'
      ),
      s(
        '#开启/关闭私聊',
        '开关机器人允许私聊'
      ),
      s(
        '#设置禁用私聊回复',
        '机器人禁用私聊时的回复'
      ),
      s(
        '#增加/删除通行字符串',
        '增删允许的私聊通行字符串'
      ),
      s(
        '#主人/通行字符串列表',
        '主人/私聊通行字符串列表'
      ),
      s(
        '#黑/白名单(群)?列表',
        '查看黑白名单用户或群列表'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'groupSet.js'))) {
  helpData.push({
    group: 'UC工具——groupSet（指令修改崽group.yaml）',
    require: 3,
    command: 'group',
    desc: 'UC-groupSet帮助',
    cfg: 'config',
    list: [
      s(
        '注：可接群号指定群',
        '#全局+原指令 修改全局默认设置',
        4
      ),
      s(
        '#设置群CD 500',
        '设置群整体CD 单位ms'
      ),
      s(
        '#设置个人CD 500',
        '设置群个人CD 单位ms'
      ),
      s(
        '#开启(非主人)?仅艾特',
        '开关(非主人)?仅响应艾特'
      ),
      s(
        '#禁用/解禁功能',
        '群内禁用功能'
      ),
      s(
        '#禁用功能列表',
        '查看群禁用功能'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'noticeSet.js'))) {
  helpData.push({
    group: 'UC工具——noticeSet（指令修改崽notice.yaml）',
    require: 4,
    command: 'notice',
    desc: 'UC-noticeSet帮助',
    cfg: 'config',
    list: [
      s(
        '#设置iyuu tk',
        '填写iyuu通知token'
      ),
      s(
        '#设置sct tk',
        '填写sct通知token'
      ),
      s(
        '#查看iyuu/sct tk',
        '查看iyuu或sct通知token'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'BackupRestore.js'))) {
  helpData.push({
    group: 'UC工具——备份数据',
    require: 4,
    command: '备份',
    desc: 'UC-备份数据帮助',
    cfg: 'config',
    list: [
      s(
        '#UC备份数据',
        '备份云崽、各大型插件数据'
      ),
      s(
        '#UC还原备份',
        '还原备份的数据'
      ),
      s(
        '#UC删除备份',
        '删除备份的数据'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'accredit.js'))) {
  helpData.push({
    group: 'UC工具——授权管理',
    require: 4,
    command: '授权',
    desc: 'UC-授权帮助',
    cfg: 'config',
    list: [
      s(
        '#UC(取消)?授权0',
        '授权全局或删除所有授权'
      ),
      s(
        '#UC授权\\d+?',
        '授权用户或Bot权限'
      ),
      s(
        '#UC查授权\\d+?',
        '查看某人授权信息'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'BLivePush.js'))) {
  helpData.push({
    group: 'UC娱乐——B站直播推送',
    require: 0,
    isOpen: (groupCFG) => Data.check('BlivePush') && groupCFG.config.BlivePush.isGroup,
    command: '直播推送',
    desc: 'UC-直播推送帮助',
    cfg: 'config',
    list: [
      s(
        '注：可接群号指定群',
        '如#直播推送列表987654321',
        4
      ),
      s(
        '#直播推送帮助',
        '文字版完整帮助叙述'
      ),
      s(
        '#查询up123456',
        '查询某up的数据信息'
      ),
      s(
        '#订阅直播',
        '订阅B站直播间开播推送',
        'BlivePush.use'
      ),
      s(
        '#直播推送列表',
        '查看当前直播推送订阅信息'
      ),
      s(
        '#谁正在直播',
        '查看订阅列表中谁正在直播'
      ),
      s(
        '#开启/关闭直播推送',
        '开关当前或指定位置直播推送',
        'BlivePush.use'
      ),
      s(
        '#开启/关闭直播推送(全部)?艾特全员',
        '推送是否艾特全员(全部/指定主播)',
        'BlivePush.use'
      ),
      s(
        '#清空直播推送缓存',
        '故障用，删除直播推送全部缓存',
        4
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'queueUp.js'))) {
  helpData.push({
    group: 'UC工具——群内排队',
    require: 1,
    command: '排队',
    desc: 'UC-群内排队帮助',
    cfg: 'config',
    list: [
      s(
        '#创建排队',
        '初始化或重置群内排队任务'
      ),
      s(
        '#(取消)?排队',
        '群员参与或退出排队，主人可艾特'
      ),
      s(
        '@XXX #完成',
        '完成某人排队，添加至已完成'
      ),
      s(
        '#队列',
        '查看当前待处理队列'
      ),
      s(
        '#排队信息',
        '查看当前排队详细信息'
      ),
      s(
        '#开始/结束排队',
        '开关#排队，不会删除排队信息'
      )
    ]
  })
}

if (Check.file(Path.get('apps', 'bigjpg.js')) && Data.check('bigjpg')) {
  helpData.find(v => v.group === 'UC娱乐功能').list.push(
    s(
      '#放大图片',
      'AI无损放大图片',
      'bigjpg.use',
      'bigjpg.isOpen'
    )
  )
}

// if (Check.file(Path.get('apps', ''))) {
//   helpCfg.push()
// }

export default helpData