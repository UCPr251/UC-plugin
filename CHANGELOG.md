# [UC插件](https://gitee.com/UCPr251/UC-plugin)更新日志

## 2024年

### 1月

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
