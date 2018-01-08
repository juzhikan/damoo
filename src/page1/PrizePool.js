import { getRandom, getElement, getStyle, locationMapping, randomMapping } from '../common/utils'

class PrizePool {
    constructor (options) {
        var opts = options || {}
        if (!opts.container || !opts.prizes || !opts.prizes.length) return

        var length = opts.prizes.length
        this.container = getElement(opts.container)
        var position = getStyle(this.container, 'position')
        this.container.style.position = (!position || position === 'static') ? 'relative' : position

        this.width = parseFloat(getStyle(this.container, 'width'))
        this.prizeWidth = this.width / 12
        this.floorBase = 10
        this.floorHeight = 20

        this.regionA = []
        this.regionB = []
        this.regionC = []
        this.pool = []
        /* 构造奖品池item */
        this.arrange(opts.prizes)
        /* 放置 */
        this.place()
    }
    arrange (prizes) {
        /* 随机位置映射 */
        var randomMap = randomMapping(prizes.length)
        for (var i = 0; i < randomMap.length; i++) {
            var randomLocation = randomMap[i]
            var regionFlag = i % 3
            var floor = Math.floor(i / 3)
            var prize = prizes[randomLocation]
            switch (regionFlag) {
                case 0:/* region A */
                    this.add(prize, 'A', floor)
                    break
                case 1:/* region B */
                    this.add(prize, 'B', floor)
                    break
                case 2:/* region C */
                    this.add(prize, 'C', floor)
                    break
                default:
                    break
            }
        }
    }
    add (content, region, floor) {
        var prize = {
            content: content,
            region: region,
            floor: floor,
            transform: this.getTransform(region, floor)
        }
        this['region' + region].push(prize)
        this.pool.push(prize)
    }
    getTransform (region, floor) {
        var translateY = this.floorBase + this.floorHeight * floor
        var translateX = this.getTranslateX(region)
        return 'translateX(' + translateX + 'px) translateY(' + -translateY + 'px) translateZ(0px)'
    }
    getTranslateX (region) {
        var floorWidth = this.width / 3
        var range = floorWidth / 4
        var res
        switch (region) {
            case 'A':/* region A */
                res = getRandom(range, range * 3)
                break
            case 'B':/* region B */
                res = getRandom(range * 5, range * 7)
                break
            case 'C':/* region C */
                res = getRandom(range * 9, range * 11)
                break
            default:
                break
        }
        return res - this.prizeWidth - this.width / 2
    }
    place () {
        var fragment = document.createDocumentFragment()
        this.pool.forEach(item => {
            var prize = document.createElement('img')
            prize.src = item.content
            prize.style.position = 'absolute'
            prize.width = this.prizeWidth
            prize.style.borderRadius = '50%'
            prize.style.bottom = 0
            prize.style.left = '50%'
            prize.style.transform = item.transform
            fragment.appendChild(prize)
        })
        this.container.appendChild(fragment)
    }
}

export default PrizePool