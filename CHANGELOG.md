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
