import * as components from './index.js'

const { file, Path, Data, log } = components

log.purple('载入模块重载模块：reloadModule.js')

async function _reloadModule(jsPath) {
  const { name: moduleName, base } = Path.parse(jsPath)
  log.debug('修改components：' + base)
  const newModule = await import(`file:///${jsPath}?${Date.now()}`).then(res => res.default)
  for (const prototype in newModule) {
    if (typeof newModule[prototype] === 'function') {
      components[moduleName][prototype] = newModule[prototype].bind(components[moduleName])
    } else {
      components[moduleName][prototype] = newModule[prototype]
    }
  }
}

export default function reloadModule() {
  const files = file.readdirSync(Path.components, { type: '.js', removes: ['reloadModule.js', 'UCPr.js', 'log.js', 'index.js'] })
  files.forEach(_file => {
    Data.watch(Path.get('components', _file), _reloadModule)
  })
}