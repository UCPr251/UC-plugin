import path from 'node:path'

const Plugin_Name = 'UC-plugin'
const _path = process.cwd()
const otheryaml = path.join(_path, 'config', 'config', 'other.yaml')
const plugins = path.join(_path, 'plugins')
const example = path.join(plugins, 'example')
const UC = path.join(plugins, Plugin_Name)
const apps = path.join(UC, 'apps')
const config = path.join(UC, 'config')
const defSet = path.join(UC, 'defSet')
const system = path.join(defSet, 'system')
const servesyaml = path.join(system, 'serves.yaml')
const decryptyaml = path.join(system, 'decrypt.yaml')
const resources = path.join(UC, 'resources')
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
  /** ./defSet/system/decrypt.yaml */
  decryptyaml,
  /** ./resources */
  resources,
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
