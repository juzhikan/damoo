import {common} from '@/common'
import {common2} from '@/common/index2'
import Damoo from './Damoo'

import './index.css'
common('page1')
/**
 * asdfasdfasdfasdfasdf
 */
if (__dev) {
    console.log('alall')
}

var damoo = new Damoo({
    container: 'dm-wrap',
    fontSize: 14
})

damoo.load([
    '起飞的斧子获得xxxxxxxx1', 
    '起飞的斧子获得5000元现金2', 
    '起飞的斧子获得鹿娘保温杯3个', 
    '起飞的斧子获得鹿娘保温杯4个',
    '起飞的斧子获得会员VIP5个月', 
    '66666', 
    'a', 
    '起飞的斧子获得鹿娘保温杯一个', 
    '起飞的斧子获得5000元现金', 
    'lalala', 
    {
        text:'起飞的斧子获得6000元现金',
        color: 'red'
    }, 
    '起飞的斧子获得鹿娘保温杯9个', 
    '起飞的斧子获得1000元现金', 
    '66666666', 
    '起飞的斧子获得鹿娘保温杯10个', 
    '起飞的斧子获得11000元现金', 
    '起飞的斧子获得鹿娘保温杯12个', 
    'ddd', 
    '起飞的斧子获得鹿娘保温杯13个'])

damoo.flowOut()