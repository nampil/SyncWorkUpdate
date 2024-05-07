exports.mapping = function mapping(obj1, obj2) {
  function compareValues(value1, value2) {
    if (value1 === value2) {
      return 'unchanged'
    }
    if (
      isDate(value1) &&
      isDate(value2) &&
      value1.getTime() === value2.getTime()
    ) {
      return 'unchanged'
    }
    if (value1 === undefined) {
      return 'created'
    }
    if (value2 === undefined) {
      return 'deleted'
    }
    return 'updated'
  }

  function isFunction(x) {
    return Object.prototype.toString.call(x) === '[object Function]'
  }
  function isArray(x) {
    return Object.prototype.toString.call(x) === '[object Array]'
  }
  function isDate(x) {
    return Object.prototype.toString.call(x) === '[object Date]'
  }

  function isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]'
  }
  function isValue(x) {
    return !isObject(x) && !isArray(x)
  }

  if (isFunction(obj1) || isFunction(obj2)) {
    throw 'Invalid argument. Function given, object expected.'
  }
  if (isValue(obj1) || isValue(obj2)) {
    const type = compareValues(obj1, obj2)

    if (type !== 'unchanged') {
      return {
        type,
        odlValue: obj1 ? obj1 : null,
        newValue: obj2 ? obj2 : null,
      }
    } else {
      return null
    }
  }
  const diff = {}

  for (var key in obj1) {
    if (isFunction(obj1[key])) {
      continue
    }

    let value2 = undefined
    if (obj2[key] !== undefined) {
      value2 = obj2[key]
    }

    diff[key] = mapping(obj1[key], value2)
  }
  for (var key in obj2) {
    if (isFunction(obj2[key]) || diff[key] !== undefined) {
      continue
    }

    diff[key] = mapping(undefined, obj2[key])
  }

  const finalObj = {}

  for (var key in diff) {
    if (
      key !== 'updatedBy' &&
      key !== 'updatedAt' &&
      diff[key] &&
      diff[key].type !== 'unchanged'
    ) {
      finalObj[key] = diff[key]
    }
  }

  return finalObj
}
