
## 已实现功能

| UC系统 | UC群管 | UC工具 | UC 娱乐 |
| :---: | :---: | :---: | :---: |
| [权限管理] | [禁言] | [签名重启] | [戳一戳回复] |
| [帮助图] | [踢人] | [群内上下班] | [戳主人回复] |
| [设置图] | [撤回] | [锁定功能] | [戳一戳管理] |
| [热更新] | [入群欢迎] | [代发言] | [艾特主人回复] |
| [查询权限] | [退群通知] | [JS管理系统] | [随机群友] |
| [锁定设置] | [退群处理] | [备份还原数据] | [随机老婆] |
| [锅巴支持] | [刷屏检测] | [活动截止提醒] | [伪装] |
| [错误日志] | [入群申请处理] | [群内排队] | [水群统计] |
| [指令更新] | [查看群员信息] | [前台重启] | [语音合成] |
| [一键卸载] | [设置头衔] (开发中) | [执行指令] | [放大图片] |
|  | [搜索聊天记录] (开发中) | [指令修改group.yaml] | [直播推送] |
|  |  | [指令修改notice.yaml] | [复读打断] (开发中) |
|  |  | [指令修改other.yaml] |  |
|  |  | [不重启更新插件] |  |
|  |  | [loveMys辅助] |  |
|  |  | [icqq双向迁移] |  |

- 仅为UC已实现功能，使用请以实际为准

## 2.5

- [JS插件管理系统·JSsystem](./apps/JSsystem.js) `#安装JS` `#搜索JS` `#JS列表` `#停用JS列表` `#停用JS` `#启用JS` `#搜索JS` `#查看JS` `#卸载JS` `#重新查看JS`
- [伪装群员](./apps/camouflage.js)`@XXX#伪装` `#取消伪装`
- [群管·查询群员信息](./apps/Event/groupAdmin/memberInfo.js) `@XXX #让我康康`
- [群管·入群申请处理](./apps/Event/groupAdmin/RequestAdd.js)
- [群管·刷屏检测处理](./apps/Event/groupAdmin/floodScreen.js)
- [群管·群员增加处理](./apps/Event/groupAdmin/Increase.js)
- [群管·群员减少处理](./apps/Event/groupAdmin/Decrease.js)

## 2.4

- [内定老婆](./apps/randomWife.js)`#内定老婆XXX` `#取消内定老婆`
- [戳一戳图包切换](./apps/chuoyichuo.js)图包`#UC切换戳一戳图包` `#UC设置戳一戳图包`
- [代发言](./apps/Event/Represent.js) `@XXX#代 XXX` `#代123456789 XXX`
- [搜索、卸载js](./apps/addJS.js) `#UC搜索js XXX` `#UC卸载jsXXX`
- [备份、还原](./apps/BackupRestore.js)`#UC备份数据` `#UC还原备份` `#UC删除备份`

## 2.3

- [noticeSet](./apps/noticeSet.js) `#注入iyuu tk` `#注入sct tk`
- [groupSet](./apps/groupSet.js) `#全局设置群CD500` `#设置群CD500` `#全局设置个人CD500` `#设置个人CD500` `#开启仅艾特` `#全局关闭仅艾特` `#全局禁用功能` `#全局禁用功能 添加表情` `#全局解禁功能` `#全局解禁功能 添加表情`

## 2.2

- [入群欢迎、退群通知](./apps/Event/groupAdmin/WM.js) `#UC修改入群欢迎` `#UC修改退群通知`
- [前台重启](./apps/restart.js) `#UC重启`
- [更新不自动重启](./apps/update.js) `#UC更新喵喵` `#UC全部更新`

## 2.1

- [群管·撤回](./apps/Event/groupAdmin/recall.js) `#撤回` `#清屏`
- [群管·禁言](./apps/Event/groupAdmin/mute.js) `#禁言` `#解禁` `#全体禁言` `#全体解禁` `#全部解禁` `#禁言信息`
- [群管·踢人](./apps/Event/groupAdmin/kick.js) `#踢` `#踢黑名单` `#全局踢黑名单`
- [水群统计](./apps/sqtj.js) `#水群统计` `#昨日水群统计` `#分析23-12-17水群统计`
- [获取群信息](./apps/Event/groupAdmin/groupInfo.js) `#获取群列表` `#获取群信息`

## 2.0

- 新版**权限管理系统**，**主人、管理、黑名单**皆可配置**全局**或**指定群**
- 功能配置可单独配置群

## 功能

### 系统管理

- [系统授权管理·accredit](./apps/accredit.js)
- [系统权限管理·Admin](./apps/Admin.js)
- [安装新JS·addJS](./apps/addJS.js)
- [重载插件·reloadJSs](./apps/reloadJSs.js)
- [更新插件·update](./apps/update.js)

### 工具类

- [机器人设置管理·otherSet](./apps/otherSet.js)
- [loveMys工具·loveMys](./apps/loveMys.js)
- [签名检查重启·qsignRestart](./apps/qsignRestart.js)
- [群内排队·queueUp](./apps/queueUp.js)
- [群内开关Bot·switchBot](./apps/switchBot.js)

### 娱乐类

- [戳一戳·chuoyichuo](./apps/chuoyichuo.js)
- [放大图片·bigjpg](./apps/bigjpg.js)
- [直播推送·BlivePush](./apps/BlivePush.js)
- [随机群友·randomMember](./apps/randomMember.js)
- [随机老婆·randomWife](./apps/randomWife.js)
- [AI语音·vitsAI](./apps/vitsAI.js)


<!-- 系统 -->
[权限管理]:apps/Admin.js
[帮助图]:apps/Admin.js
[设置图]:apps/Admin.js
[热更新]:apps/reloadJSs.js
[查询权限]:apps/Admin.js
[锁定设置]:apps/Admin.js
[锅巴支持]:guoba.support.js
[错误日志]:apps/Admin.js
[指令更新]:apps/update.js
[一键卸载]:apps/run.js
<!-- 群管 -->
[禁言]:apps/Event/groupAdmin/mute.js
[踢人]:apps/Event/groupAdmin/kick.js
[撤回]:apps/Event/groupAdmin/recall.js
[入群欢迎]:apps/Event/groupAdmin/WM.js
[退群通知]:apps/Event/groupAdmin/WM.js
[退群处理]:apps/Event/groupAdmin/Decrease.js
[刷屏检测]:apps/Event/groupAdmin/floodScreen.js
[入群申请处理]:apps/Event/groupAdmin/RequestAdd.js
[查看群员信息]:apps/Event/groupAdmin/memberInfo.js
[设置头衔]:apps/Event/groupAdmin/setTitle.js
[搜索聊天记录]:apps/Event/groupAdmin/searchChatHistory.js
<!-- 工具 -->
[签名重启]:apps/qsignRestart.js
[群内上下班]:apps/switchBot.js
[锁定功能]:apps/Event/Lockdown.js
[代发言]:apps/Event/Represent.js
[JS管理系统]:apps/JSsystem.js
[备份还原数据]:apps/BackupRestore.js
[活动截止提醒]:apps/ActReminder.js
[群内排队]:apps/queueUp.js
[前台重启]:apps/restart.js
[执行指令]:apps/run.js
[指令修改group.yaml]:apps/groupSet.js
[指令修改notice.yaml]:apps/noticeSet.js
[指令修改other.yaml]:apps/otherSet.js
[不重启更新插件]:apps/update.js
[loveMys辅助]:apps/loveMys.js
[icqq双向迁移]:apps/icqq.js
<!-- 娱乐 -->
[戳一戳回复]:apps/chuoyichuo.js
[戳主人回复]:apps/chuoMaster.js
[戳一戳管理]:apps/chuoyichuoM.js
[艾特主人回复]:apps/atMaster.js
[随机群友]:apps/randomMember.js
[随机老婆]:apps/randomWife.js
[伪装]:apps/camouflage.js
[水群统计]:apps/sqtj.js
[语音合成]:apps/genshinvoice.js
[放大图片]:apps/bigjpg.js
[直播推送]:apps/BlivePush.js
[复读打断]:apps/RepeatInterruption.js
