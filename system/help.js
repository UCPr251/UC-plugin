import { UCPr, Path, Check, Data } from '../components/index.js'

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
  group: 'UC系统管理(支持艾特)',
  require: 2,
  cfg: 'config',
  list: [
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
      '#UC(加|删)黑名单',
      '加删UC插件群黑名单'
    ),
    s(
      '#UC全局(加|删)黑名单',
      '加删UC插件全局黑名单',
      4
    ),
    s(
      '#UC(主人|管理)列表',
      '查看UC插件群主人/管理',
      3
    ),
    s(
      '#UC全局(主人|管理)列表',
      '查看UC插件所有主人/管理',
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
      '查某用户的插件权限',
      3
    ),
    s(
      '#UC(删除)?错误日志',
      '查看/删除UC错误日志',
      4
    ),
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
      '#UC帮助',
      '查看本插件帮助图(动态)'
    ),
    s(
      '#UC安装插件',
      '安装UC插件',
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
    )
  ]
})

helpData.push({
  group: 'UC群管',
  require: 1,
  isOpen: (groupCFG) => groupCFG.GAconfig.isOpen,
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
      '#获取群列表',
      '获取Bot所在群列表',
      4
    ),
    s(
      '#获取群信息',
      '获取Bot所在群详细信息',
      4
    )
  ]
})

helpData.push({
  group: 'UC娱乐功能',
  require: 0,
  cfg: 'config',
  list: [
    s(
      `#${UCPr.randomMember?.keyWords?.trim() || '随机群友'}`,
      '随机挑选一名幸运群友',
      'randomMember.use',
      'randomMember.isOpen'
    ),
    s(
      '#随机老婆',
      '随机二次元老婆',
      '',
      'randomWife.isOpen'
    ),
    s(
      '#随机老婆列表',
      '随机二次元老婆列表',
      '',
      'randomWife.isOpen'
    ),
    s(
      '#上传随机老婆+名称',
      '新增随机老婆图片',
      'randomWife.add',
      'randomWife.isOpen'
    ),
    s(
      '#删除随机老婆+名称',
      '删除指定随机老婆图片',
      'randomWife.del',
      'randomWife.isOpen'
    ),
    s(
      'UC戳一戳#poke#',
      '开启功能后戳一戳生效',
      '',
      'chuoyichuo.isOpen'
    ),
    s(
      '#今/昨日水群统计',
      '查看群聊水群统计',
      'sqtj.use',
      'sqtj.isOpen'
    )
  ]
})

helpData.push({
  group: 'UC工具',
  require: 2,
  cfg: 'config',
  list: [
    s(
      '#开启/关闭签名自动重启',
      '开启/关闭签名自动重启',
      4
    ),
    s(
      '#签名重启日志',
      '查看当日签名重启日志',
      4
    ),
    s(
      '#UC安装过码',
      '安装过验证码插件loveMys',
      4
    ),
    s(
      '#UC注入过码tk',
      '注入loveMys过码token',
      4
    ),
    s(
      '#UC验证码查询',
      '查询当前token剩余次数',
      4
    ),
    s(
      '#UC更新过码',
      '更新过码插件loveMys',
      4
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
    )
  ]
})

if (Check.file(Path.get('apps', 'queueUp.js'))) {
  helpData.push({
    group: 'UC工具——群内排队',
    require: 1,
    cfg: 'config',
    list: [
      s(
        '#创建排队',
        '初始化群内排队任务'
      ),
      s(
        '#排队',
        '群员参与排队，添加至待处理'
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

helpData.push({
  group: 'UC工具——configSet',
  require: 4,
  cfg: 'config',
  list: [
    s(
      '#config帮助',
      '原文字版configSet帮助'
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

if (Check.file(Path.get('apps', 'accredit.js'))) {
  helpData.push({
    group: 'UC授权管理',
    require: 4,
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
    group: 'UC直播推送',
    require: 0,
    cfg: 'config',
    isOpen: (groupCFG) => Data.check('BlivePush') && groupCFG.config.BlivePush.isGroup,
    list: [
      s(
        '注：',
        '后接群号可指定操作某一个群',
        4
      ),
      s(
        '#直播推送帮助',
        '原文字版完整叙述'
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
        '开关当前或指定位置直播推送'
      ),
      s(
        '#开启/关闭直播推送艾特全员',
        '推送时是否艾特全员(群聊)',
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

if (Check.file(Path.get('apps', 'bigjpg.js')) && Data.check('bigjpg')) {
  helpData[2].list.push(
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