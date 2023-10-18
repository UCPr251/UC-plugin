import { ALLCONFIG, now_config } from './components/UCPr.js'
import { UCPr, Path, file } from './components/index.js'
import path from 'path'
import _ from 'lodash'

/**
 * 设置锅巴展示配置
 * @param {property} field 属性名
 * @param {string} label 展示名
 * @param {'Input'|'InputNumber'|'InputTextArea'|'Switch'|'Select'} component 展示属性
 * @param {string} bottomHelpMessage 帮助信息
 * @param {object} componentProps 配置项, max, min等
 * @param {object} option 可选项
 */
function set(field, label, component, bottomHelpMessage, componentProps = {}, option = { required: false }) {
  let display = {
    field,
    label,
    component,
    bottomHelpMessage,
    componentProps
  }
  return _.merge(display, option)
}

let js = []

if (file.existsSync(path.join(Path.apps, 'BlivePush.js'))) {
  const newCfg = [
    {
      label: '【UC】B站直播推送设置',
      component: 'Divider'
    },
    set('BlivePushisGroup', '群聊推送开关', 'Switch',
      '群聊推送全局开关，关闭不再推送群聊'),
    set('BlivePushisPrivate', '私聊推送开关', 'Switch',
      '私聊推送全局开关，关闭不再推送私聊'),
    set('BlivePushisPrivateSubscribe', '允许私聊订阅', 'Switch',
      '私聊订阅开关，关闭仅主人可私聊订阅推送'),
    set('BlivePushisA', '允许插件管理订阅', 'Switch',
      '是否允许群插件管理员订阅推送，关闭仅主人或群原生管理员可订阅'),
    set('BlivePushisGA', '允许群管理订阅', 'Switch',
      '是否允许群原生管理员订阅推送，关闭仅主人或插件群管理员可订阅'),
    set('BlivePushmins', '推送检测间隔', 'InputNumber',
      '推送检测间隔，单位分钟，不建议小于4，修改后重启生效',
      { min: 2 })
  ]
  js = js.concat(newCfg)
}

// if (file.existsSync(path.join(Path.apps, )))

export function supportGuoba() {
  return {
    pluginInfo: {
      name: Path.Plugin_Name,
      title: Path.Plugin_Name,
      author: Path.Author,
      authorLink: 'https://gitee.com/UCPr251',
      link: 'https://gitee.com/UCPr251/UC-plugin',
      isV3: true,
      isV2: false,
      description: 'UC-plugin，为更多有趣的功能',
      iconPath: path.join(Path.resources, 'xiubi.png')
    },
    configInfo: {
      schemas: [
        {
          label: '【UC】系统设置',
          component: 'Divider'
        },
        set('Master', '插件主人', 'InputTextArea',
          '拥有租管主人权限的QQ，多个请用中文逗号间隔'),
        set('BlackQQ', '插件黑名单', 'InputTextArea',
          '插件拉黑QQ，无法使用本插件，多个请用中文逗号间隔'),
        set('WhiteQQ', '插件白名单', 'InputTextArea',
          '插件加白QQ，暂时没什么b用，多个请用中文逗号间隔'),
        set('isDefaultMaster', '合并主人', 'Switch',
          '插件主人和机器人主人是否合并，不影响管理员设置'),
        set('log', '日志输出', 'Switch', '是否输出本插件日志'),
        set('priority', '插件优先级', 'InputNumber',
          '本插件优先级，修改后重启生效'),
        set('server', '连接服务', 'Select',
          'Api服务选择，若频繁Api连接失败可尝试更改重试',
          {
            options: [
              { label: '服务1', value: 1 },
              { label: '服务2', value: 2 }
            ]
          }),
        set('onlyMaster', '仅主人可操作', 'Switch',
          '开启后仅主人可操作本插件'),
        set('onlyMasterReply', '仅主人回复', 'InputTextArea',
          '开启仅主人后，对原本拥有管理权限的插件管理员的回复'),
        set('noPerReply', '用户无权限回复', 'InputTextArea',
          '用户权限不足以操作时的回复'),
        set('noPowReply', 'Bot无权限回复', 'InputTextArea',
          'Bot权限不足无法执行操作时的回复'),
        set('fetchErrReply', '连接失败回复', 'InputTextArea',
          'Api服务连接失败回复')
      ].concat(js),

      getConfigData() {
        return now_config
      },

      setConfigData(data, { Result }) {
        let changed = {}
        for (let [property, value] of Object.entries(data)) {
          if (property.startsWith('BlivePush')) {
            if (ALLCONFIG.BlivePush[property.replace('BlivePush', '')] == value) continue
            changed[property] = value
            continue
          } else if (property === 'Master' || property === 'WhiteQQ' || property === 'BlackQQ') {
            value = _.sortBy(value
              .split('，')
              .filter(num => num.length >= 7 && num.length <= 11)
              .map(Number))
          }
          if (_.isEqual(ALLCONFIG[property], value)) continue
          changed[property] = value
        }
        if (_.isEmpty(changed)) return Result.ok({}, '什么都没变哦~')
        let newconfig = _.cloneDeep(UCPr.config)
        let newpermissionCfg = _.cloneDeep(UCPr.permissionCfg)
        for (let [property, value] of Object.entries(changed)) {
          if (property === 'Master' || property === 'BlackQQ' || property === 'WhiteQQ') {
            newpermissionCfg[property] = value
          } else {
            if (property.startsWith('BlivePush')) {
              newconfig.BlivePush[property.replace('BlivePush', '')] = value
            } else {
              newconfig[property] = value
            }
          }
        }
        if (!_.isEqual(newconfig, UCPr.config)) {
          file.YAMLsaver(Path.configyaml, newconfig)
        }
        if (!_.isEqual(newpermissionCfg, UCPr.permissionCfg)) {
          file.YAMLsaver(Path.permissionyaml, newpermissionCfg)
        }
        return Result.ok({}, '保存成功~')
      }
    }
  }
}