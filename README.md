<div align="center">

<p align="center">
  <a href="https://mzh.moegirl.org.cn/%E4%BC%91%E6%AF%94%C2%B7%E5%A4%9A%E6%8B%89">
    <img width="400" src="./resources/img/xiubi1.jpg" title="她真好看">
  </a>
</p>

# [UC-plugin](https://gitee.com/UCPr251/UC-plugin)
(开发分支)

</div>

---

## 安装插件

云崽根目录运行

- 使用Gitee

```Bash
git clone -b dev https://gitee.com/UCPr251/UC-plugin ./plugins/UC-plugin
```

- 使用Github

```Bash
git clone -b dev https://github.com/UCPr251/UC-plugin ./plugins/UC-plugin
```

:innocent:

<div align="center">

</div>

## 插件帮助

- 详见 **#UC帮助**
- **UC帮助** 为动态帮助图，会根据当前[插件配置](#插件配置)、[用户权限](#关于插件权限)等自动调整帮助图展示项
> 比如主人未开启或触发指令的用户没有使用权限的功能，将不会在帮助图中进行展示，可在插件配置项中开关、设置功能，详见[插件配置](#插件配置)

## 插件配置

- 配置项较多，可通过 **#UC设置** 查看、更改
- 受图片展示限制，**#UC设置** 图中部分设置不会进行完整展示，建议在 **锅巴 → 插件管理 → UC-plugin → 配置** 进行配置的查看和更改

## 关于[UC-plugin](#uc-plugin测试)

- 为方便统一开发插件和其他集成功能打造而成

<details>
<summary>PS</summary>

~~给大家介绍一下，这是我老婆：~~:innocent:

<p align="center">
  <a href="https://www.bilibili.com/read/cv13428981?spm_id_from=333.999.0.0">
    <img width="400" src="./resources/img/xiubi2.jpg" title="她真好看">
  </a>
</p>

~~都 3202 年了，[游戏人生](https://www.bilibili.com/bangumi/play/ep4371?spm_id_from=333.337.0.0 "游戏人生")第 2 季啥时候才能出啊~~

</details>

## 关于插件权限

### 插件权限类别

#### 插件主人

- **插件主人**可以独立于**Bot主人**，默认合并机器人主人为插件全局主人

- **插件主人**有两类：
>  - **全局主人**：在所有群、私聊都拥有插件的主人权限，权限等级 **4** 
>  - **指定群主人**：只在指定群内拥有插件的主人权限，权限等级 **3** 

#### 插件管理

- 除**插件主人**外，还可独立设置**插件管理**，权限低于插件主人高于普通用户

- **插件管理**（以下简称**插管**）也有两类：
>  - **全局插管**：在所有群都拥有插件的管理权限，权限等级 **2** 
>  - **指定群插管**：只在指定群内拥有插件的管理权限，权限等级 **1** 

#### 插件黑名单

- 除**插件主人**和**插件管理**以外，还有**插件黑名单**，无法使用本插件功能

- **插件黑名单**也有两类：
>  - **全局黑名单**：在所有群都为插件黑名单，权限等级 **-2** 
>  - **指定群黑名单**：只在指定群内为插件黑名单，权限等级 **-1** 

### 功能权限

- 可以针对具体某个功能开关权限，包含：

   > - 是否允许**群聊**使用
   > - 是否允许**私聊**使用
   > - 是否**仅**允许**主人**使用
   > - 是否允许**插件管理**使用
   > - 是否允许**群管**使用
   > - 是否允许**任何人**使用

   此 6 个判断可针对具体某个功能生效，可在[**插件配置**](#插件配置)或[**锅巴内**](#配置插件)进行修改，判断优先级：

   - **是否主人 > 是否全局仅主人 = 是否黑名单 > 是否功能仅主人 > 是否允许群聊 = 是否允许私聊 > 是否允许任何人 > 是否允许插件管理员 = 是否允许群管理员**

   若6个条件设置中有冲突项时，将会按照此准则得出结论

<details>
<summary>权限判断代码逻辑片段</summary>

   <img src="./resources/img/README/permission.png" width = "600" title="权限判断代码逻辑片段">

</details>

### 插件权限赋予

- 全局主人与群主人：

> - **全局主人**：仅可由**全局主人**添加。可修改 **全局设置**（修改设置、锁定设置、加减主人、加减管理、加减黑名单）
> - **群主人**：仅可由**全局主人**添加。可修改 **指定群设置**（修改群设置、加减群管理、加减群黑名单）

- 全局管理与群管理：

> - **全局管理**：仅可由**全局主人**添加
> - **群管理**：可由**全局主人、群主人**添加

- 全局黑名单与群黑名单：

> - **全局黑名单**：可由**全局主人、全局管理**添加
> - **群黑名单**：可由**全局主人、群主人、全局管理、群管理**添加

<details>
<summary>插件权限&&设置功能图表一览</summary>

### 插件权限&&功能图表一览

<div align="center">

|系统功能|全局主人|群主人|全局管理|群管|
| :---: | :----: | :-: | :---: | :-: |
| [权限等级](#插件权限类别) | [4](#插件主人) | [3](#插件主人) | [2](#插件管理) | [1](#插件管理) |
| 锁定设置 | √ | × | × | × |
| 查看全局设置 | √ | × | × | × |
| 修改全局设置 | √ | × | × | × |
| 查看群设置 | √ | √ | √ | √ |
| 修改群设置 | √ | √ | × | × |
| 添加全局主人 | √ | × | × | × |
| 添加群主人 | √ | × | × | × |
| 添加全局管理 | √ | × | × | × | 
| 添加群管理 | √ | √ | × | × |
| 添加全局黑名单 | √ | × | × | × |
| 添加群黑名单 | √ | √ | √ | √ |
| 其他设置功能 | √ | × | × | × |

</div>

- 以上功能普通用户、黑名单用户皆不可使用

</details>

<div align="center">

## 声明

**请勿在任何公共场合传播本插件。**

</div>

---
