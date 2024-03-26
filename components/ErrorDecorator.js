import log from './log.js'

// 装饰器？

function ErrorHandler(oriFunction, methodName) {
  return function (...args) {
    try {
      return oriFunction.apply(this, args)
    } catch (err) {
      log.error(`${methodName}`, err)
    }
  }
}

function asyncErrorHandler(oriFunction, methodName) {
  return async function (...args) {
    try {
      return await oriFunction.apply(this, args)
    } catch (err) {
      log.error(`[${methodName}]`, err)
    }
  }
}

/**
 @param {Function} klass
 */
export default function applyErrorDecorator(klass) {
  if (!klass?.prototype) return klass
  const prototype = klass.prototype
  for (const methodName of Reflect.ownKeys(prototype)) {
    const Descriptor = Reflect.getOwnPropertyDescriptor(prototype, methodName) || {}
    if (Descriptor.get || Descriptor.set) {
      continue
    }
    const method = prototype?.[methodName]
    if (method instanceof Function && method !== klass) {
      const type = method.constructor.name
      if (type === 'AsyncFunction') {
        Reflect.set(prototype, methodName, asyncErrorHandler(method, methodName))
      } else if (type === 'Function') {
        Reflect.set(prototype, methodName, ErrorHandler(method, methodName))
      }
    }
  }
  return klass
}