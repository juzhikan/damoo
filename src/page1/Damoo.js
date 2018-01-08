/*!
 * Damoo - HTML5 Danmaku Engine v0.0.0
 * https://github.com/juzhikan/Damoo
 *
 * Copyright (c) 2015-2017 juzhikan
 * Released under the MIT license
 */

import { supplement, getRandom, getElement, getStyle } from '../common/utils'

const transitionendMap = [
    'transitionend',
    'webkitTransitionEnd',
    'oTransitionEnd',
    'otransitionend'
]

const prefixMap = [
    '',
    'webkit',
    'moz',
    'ms',
    'o'
]

/* 单位只支持 px */
class Damoo {
    constructor (options) {
        var opts = options || {}
        this.opts = opts
        var container = this.container = getElement(opts.container)
        container.style.overflow = 'hidden'

        this.onEnd = opts.onEnd || function () {}

        let fontSize = parseFloat(opts.fontSize || 14)
        let gap = parseFloat(opts.gap || 2)
        this.width = parseFloat(getStyle(container, 'width'))
        this.height = opts.height || parseFloat(getStyle(container, 'height')) || container.style.clientHeight
        
        this.trackHeight = parseFloat(opts.trackHeight || fontSize + 4)

        var trackNum = Math.floor((this.height + gap) / (this.trackHeight + gap))
        console.log(trackNum)
        var trackWidth = this.width
        this.pool = new Pool()
        this.track = new Track(trackNum, trackWidth, this.trackHeight, gap)
    }
    /* 公共样式配置，区别于 默认样式 和 字体对象的个性配置 */
    getPublicConfig () {
        let opts = this.opts
        return supplement({
            transform: `translate(${this.width}px, 0px) translateZ(0px)`,
            lineHeight: opts.lineHeight || this.trackHeight,
            height: this.trackHeight
        }, opts)
    }
    /* 弹幕装载 */
    load (bullets) {
        var publicConfig = this.getPublicConfig()
        if (!bullets)
            return
        const bulletsArr = Object.prototype.toString.call(bullets) === '[object Array]' ? bullets : [bullets]
        for (var i = 0; i < bulletsArr.length; i++) {
            var bullet = bulletsArr[i]
            var isLiteral = typeof bullet === 'string'
            if (!isLiteral && !bullet.text) {
                throw new Error('The text attribute is required！')
                return
            }
            bullet = (isLiteral && { text: bullet }) || bullet
            bullet = supplement(bullet, publicConfig)
            this.pool.load(new Bullet(bullet))
        }
    }
    /* 弹幕倾泻 */
    flowOut () {
        var self = this
        var limit = 2
        var timer = setInterval(function () {
            if (!self.pool.getAmount()) {
                clearInterval(timer)
                self.onEnd()
            } else if (self.track.getValidTrackIndex() !== false && limit > 0) {
                var bullet = self.pool.getLoaded()
                var bulletDom = document.createElement('div')
                transitionendMap.forEach(key => {
                    bulletDom.addEventListener(key, function (event) {
                        var target = event.currentTarget
                        target.parentNode.removeChild(target)
                    })
                })

                for (var key in bullet) {
                    var quote = (key === 'innerHTML' || key === 'className') ? bulletDom : bulletDom.style
                    quote[key] = bullet[key]
                }
                
                self.container.appendChild(bulletDom)
                self.track.addTrack(bulletDom)
                limit--
            } else {
                clearInterval(timer)
                setTimeout(function () {
                    self.flowOut()
                }, 4000)
            }
        }, 300)
    }
}


class Bullet {
    constructor (blt) {
        this.lineHeight = discernUnit(blt.lineHeight)
        this.height = discernUnit(blt.height)
        this.innerHTML = blt.avatar ?
         `<div>${blt.text}</div><img src="${blt.avatar}">`
         : blt.text
        var self = this
        prefix(function (prefix) {
            let suffix =  prefix === '' ? 'transform' : 'Transform'
            self[`${prefix}${suffix}`] = blt.transform
        })
        this.fontWeight = blt.fontWeight || 'bold'
        this.fontFamily = blt.fontFamily || 'sans-serif'
        this.textShadow = blt.textShadow || 'none'
        this.opacity = blt.opacity || 1
        this.color = blt.color || 'rgb(255, 255, 255)'
        this.backgroundColor = blt.backgroundColor || 'transparent'
        this.fontSize = discernUnit(blt.fontSize || 14)
        this.borderRadius = discernUnit(blt.borderRadius || 0)
        /* 固定配置 */
        this.display = 'inline-block'
        this.whiteSpace = 'pre'
        this.position = 'absolute'
        supplement(this, blt)
    }
}

function discernUnit (value) {
    if (typeof value === 'number' && value !== 0) {
        return `${value}px`
    }
    return value
}

/* 获取子弹剩余距离，计算时间，避免碰撞 */
function getDistance (blt) {
    var transform = getStyle(blt, 'transform') || getStyle(blt, 'webkitTransform')
    if (transform === undefined || transform === '') return undefined
    var translatex = transform.replace('matrix(', '').replace(')','').split(',')[4].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
    return parseFloat(translatex) + blt.clientWidth
}


class Track {
    constructor (n, w, h, g) {
        this.num = n
        this.width = w
        this.height = h
        this.gap = g
        this.records = []
        while (n--) {
            this.records.push({
                node: null,
                duration: 0
            })
        }
    }
    /* 获取可用的弹轨，无可用返回 false */
    getValidTrackIndex () {
        var records = this.records
        for (var index = 0; index < records.length; index++) {
            var record = records[index]
            if (record.node && getDistance(record.node) === undefined) {
                record.node = null
                return index
            } else if (!record.node || getDistance(record.node) < this.width) {
                return index
            }
        }
        return false
    }
    /* 将弹幕加入弹轨，随后发射弹幕 */
    addTrack (bullet, index) {
        var trackIndex = index !== undefined ? index : getRandom(0, this.num - 1)
        trackIndex = trackIndex || 0
        var top = trackIndex * (this.height + this.gap)
        /* 弹幕是否能放到当前轨道中，不能的话另寻轨道，能的话计算速度 */
        var record = this.records[trackIndex]
        if (record.node) {
            var nearestBullet = record.node
            var duration = record.duration
            var distance = getDistance(nearestBullet)
            if (distance > this.width) {
                var validTrackIndex = this.getValidTrackIndex()
                this.addTrack(bullet, validTrackIndex)
                return
            } else if (distance >= 0) {
                /* 可以放入，需要计算时间 */
                var w = this.width
                var bullet_speed = (((w + nearestBullet.clientWidth) / duration) * w) / distance
                var bullet_duration = (bullet.clientWidth + w + 10) / bullet_speed
                bullet_duration = bullet_duration < 4 ? 4 : bullet_duration
                this.shoot(bullet, bullet_duration, trackIndex, top)
                return
            }
        }
        this.shoot(bullet, 6, trackIndex, top)
    }
    /* 发射弹幕 */
    shoot (bullet, duration, trackIndex, top) {
        this.records[trackIndex].node = bullet
        this.records[trackIndex].duration = duration

        prefix(function (prefix) {
            let suffix =  prefix === '' ? 'transition' : 'Transition'
            bullet.style[`${prefix}${suffix}`] = `-${prefix}-transform ${duration}s linear`
        })

        bullet.style.top = top + 'px'
        requestAnimationFrame(function () {
            setTransform(bullet, -bullet.clientWidth)
        })
    }
}

function prefix (callback) {
    prefixMap.forEach(prefix => {
        callback(prefix)
    })
}

function setTransform (node, x, y, z) {
    prefix(function (prefix) {
        let suffix =  prefix === '' ? 'transform' : 'Transform'
        node.style[`${prefix}${suffix}`] = `translate(${x || 0}px, ${y || 0}px) translateZ(${z || 0}px)`
    })
}

class Pool {
    constructor () {
        this.bullets = []
    }
    load (bullet) {
        this.bullets.push(bullet)
    }
    getLoaded () {
        return this.bullets.length && this.bullets.shift()
    }
    getAmount () {
        return this.bullets.length
    }
    empty () {
        this.bullets = []
    }
}

export default Damoo
