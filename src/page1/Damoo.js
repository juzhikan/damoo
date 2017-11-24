/*!
 * Damoo - HTML5 Danmaku Engine v0.0.0
 * https://github.com/juzhikan/Damoo
 *
 * Copyright (c) 2015-2017 juzhikan
 * Released under the MIT license
 */

import { supplement, getRandom, getElement, getStyle } from '@/common/utils'

function Damoo (options) {
    var opt = options || {}
    var container = this.container = getElement(opt.container)
    container.style.overflow = 'hidden'

    this.fontSize = opt.fontSize || 14
    this.width = parseFloat(getStyle(container, 'width'))
    this.height = parseFloat(getStyle(container, 'height'))

    this.transform = 'translate(' + this.width + 'px, 0px) translateZ(0px)'

    var trackHeight = this.fontSize + 2
    var trackNum = Math.floor(this.height/trackHeight)
    var trackWidth = this.width

    this.pool = new Pool()
    this.track = new Track(trackNum, trackWidth, trackHeight)
}

Damoo.prototype.getPublicConfig = function () {
    return {
        fontSize: this.fontSize,
        transform: this.transform
    }
}

/* 弹幕装载 */
Damoo.prototype.load = function (bullets) {
    var publicConfig = this.getPublicConfig()

    if (!bullets) return
    const bulletsArr = Object.prototype.toString.call(bullets) === '[object Array]' ? bullets : [ bullets ]

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
Damoo.prototype.flowOut = function () {
    var self = this
    var limit = 4

    var timer = setInterval(function () {
        if (!self.pool.getAmount()) {
            clearInterval(timer)
        } else if (self.track.getValidTrackIndex() !== false && limit > 0) {
            var bullet = self.pool.getLoaded()
            var bulletDom = document.createElement('div')
            bulletDom.addEventListener('transitionend', function (event) {
                var target = event.currentTarget
                target.parentNode.removeChild(target)
            })
            for (var key in bullet) {
                var quote = key === 'textContent' ? bulletDom : bulletDom.style
                quote[key] = bullet[key]
            }
            self.container.appendChild(bulletDom)
            self.track.addTrack(bulletDom)
            limit--
        } else {
            clearInterval(timer)
            setTimeout(function () {
                self.flowOut()
            }, 2000)
        }
    }, 200)
}


/**
 * 弹幕对象 样式：优先使用个性配置，其次使用公共配置，最后使用默认配置
 */
function Bullet (blt) {
    this.textContent = blt.text
    this.transform = blt.transform
    this.fontWeight = blt.fontWeight || 'bold'
    this.fontFamily = blt.fontFamily || 'sans-serif'
    this.textShadow = blt.textShadow || 'rgb(0, 0, 0) 1px 1px 2px'
    this.opacity = blt.opacity || 1
    this.color = blt.color || 'rgb(255, 255, 255)'

    this.fontSize = blt.fontSize

    /* 固定配置 */
    this.display = 'inline-block'
    this.whiteSpace = 'pre'
    this.position = 'absolute'
}



/* 获取子弹剩余距离，计算时间，避免碰撞 */
function getDistance (blt) {
    var transform = getStyle(blt, 'transform')
    if (!transform) return 0
    var translatex = transform.replace('matrix(', '').replace(')','').split(',')[4].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
    return parseFloat(translatex) + blt.clientWidth
}


/* 弹轨控制 */
function Track (n, w, h) {
    this.num = n
    this.width = w
    this.height = h
    this.records = []
    while (n--) {
        this.records.push({
            node: null,
            duration: 0
        })
    }
}

/* 获取可用的弹轨，无可用返回 false */
Track.prototype.getValidTrackIndex = function () {
    var records = this.records
    for (var index = 0; index < records.length; index++) {
        var record = records[index]
        if (!record.node || getDistance(record.node) < this.width) return index
    }
    return false
}

/* 将弹幕加入弹轨，准备发射弹幕 */
Track.prototype.addTrack = function (bullet, index) {
    var trackIndex = index !== undefined ? index : getRandom(0, this.num - 1)
    trackIndex = trackIndex || 0
    var top = trackIndex*this.height

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
            var bullet_speed = (((w + nearestBullet.clientWidth) / duration) * w)/distance
            var bullet_duration = (bullet.clientWidth + w + 10)/bullet_speed
            bullet_duration = bullet_duration < 4 ? 4 : bullet_duration

            this.shoot(bullet, bullet_duration, trackIndex, top)
            return
        }
    }
    this.shoot(bullet, 6, trackIndex, top)
}

/* 发射弹幕 */
Track.prototype.shoot = function (bullet, duration, trackIndex, top) {
    this.records[trackIndex].node = bullet
    this.records[trackIndex].duration = duration

    bullet.style.transition = 'transform ' + duration + 's linear'
    bullet.style.top = top + 'px'
    requestAnimationFrame(function () {
        bullet.style.transform = 'translate(' + -bullet.clientWidth + 'px, 0px) translateZ(0px)'
    })
}


/* 弹池控制 */
function Pool () {
    this.bullets = []
}

Pool.prototype.load = function (bullet) {
    this.bullets.push(bullet)
}

Pool.prototype.getLoaded = function (d) {
    return this.bullets.length && this.bullets.shift()
}

Pool.prototype.getAmount = function (d) {
    return this.bullets.length
}

Pool.prototype.empty = function () {
    this.bullets = []
}

export default Damoo