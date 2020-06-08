//  滑动变阻器
import {createComponentClass} from 'ecsy';

const SlidingRheostatComponent = createComponentClass(
    {
    // 最大阻值
        resistaneRight: {default: 0},
        resistaneLeft: {default: 20},
        maxResistance: {default: 20},
        minResistance: {default: 0},
        // 当前阻值百分比，规定：左->右  0->1
        percent: {default: 1},
        // 左右滑动限位
        limit: {default: {min: -135, max: 160}},
        // 滑块精灵
        sprite: {default: {}},
        // 滑块精灵图片名
        sliderPicName: {default: ''},
        maskType: {default: 0}
    },
    'SlidingRheostatComponent'
);

export default SlidingRheostatComponent;
