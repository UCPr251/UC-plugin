# 12-4

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


# 11-26

- 修改[锅巴支持](./guoba.support.js)逻辑，为[UC群管](./apps/groupAdmin/)做准备
- 修改[Admin](./apps/Admin.js)`#UC设置`，为[UC群管](./apps/groupAdmin/)做准备
- 帮助图、设置图logo处同时显示当前时间

# 11-24

- 完善[#UC帮助](./model/Help.js)和[#UC设置](./model/Cfg.js)
- 若干修改
- UC插件正式版竣工

# 11-19

- 删除[自动删除UC旧版插件](./index.js)部分

# 11-13

- 完善日志的创建与获取统一

# 11-12

- 完善[UC插件热更新](./apps/reloadApps.js)实现，帮助开发

# 11-10

- 修改app导出方式，兼容原方式，后续会支持多个导出
- 修改插件init
- 新增[log](./components/log.js)`debug`方法

# 11-8

- 进一步升级对压缩文件的支持
- 更新多个方法

# 11-7

- 新增对压缩文件的支持
- 增加[file.js]、[Data.js]和[common.js]函数
- 优化一些插件

# 11-4

- 修改[随机群友](./apps/randomMember.js)指令、回复双重自定义，热更新无需重启，可锅巴配置

# 11-3

- 适配[随机群友](./apps/randommember.js)`#随机群友`，可随机挑选一名群友，支持锅巴配置

# 11-2

- 更新[签名自动重启](./apps/qsignRestart.js)，支持崩溃和异常双重检测。崩溃即签名自动关闭，异常包括签名关闭和无法发挥作用，可在锅巴选择性开启，都开效果最佳。指令`#签名重启记录`可查看今日签名重启记录。

# 10-29

- 适配[vitsAI](./apps/vitsAI.js)`AI语音合成`

# 10-28

- 写一个[签名崩溃自动重启](./apps/qsignRestart.js)，emmm

# 10-24

- 适配[randomWife](./apps/randomWife.js)`随机二次元老婆`插件，附带老婆图库资源，支持锅巴
- 优化[锅巴支持](./guoba.support.js)
- 优化[bigjpg](./apps/bigjpg.js)，可放大`file`图片

# 10-23

- 适配[chuoyichuo](./apps/chuoyichuo.js)`戳一戳回复`插件，支持锅巴

# 10-22

- 适配[switchBot](./apps/switchBot.js)`群内开关Bot`，支持锅巴
- 优化[锅巴支持](./guoba.support.js)

# 10-20

- 修改授权目录结构
- 新增[loveMys](./apps/loveMys.js)`过码剩余次数自动查询`，每日零点自动查询，可用于统计当日token消耗
- 新增[loveMys](./apps/loveMys.js)`过码次数预警提醒`，零点自动查询时，若剩余次数低于该值则自动提醒主人，0则不提醒
- 升级[锅巴配置](./guoba.support.js)
- 适配[bigjpg](./apps/bigjpg.js)锅巴配置
- 基本完善[Permission.js](./components/Permission.js)权限判断
- 修改[loveMys](./apps/loveMys.js)注入tk后`自动查询剩余次数`并返回
- 更新[README.md](./README.md)，完善部分说明

# 10-19

- 新增[Admin](./apps/Admin.js)，系统管理，初步完善
- 支持[锅巴配置](./guoba.support.js)
- 适配[BlivePush](./apps/BlivePush.js)，支持锅巴
- 新增[queueUp](./apps/queueUp.js)，可用与群内排队
- 新增[loveMys](./apps/loveMys.js)`更新过码插件`功能
- 适配[bigjpg](./apps/bigjpg.js)

# 10-16

- 新增[loveMys](./apps/loveMys.js)，指令管理该插件token、api等

# 10-13

- 新增[addJS](./apps/addJS.js)，可自动安装js至本插件
- 继续完善底层

# 10-7

- 完善底层设计

# 10-4

- 新建项目

---
