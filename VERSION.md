# [UC-plugin][UC]

## UC 功能概览

---

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

---

[UC]:https://gitee.com/UCPr251/UC-plugin
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
