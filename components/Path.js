import path from 'node:path'

const Plugin_Name = 'UC-plugin'
const _path = process.cwd()
const botConfig = path.join(_path, 'config', 'config')
const otheryaml = path.join(botConfig, 'other.yaml')
const groupyaml = path.join(botConfig, 'group.yaml')
const plugins = path.join(_path, 'plugins')
const example = path.join(plugins, 'example')
const UC = path.join(plugins, Plugin_Name)
const apps = path.join(UC, 'apps')
const config = path.join(UC, 'config')
const defSet = path.join(UC, 'defSet')
const system = path.join(defSet, 'system')
const servesyaml = path.join(system, 'serves.yaml')
const UC_plugin_decrypt = path.join(system, 'UC-plugin-decrypt')
const decryptyaml = path.join(UC_plugin_decrypt, 'decrypt.yaml')
const resources = path.join(UC, 'resources')
const bigjpg = path.join(resources, 'bigjpg')
const chuoyichuo = path.join(resources, 'chuoyichuo')
const configyaml = path.join(config, 'config.yaml')
const permissionyaml = path.join(config, 'permission.yaml')
const data = path.join(UC, 'data')
const errorLogjson = path.join(data, 'errorLog.json')
const accreditjson = path.join(data, 'accredit.json')
const BLPGroupjson = path.join(data, 'BLPGroup.json')
const BLPPrivatejson = path.join(data, 'BLPPrivate.json')
const queueUpjson = path.join(data, 'queueUp.json')

/** 路径配置 */
const Path = {
  /** UCPr */
  Author: 'UCPr',
  /** UC-plugin */
  Plugin_Name,
  /** 云崽工作目录路径 */
  _path,
  /** 云崽/plugins */
  plugins,
  /** 云崽/plugins/example */
  example,
  /** other.yaml */
  otheryaml,
  /** group.yaml */
  groupyaml,
  /** ../UC-plugin */
  UC,
  /** ../UC-plugin/apps */
  apps,
  /** ./config */
  config,
  /** ./defSet */
  defSet,
  /** ./defSet/system */
  system,
  /** ./defSet/system/serves.yaml */
  servesyaml,
  /** ./defSet/system/UC_plugin_decrypt */
  UC_plugin_decrypt,
  /** ./defSet/system/UC_plugin_decrypt/decrypt.yaml */
  decryptyaml,
  /** ./resources */
  resources,
  /** ./resources/bigjpg */
  bigjpg,
  /** ./resources/chuoyichuo */
  chuoyichuo,
  /** ./config/config.yaml */
  configyaml,
  /** ./config/permission.yaml */
  permissionyaml,
  /** ./data */
  data,
  /** ./data/errorLog.json */
  errorLogjson,
  /** ./data/accredit.json */
  accreditjson,
  /** 直播推送群聊数据 */
  BLPGroupjson,
  /** 直播推送私聊数据 */
  BLPPrivatejson,
  /** 群内排队 */
  queueUpjson
}

export default Path
