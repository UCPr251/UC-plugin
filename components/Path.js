import path from 'node:path'

const Plugin_Name = 'UC-plugin'
const _path = process.cwd()
const qsign = path.resolve(_path, '..', 'unidbg-fetch-qsign')
const botConfig = path.join(_path, 'config', 'config')
const plugins = path.join(_path, 'plugins')
const example = path.join(plugins, 'example')
const UC = path.join(plugins, Plugin_Name)
const apps = path.join(UC, 'apps')
const Event = path.join(apps, 'Event')
const groupAdmin = path.join(Event, 'groupAdmin')
const config = path.join(UC, 'config')
const groupCfg = path.join(config, 'groupCfg')
const defSet = path.join(UC, 'defSet')
const system = path.join(UC, 'system')
const helpjs = path.join(system, 'help.js')
const cfgjs = path.join(system, 'cfg.js')
const servesyaml = path.join(system, 'serves.yaml')
const UC_plugin_decrypt = path.join(system, 'UC-plugin-decrypt')
const decryptyaml = path.join(UC_plugin_decrypt, 'decrypt.yaml')
const resources = path.join(UC, 'resources')
const resdata = path.join(resources, 'data')
const img = path.join(resources, 'img')
const chuoyichuo = path.join(resources, 'chuoyichuo')
const wife = path.join(resources, 'wife')
const configyaml = path.join(config, 'config.yaml')
const GAconfigyaml = path.join(config, 'GAconfig.yaml')
const lockyaml = path.join(config, 'lock.yaml')
const permissionyaml = path.join(config, 'permission.yaml')
const data = path.join(UC, 'data')
const temp = path.join(data, 'temp')
const testjson = path.join(temp, 'test.json')
const QA = path.join(data, 'QA')
const sqtj = path.join(data, 'sqtj')
const bigjpg = path.join(data, 'bigjpg')
const WM = path.join(data, 'WM')
const errorLogjson = path.join(data, 'errorLog.json')
const accreditjson = path.join(data, 'accredit.json')
const BLPGroupjson = path.join(data, 'BLPGroup.json')
const BLPPrivatejson = path.join(data, 'BLPPrivate.json')
const queueUpjson = path.join(data, 'queueUp.json')
const switchBotjson = path.join(data, 'switchBot.json')
const lockdownjson = path.join(data, 'lockdown.json')

/** 路径配置，继承path */
const Path = {
  ...path,
  /**
   * 获取路径
   * @param {'_path'|'plugins'|'UC'|'apps'|'groupAdmin'|'botConfig'|'components'|'defSet'|'system'|'model'|'config'|'groupCfg'|'data'|'temp'|'QA'|'resources'|'img'|'example'|'sqtj'} rootDir 上级文件夹
   * @param {string} basename 文件夹或文件basename
   * @returns 目标路径
   */
  get(rootDir, ...basename) {
    return Path.join(Path[rootDir] ?? rootDir, ...basename.map(v => v.toString()))
  },
  /** UCPr */
  Author: 'UCPr',
  /** UC-plugin */
  Plugin_Name,
  /** 云崽工作目录路径 */
  _path,
  /** 云崽/config/config */
  botConfig,
  /** 签名默认路径 */
  qsign,
  /** 云崽/plugins */
  plugins,
  /** 云崽/plugins/example */
  example,
  /** ../UC-plugin */
  UC,
  /** ../UC-plugin/apps */
  apps,
  /** ../UC-plugin/apps/Event */
  Event,
  /** ../UC-plugin/apps/Event/groupAdmin */
  groupAdmin,
  /** ./config */
  config,
  /** ./config/groupCfg */
  groupCfg,
  /** ./defSet */
  defSet,
  /** ./system */
  system,
  /** ./system/help.js */
  helpjs,
  /** ./system/cfg.js */
  cfgjs,
  /** ./system/serves.yaml */
  servesyaml,
  /** ./system/UC_plugin_decrypt */
  UC_plugin_decrypt,
  /** ./system/UC_plugin_decrypt/decrypt.yaml */
  decryptyaml,
  /** ./resources */
  resources,
  /** ./resources/data */
  resdata,
  /** ./resources/img */
  img,
  /** ./resources/chuoyichuo */
  chuoyichuo,
  /** ./resources/wife */
  wife,
  /** ./config/config.yaml */
  configyaml,
  /** ./config/lock.yaml */
  lockyaml,
  /** ./config/GAconfig.yaml */
  GAconfigyaml,
  /** ./config/permission.yaml */
  permissionyaml,
  /** ./data */
  data,
  /** ./data/temp */
  temp,
  /** ./data/temp/test.json */
  testjson,
  /** ./data/QA */
  QA,
  /** ./data/QA/sqtj */
  sqtj,
  /** ./data/bigjpg */
  bigjpg,
  /** ./data/WM */
  WM,
  /** ./data/errorLog.json */
  errorLogjson,
  /** ./data/accredit.json */
  accreditjson,
  /** ./data/BLPGroup.json */
  BLPGroupjson,
  /** ./data/BLPPrivate.json */
  BLPPrivatejson,
  /** ./data/queueUp.json */
  queueUpjson,
  /** ./data/switchBot.json */
  switchBotjson,
  /** ./data/lockdown.json */
  lockdownjson
}

export default Path