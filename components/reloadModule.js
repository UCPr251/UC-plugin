import * as components from './index.js'

const { file, Path, Data, log } = components

log.purple('载入模块重载模块：reloadModule.js')

async function _reloadModule(jsPath) {
  const { name: moduleName, base } = Path.parse(jsPath)
  log.debug('修改components：' + base)
  const newModule = await import(`file:///${jsPath}?${Date.now()}`)
    .then(res => res.default)
    .catch(error => log.error('载入模块失败：', error))
  for (const prototype of Reflect.ownKeys(newModule)) {
    const Descriptor = Object.getOwnPropertyDescriptor(components[moduleName], prototype) || {}
    if (Descriptor.get || Descriptor.set || Descriptor.writable === false) {
      continue
    }
    if (typeof newModule[prototype] === 'function') {
      Reflect.set(components[moduleName], prototype, newModule[prototype].bind(components[moduleName])) || log.warn(`重载模块${moduleName}函数失败：${prototype}`)
    } else {
      Reflect.set(components[moduleName], prototype, newModule[prototype]) || log.warn(`重载模块${moduleName}属性失败：${prototype}`)
    }
  }
}

export default function reloadModule() {
  file.readdirSync(Path.components, { type: '.js', removes: ['reloadModule.js', 'UCPr.js', 'index.js'] })
    .forEach(_file => {
      Data.watch(Path.get('components', _file), _reloadModule)
    })
}