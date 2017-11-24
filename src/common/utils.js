/**
 * 对象b 对 对象a 进行补充，不会覆盖同名属性
 */
export function supplement (oa, ob) {
    for (const key in ob) {
        if (!(key in oa) && key !== 'fontSize') {
            oa[key] = ob[key]
        }
    }
    return oa
}

export function getRandom (n, m) {
    return Math.floor(Math.random()*(m - n + 1) + n)
}

export function getElement (el) {
  if (!(el && (typeof el === 'string' || (typeof el === 'object' && el.nodeType === 1)))) throw new Error('element does not exist')
  return (typeof el === 'string' && document.querySelector('#' + el)) || el
}

export function getStyle (ele, prop) {
    var result = prop.match(/[A-Z]/g)
    if (!ele.currentStyle && result) {
        var propBridge = prop
        for (var i = 0; i < result.length; i++) {
            var upperCase = result[i]
            propBridge = propBridge.replace(upperCase, '-' + upperCase.toLowerCase())
        }
    }
    return (ele.currentStyle && ele.currentStyle[propBridge]) || getComputedStyle(ele, null)[prop]
}

export function locationMapping (length) {
    var res = []
    while (length--) {
        res.unshift(length)
    }
    return res
}

export function randomMapping (length) {
    /* 0-0 1-1 2-2 3-3 ...... */
    var map = locationMapping(length)
    var res = []
    
    while (map.length) {
        var randomIndex = getRandom(0, map.length - 1)
        var randomEntity = map[randomIndex]
        res.push(randomEntity)
        map.splice(randomIndex, 1)
    }

    return res
}