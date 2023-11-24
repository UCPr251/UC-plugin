import path from 'node:path'

const Plugin_Name = 'UC-plugin'
const _path = process.cwd()
const qsign = path.resolve(_path, '..', 'unidbg-fetch-qsign')
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
const helpjs = path.join(system, 'help.js')
const cfgjs = path.join(system, 'cfg.js')
const servesyaml = path.join(system, 'serves.yaml')
const UC_plugin_decrypt = path.join(system, 'UC-plugin-decrypt')
const decryptyaml = path.join(UC_plugin_decrypt, 'decrypt.yaml')
const resources = path.join(UC, 'resources')
const img = path.join(resources, 'img')
const chuoyichuo = path.join(resources, 'chuoyichuo')
const wife = path.join(resources, 'wife')
const configyaml = path.join(config, 'config.yaml')
const permissionyaml = path.join(config, 'permission.yaml')
const data = path.join(UC, 'data')
const bigjpg = path.join(data, 'bigjpg')
const errorLogjson = path.join(data, 'errorLog.json')
const accreditjson = path.join(data, 'accredit.json')
const BLPGroupjson = path.join(data, 'BLPGroup.json')
const BLPPrivatejson = path.join(data, 'BLPPrivate.json')
const queueUpjson = path.join(data, 'queueUp.json')

/** 路径配置，继承path */
const Path = {
  ...path,
  /**
   * 获取路径
   * @param {'_path'|'plugins'|'UC'|'apps'|'components'|'defSet'|'system'|'model'|'config'|'data'|'resources'|'img'|'example'} rootDir 上级文件夹
   * @param {string} basename 文件夹或文件basename
   * @returns 目标路径
   */
  get(rootDir, ...basename) {
    return Path.join(Path[rootDir] ?? rootDir, ...basename)
  },
  /** UCPr */
  Author: 'UCPr',
  /** UC-plugin */
  Plugin_Name,
  /** 云崽工作目录路径 */
  _path,
  /** 签名默认路径 */
  qsign,
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
  /** ./defSet/system/help.js */
  helpjs,
  /** ./defSet/system/cfg.js */
  cfgjs,
  /** ./defSet/system/serves.yaml */
  servesyaml,
  /** ./defSet/system/UC_plugin_decrypt */
  UC_plugin_decrypt,
  /** ./defSet/system/UC_plugin_decrypt/decrypt.yaml */
  decryptyaml,
  /** ./resources */
  resources,
  /** ./resources/img */
  img,
  /** ./resources/chuoyichuo */
  chuoyichuo,
  /** ./resources/wife */
  wife,
  /** ./config/config.yaml */
  configyaml,
  /** ./config/permission.yaml */
  permissionyaml,
  /** ./data */
  data,
  /** ./data/bigjpg */
  bigjpg,
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