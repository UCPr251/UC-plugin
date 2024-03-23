# [UC插件](https://gitee.com/UCPr251/UC-plugin)更新日志

## 2024年

### 3月


**ver 2.6.0**

当前为dev测试版本，请以实际内容为准

改动：

- 删除多余依赖
- 修改部分文字描述
- 删除对`icqq segement`的引入，使用全局`segment`
- 删除[放大图片](./apps/bigjpg.js)`默认放大倍数`和`默认降噪系数`，当选择错误时进行重新选择

修复：

- 修复[水群统计](./apps/sqtj.js)不统计表情包
- 修复[#UC全部更新](./apps/update.js)更新UC后，如果UC依赖变动则自动安装依赖失效
- 修复[代发言](./apps/Event/Represent.js)使用全角符号做代指令前缀时可能的无效触发

优化：

- 优化底层组件
- 优化模块结构
- 优化部分细节
- 优化[帮助图](./system/help.js)模块，简化帮助图展示内容，可查看帮助图指定大类内容，支持模糊索引
- 优化[设置图](./system/cfg.js)展示，仅以全局设置为准的设置不再于群设置中展示
- 优化[群内排队](./apps/queueUp.js)，支持退出排队 `#取消排队` `@XXX #取消排队`
- 优化[otherSet](./apps/otherSet.js)，优化实现，支持白名单用户，支持开关接收频道信息
- 优化[戳一戳](./apps/chuoyichuo.js)，改走普通事件触发路线避免被奇怪的插件拦截，增加表情包合成、禁言回复多样性等
- 优化[锅巴配置](./guoba.support.js)，更加美观、人性化，优化修改逻辑
- 优化[代发言](./apps/Event/Represent.js)，群主人不得代机器人主人或UC全局主人发言，避免未知后果
- 优化[离线备份还原](./tools/BackupRestore.js)展示效果
- 适配trss崽[转发消息制作和发送消息](./components/common.js)
- 优化[水群统计](./apps/sqtj.js)图片展示效果，支持自行管理水群统计背景
- 优化上下文序号选择逻辑，支持发送`all`便捷全部选中

新增：

- 新增[AI语音合成](./apps/genshinvoice.js)，可合成原神、星铁角色语音，见`#UC语音列表`，由于调用他人网站实现，请悠着点用……
- 新增[戳一戳](./apps/chuoyichuo.js)ai文本转语音，回复文本（连续汉字数>=3）时，指定概率将文本转为语音发送
- 新增[戳一戳管理系统](./apps/chuoyichuoM.js)，可指令上传、查看、删除戳一戳文本和图片，可指令新建、删除图包
- 新增[活动截止通知](./apps/ActReminder.js)，当原神或星铁活动即将截止时，自动于群内提醒
- 新增[艾特主人回复](./apps/atMaster.js)，可自定义他人艾特主人时机器人的反应
- 新增[戳主人回复](./apps/chuoMaster.js)，可自定义他人戳主人时机器人的反应
- 新增**全局开关响应前缀**开关，不是“仅前缀”而是使BotName+指令也能正常触发，用于避免在多机器人的群内只想要操作某一机器人时“一呼百应”
<!-- - 新增[搜索聊天记录](./apps/Event/groupAdmin/searchChatHistory.js)，可搜索群聊消息发送记录，配合水群统计的本地聊天数据，可无限制搜索文字消息 ~~（tx自身的消息搜索仅本地）~~ -->

#### 3-16

**ver 2.5.2**

- 临时提交，修复由于底层改动导致的部分错误
- **某人我奉劝你善良，优化就优化不要乱改参数乱删东西，这是喵崽不是trss，要改去改你自己的随便乱改，底层改动牵一发而动全身，因为底层改动而导致报错已经好多次了，你优化你的不要影响其他的！**

#### 3-10

- 修改群员增减通知部分描述
- 修复个别情况下载入[index.js](./index.js)挂载全局`log`报错

#### 3-7

**ver 2.5.1**

- 修复[入群申请私聊引用处理](./apps/Event/groupAdmin/RequestAdd.js)无法找到申请
- 修改[入群申请](./apps/Event/groupAdmin/RequestAdd.js)等通知文本
- 修复[戳一戳禁言](./apps/chuoyichuo.js)时间错误
- 修复[水群统计](./apps/sqtj.js)自动推送发送消息错误
- 将[戳一戳回复](./apps/chuoyichuo.js)的文本内容保存在单独的文件置于[UC-plugin/resources/data/chuoyichuo.txt](./resources/data/chuoyichuo.txt)，避免自行增删时导致更新冲突
- 增加[戳一戳回复](./apps/chuoyichuo.js)CD限制，[避免大幅刷屏](https://gitee.com/UCPr251/UC-plugin/issues/I96GQ6)
- [伪装群员](./apps/camouflage.js)如果bot是群主会同时同步头衔

#### 3-6

- 修复[file](./components/file.js)函数错误调用
- 修复[开关Bot下线响应指令](./models/UCEvent.js)检测权限报错
- 修改[开关Bot下线响应指令](./models/UCEvent.js)指令检测部分提前，权限检测部分延后，避免每次都检测权限
- 补充权限判断时对是否回复的判断
- 修复自动更新资源cron表达式错误

#### 3-5

**ver 2.5.0**

- 该版本群管部分尚未完全测试完毕，不保熟

改动：

- 修改拼写错误
- 进一步开放热更新
- 删除群配置文件中无效部分（始终以全局设置为准的部分设置）
- 修改[戳一戳](./apps/chuoyichuo.js)被戳修改群名片中的昵称取当前所选图包名称
- 修改[锅巴定义函数](./guoba.support.js#L19)与[设置图定义函数](./system/cfg.js#L6)一致，便于同步cv
- 修改[帮助图](./system/help.js)部分展示
- 若干修改

修复：

- 修复[戳一戳](./apps/chuoyichuo.js)禁言无效

优化：

- 优化服务连接等
- 优化[权限系统](./models/Permission.js)，引入`target目标对象`，便于进行三方权限比较
- 优化[锁定功能](./apps/Event/Lockdown.js)，支持模糊查找
- 优化[事件注册、处理流程](./models/UCEvent.js)，删除单独的`message.all`事件类，将`message.all`事件同时注册在`message.group`和`message.private`中，使每个事件类互相独立，避免干扰`hook`、`accept`方法的优先响应权

新增：

- 新增[伪装群员](./apps/camouflage.js)娱乐功能
- 新增[JS插件管理系统·JSsystem](./apps/JSsystem.js)，用于管理`example`中的JS插件
- 新增[群管·查询群员信息](./apps/Event/groupAdmin/memberInfo.js) `@XXX #让我康康` 查看群u发育状况
- 新增[群管·刷屏检测处理](./apps/Event/groupAdmin/floodScreen.js)
- 新增[群管·入群申请处理](./apps/Event/groupAdmin/RequestAdd.js)
- 新增[群管·群员增加处理](./apps/Event/groupAdmin/Increase.js)
- 新增[群管·群员减少处理](./apps/Event/groupAdmin/Decrease.js)

#### 3-2

**ver 2.4.6**

- 修复[水群统计](./apps/sqtj.js)自动推送报错

### 2月

#### 2-28

**ver 2.4.5**

- 修复[放大图片](./apps/bigjpg.js)无法选择2倍放大
- 修复[锁定功能](./apps/Event/Lockdown.js)在功能加载完成前进行锁定导致遗漏
- 修复[直播推送](./apps/BlivePush.js)无法艾特全员
- 优化[直播推送](./apps/BlivePush.js)，艾特全员改为可针对单独的主播设置也可直接全部开启
- 优化[删除随机老婆](./apps/randomWife.js)函数调用，改为共享方法
- 修改部分插件，不再于启动时自动检查、新建数据文件，仅在第一次使用时创建

#### 2-28

**ver 2.4.4**

- 修复[#UC安装js](./apps/addJS.js)错误代码报错
- 修复指令对[UC群管设置](./defSet/GAconfig.yaml)`plainObject`类的修改无效的问题
- 新增[UCGAPlugin类](./models/UCGAPlugin.js)，专用于UC群管
- 新增群管设置[仅响应UC前缀](./defSet/GAconfig.yaml)，开启后UC群管强制加上UC前缀才响应，用于冲突时开启
- 优化底层若干小修改

#### 2-27

**ver 2.4.3**

- 优化[UCPlugin类对上下文的构建与获取](./models/UCPlugin.js#L163)
- 优化[随机老婆删除等逻辑](./apps/randomWife.js#L146)，避免多人同时操作可能导致的错误删除
- 删除[config默认年份、自动年份](./defSet/config.yaml)，同步删除设置图、锅巴，后续直接采用当前年份作为默认年份
- 增加[群设置图](./resources/html/cfg/cfg.html#L13)标识，在当前群未曾生成过单独的群设置文件，自动采用默认全局设置作为`群设置`图片数据的来源时，在图片标题处标记`星号*`
- 统一一下各插件的风格

#### 2-26

**ver 2.4.2**

- 优化[对监听事件的处理](./models/UCEvent.js#L172)
- 优化[备份&还原](./apps/BackupRestore.js#L199)对报错的处理，自动备份报错会通知主人
- 修复[开发者模式](./apps/reloadJSs.js#L71)下[Event](./apps/Event/)插件数据统计错误的情况
- 针对icqq有时进退群监听会重复的现象对[进退群通知](./apps/Event/groupAdmin/WM.js#L7)加个1小时的CD

#### 2-24

**ver 2.4.1**

- 修改[Path](./components/Path.js)，可在非云崽环境中作为单独的工具使用
- 新增[备份&还原交互版](./tools/BackupRestore.js)，可直接在 **UC工具tools目录内** `node BackupRestore.js`运行进行备份和还原，无需先运行云崽
- 将[备份&还原交互版](./tools/BackupRestore.js)和[图包重命名](./tools/renamePictures.js)移动至`tools`内
  新增相应bat启动脚本，便于Windows用户使用。如有问题可进入[tools](./tools/)目录直接使用`node`运行源文件
- 修改[README](./README.md)描述
- 新增[每日自动备份](./apps/BackupRestore.js)，可每日零点自动备份一次，建议#UC备份数据 测试后再决定是否开启

#### 2-23

**ver 2.4.0**

- 鉴于UC功能的增多，创建交流群：866527417，欢迎加入

**修改**

- 被锅巴提前载入guoba.support.js导致循环依赖报错折磨的一天
- 修改部分底层逻辑，对大部分功能进行了一次测试检查，优化了部分体验
- 修改[群管功能](./apps/Event/groupAdmin/)指令响应，必须带上前缀 `#` 避免误触发
- 修改[随机老婆](./apps/randomWife.js)和[戳一戳](./apps/chuoyichuo.js)图片资源位置
- 修改[执行指令](./apps/run.js)执行命令为异步避免阻挡其他任务

**修复**

- 修复使用锅巴修改全局主人、全局管理员、全局黑名单时的错误排序
- 修复[入群欢迎、退群通知](./apps/Event/groupAdmin/WM.js)修改回复时引用可能导致的报错`bad file param: undefined`
- 修复[安装js](./apps/addJS.js)错误安装至UC插件内
- 修复[设置CD](./apps/groupSet.js)无法设置为0
- 修复[开关自动好友申请](./apps/otherSet.js)无效
- 修复[删除私聊字符串](./apps/otherSet.js)不回复等问题

**优化**

- 优化[设置图](./system/cfg.js)展示效果
- 优化[日志](./components/log.js)逻辑和效果
- 优化[入群欢迎、退群通知](./apps/Event/groupAdmin/WM.js)支持消息类型，支持`face`和`sface`
- 优化[签名重启](./apps/qsignRestart.js)，通过代理`logger.error`对报错信息进行检查，不再修改`e.reply`

**新增**

- 新增[内定老婆](./apps/randomWife.js)`#内定老婆XXX` `#取消内定老婆`
- 新增[戳一戳图包切换](./apps/chuoyichuo.js)图包`#UC切换戳一戳图包` `#UC设置戳一戳图包`
- 新增[搜索js](./apps/addJS.js)`#UC搜索js`功能，可根据关键词搜索`example`目录下所有js文件
- 新增[删除js](./apps/addJS.js)`#UC删除js`功能，支持自动搜索
- 新增[代发言](./apps/Event/Represent.js)`@XXX#UC代 XXX`，以他人身份执行命令
- 新增[备份、还原](./apps/BackupRestore.js)`#UC备份数据` `#UC还原备份` `#UC删除备份`

#### 2-17

**ver 2.3.10**

- 调整[随机老婆](./apps/randomWife.js)监听消息类型，查看随机老婆列表、加删等操作可于私聊操作
- 根据`e.sub_type`校正UC插件类戳一戳时的`this.userId`指向对象
- 细节修改

#### 2-15

- 修复[otherSet](./apps/otherSet.js)只发指令不发q号或群号时没有有效参数导致的报错

#### 2-14

**ver 2.3.9**

- 优化[修改设置](./apps/Admin.js)后对设置图的展示，只展示修改的一组减少渲染压力
- 修改[警告日志](./components/log.js)对于错误对象的展示能力

#### 2-13

- 修改部分描述
- 默认自动年份补全
- 补充[设置图](./system/cfg.js)、[锅巴](./guoba.support.js)展示内容

#### 2-12

**ver 2.3.8**

- 修复[签名自动重启](./apps/qsignRestart.js)执行签名重启失败后可能导致签名重启失效的问题
- 修改部分函数，更新依赖

#### 2-9

**ver 2.3.7**

- 处理Event类`上下文hook`时data丢失的情景，自动结束hook
- 修复Event类`上下文hook`超时导致的数据异常问题
- 修改[UCPr](./components/UCPr.js)`package.json`数据为仅启动时读取一次

#### 2-7

- 更新资源、部分小细节修改

#### 2-4

**ver 2.3.6**

- 同步签名异常检测对e.reply的替换，使其和本体一致

### 1月

#### 1-16

**ver 2.3.5**

- 新增`#清理签名日志`，可在锅巴中开启每日自动清理（重启生效）
- 更新依赖项

- 修改一下model目录名→models :innocent:

#### 1-2

**ver 2.3.4**

- 修复上下文hook取消未正确移除hook队列
- 调整转发消息消息上线

## 2023年

### 12月

#### 12-29

**ver 2.3.3**

- 浅浅加个运行指令的功能用
- 修复`#UC全部更新`不会更新云崽本体的遗漏
- 修复指令调整`#UC设置`的`select`类无效的问题

#### 12-27

**ver 2.3.2**

- 调整[UCPr](./components/UCPr.js)结构
- 若干调整
- 优化[log](./components/log.js)错误日志获取函数栈函数
- 修复非开发模式下不载入Event插件[Lockdown](./apps/Event/Lockdown.js)的问题
- 优化Event插件上下文hook处理

#### 12-26

**ver 2.3.1**

- fix`#UC群管设置`基础设置数据错误
- 调整[UCPr](./components/UCPr.js)结构
- **入群欢迎、退群通知** 增加禁言状态判断

#### 12-25

**ver 2.3.0**

- 新增[noticeSet](./apps/noticeSet.js)，可指令修改`notice.yaml`中的内容
- [直播推送](./apps/BlivePush.js)每日零点清理已退群的推送数据
- 修复群下班状态下UC群管仍响应
- [群配置](./config/groupCfg/)不再展示uc底层设置（此部分设置仅以全局为准）
- 原`configSet`重命名为`otherSet`，将按照本体config内文件对应名称命名
- 新增[groupSet](./apps/groupSet.js)，可指令修改`group.yaml`中的内容
- 新增[锁定功能](./apps/Event/Lockdown.js)，可锁定功能全局禁用

#### 12-22

**ver 2.2.1**

- 修复命令执行标准输出格式化

#### 12-21

- [UC一键卸载](./apps/run.js) `#UC一键卸载`

#### 12-20

**ver 2.2.0**

- 修改一下目录结构，[app/Event](./apps/Event/)，群管移动至[app/Event/groupAdmin](./apps/Event/groupAdmin/)
- 分离`UC设置`和`UC群管设置`，uc帮助的群管部分目前并不多，暂时不打算分离
- 完善[重载插件](./apps/reloadJSs.js)
- 可选隐藏[签名自动重启](./apps/qsignRestart.js)重启的签名窗口
- [前台重启](./apps/restart.js)可前台重启机器人 `#UC重启`

#### 12-18

**ver 2.1.6**

- 新增[入群欢迎、退群通知](./apps/groupAdmin/WM.js)
- 对[水群统计](./apps/sqtj.js)获取状态异常的群聊数据时进行异常处理
- 对[水群统计](./apps/sqtj.js)水群推送进行异步优化
- 修复[水群统计](./apps/sqtj.js)深海乌贼无头像bug等

#### 12-17

**ver 2.1.5**

- 支持批量全局加减主人、管理、拉黑。支持 `#UC拉黑` `#UC解黑` 指令
- 重构[水群统计](./apps/sqtj.js)，记录可保存本地，支持指定日期分析，支持推送

#### 12-14

**ver 2.1.3**

- [获取群信息](./apps/groupInfo.js)移动至 **UC群管** 类
- 继续完善[UCEvent](./model/UCEvent.js)对事件监听的处理
- 修复指令设置群权限bug
- 优化[开关Bot响应前缀、艾特](./model/UCEvent.js)

**ver 2.1.4**

- 调整一下`定时任务`的载入
- 戏天插件不太灵了，自己写个安装example插件的功能，同步到[安装JS](./apps/addJS.js)`#UC安装插件`安装UC插件，`#UC安装JS`安装云崽js
- 新增[水群统计](./apps/sqtj.js)`#今/昨日水群统计`，由原版千羽水群统计改造而成

#### 12-13

**ver 2.1.2**

- [开关Bot](./apps/switchBot.js)增加固定开关指令 **#UC上线** **#UC下线**
- 新增[获取群信息](./apps/groupInfo.js)插件，可获取 **群列表** 和 **群信息**，`#获取群列表`，`#获取群信息`

#### 12-12

**ver 2.1.1**

- 修复[Admin](./apps/Admin.js)对指定群主人、管理、黑名单加减错误
- 同步群管 **撤回、禁言、踢人** 的帮助、设置图以及锅巴配置
- 修复锅巴修改设置时控制台错误的警告信息
- 修复锅巴修改设置时对权限设置的错误修改

- 修复 **#禁言** 与 **#禁言信息** 正则匹配冲突
- **#UC更新** 同时安装UC插件依赖
- 优化UC群管 **撤回、禁言、踢人** 的消息拦截
- 适配[重载插件](./apps/reloadJSs.js)对 **UC群管** 的支持
- 删除 **全局仅主人可操作** 时的回复，同步修改锅巴、设置等
- 适配[开关Bot](./apps/switchBot.js)对 **UC群管** 的支持
- 调整[开关Bot](./apps/switchBot.js)响应前缀、艾特，与[UCEVent](./model/UCEvent.js)合并
- 调整 **UC群管** 指令，指令可选前缀 **UC**

#### 12-11

**ver 2.1.0**

- 修改[log.js](./components/log.js)错误日志输出形式
- 增加[UCDate.js](./components/UCDate.js)、[common.js](./components/common.js)等文件的内置函数，适配群管
- 完善[UCEvent](./model/UCEvent.js)监听事件插件类
- 完善监听逻辑
- 若干修改
- 新增[群管·撤回](./apps/groupAdmin/recall.js)`#撤回`，`#清屏`
- 新增[群管·禁言](./apps/groupAdmin/mute.js)`#禁言`，`#解禁`，`#全体禁言`，`#全体解禁`，`#全部解禁`，`#禁言信息`
- 新增[群管·踢人](./apps/groupAdmin/kick.js)`#踢`，`#踢黑名单`，`#全局踢黑名单`

#### 12-6

**ver 2.0.1**

- 新增[UCEvent](./model/UCEvent.js)，为**UC群管**完成最后的准备

- 修改[群开关Bot](./apps/switchBot.js)，不再修改本地群配置文件，直接修改内存中的群配置数据以达到相同效果

- 个人对**UC群管**发展方向的规划

  > **UC群管**不可避免会和椰奶插件群管功能有一定重叠，但侧重点会有所不同。**UC群管**侧重于权限的灵活分配，既可以针对群也可以针对人设置不同的权限策略，这是UC插件自创作前就构思好的想法，UC插件也一直是这样发展的。即将实装的**UC群管**也会继续朝着这个方向发展，**UC群管**并不会为了成为椰奶插件群管功能的平替而去做一些重复性劳动，而是会发展成类似于互补的关系，会拥有自身的优势区间与特性。椰奶群管功能完善成熟但权限系统仅仅依赖于底层最基础的逻辑，对于一般人而言足够了，但我需要UC插件这种可以单独群配置单独人配置的权限系统，UC插件应运而生，而**UC群管**也会在这方面继续发挥优势。

  > 其实我是想直接改喵崽底层的，但是这样维护成本太高了每次喵崽更新我还得一起更新还得考虑各种适配问题，耗不起。

#### 12-4

**ver 2.0.0**

UC插件自本次更新起全面升级权限管理系统，主人、管理、黑名单皆分全局与指定群，为**UC群管**做准备

- 全局主人与群主人：

> - **全局主人**：仅可由**全局主人**添加。权限等级 **4** 。可修改 **全局设置**（修改设置、锁定设置、加减主人、加减管理、加减黑名单）
> - **群主人**：仅可由**全局主人**添加。权限等级 **3** 。可修改 **指定群设置**（修改群设置、加减群管理、加减群黑名单）

> - **权限范围**：指定群主人仅在**指定的群内**为主人

- 全局管理与群管理：

> - **全局管理**：仅可由**全局主人**添加。权限等级 **2** 。
> - **群管理**：可由**全局主人、群主人**添加。权限等级 **1** 。

> - **权限范围**：指定群管理仅在**指定的群内**为管理

- 全局黑名单与群黑名单：

> - **全局黑名单**：可由**全局主人、全局管理**添加。权限等级 **-2**
> - **群黑名单**：可由**全局主人、群主人、全局管理、群管理**添加。权限等级 **-1**

> - **权限范围**：指定群黑名单仅在**指定的群内**为黑名单

- [安装插件](./apps/addJS.js)支持热载入

### 11月

#### 11-26

- 修改[锅巴支持](./guoba.support.js)逻辑，为[UC群管](./apps/groupAdmin/)做准备
- 修改[Admin](./apps/Admin.js)`#UC设置`，为[UC群管](./apps/groupAdmin/)做准备
- 帮助图、设置图logo处同时显示当前时间

#### 11-24

**ver 1.0.0**

- 完善[#UC帮助](./model/Help.js)和[#UC设置](./model/Cfg.js)
- 若干修改
- UC插件正式版竣工

#### 11-19

- 删除[自动删除UC旧版插件](./index.js)部分

#### 11-13

- 完善日志的创建与获取统一

#### 11-12

- 完善[UC插件热更新](./apps/reloadApps.js)实现，帮助开发

#### 11-10

- 修改app导出方式，兼容原方式，后续会支持多个导出
- 修改插件init
- 新增[log](./components/log.js)`debug`方法

#### 11-8

- 进一步升级对压缩文件的支持
- 更新多个方法

#### 11-7

- 新增对压缩文件的支持
- 增加[file.js]、[Data.js]和[common.js]函数
- 优化一些插件

#### 11-4

- 修改[随机群友](./apps/randomMember.js)指令、回复双重自定义，热更新无需重启，可锅巴配置

#### 11-3

- 适配[随机群友](./apps/randommember.js)`#随机群友`，可随机挑选一名群友，支持锅巴配置

#### 11-2

- 更新[签名自动重启](./apps/qsignRestart.js)，支持崩溃和异常双重检测。崩溃即签名自动关闭，异常包括签名关闭和无法发挥作用，可在锅巴选择性开启，都开效果最佳。指令`#签名重启记录`可查看今日签名重启记录。

### 10月

#### 10-29

- 适配[vitsAI](./apps/vitsAI.js)`AI语音合成`

#### 10-28

- 写一个[签名崩溃自动重启](./apps/qsignRestart.js)，emmm

#### 10-24

- 适配[randomWife](./apps/randomWife.js)`随机二次元老婆`插件，附带老婆图库资源，支持锅巴
- 优化[锅巴支持](./guoba.support.js)
- 优化[bigjpg](./apps/bigjpg.js)，可放大`file`图片

#### 10-23

- 适配[chuoyichuo](./apps/chuoyichuo.js)`戳一戳回复`插件，支持锅巴

#### 10-22

- 适配[switchBot](./apps/switchBot.js)`群内开关Bot`，支持锅巴
- 优化[锅巴支持](./guoba.support.js)

#### 10-20

- 修改授权目录结构
- 新增[loveMys](./apps/loveMys.js)`过码剩余次数自动查询`，每日零点自动查询，可用于统计当日token消耗
- 新增[loveMys](./apps/loveMys.js)`过码次数预警提醒`，零点自动查询时，若剩余次数低于该值则自动提醒主人，0则不提醒
- 升级[锅巴配置](./guoba.support.js)
- 适配[bigjpg](./apps/bigjpg.js)锅巴配置
- 基本完善[Permission.js](./components/Permission.js)权限判断
- 修改[loveMys](./apps/loveMys.js)注入tk后`自动查询剩余次数`并返回
- 更新[README.md](./README.md)，完善部分说明

#### 10-19

- 新增[Admin](./apps/Admin.js)，系统管理，初步完善
- 支持[锅巴配置](./guoba.support.js)
- 适配[BlivePush](./apps/BlivePush.js)，支持锅巴
- 新增[queueUp](./apps/queueUp.js)，可用与群内排队
- 新增[loveMys](./apps/loveMys.js)`更新过码插件`功能
- 适配[bigjpg](./apps/bigjpg.js)

#### 10-16

- 新增[loveMys](./apps/loveMys.js)，指令管理该插件token、api等

#### 10-13

- 新增[addJS](./apps/addJS.js)，可自动安装js至本插件
- 继续完善底层

#### 10-7

- 完善底层设计

#### 10-4

- 新建项目

---
