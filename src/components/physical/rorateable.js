// 可旋转的

import {createComponentClass} from 'ecsy';
//  该组件存放旋转相关的信息
const RorateableComponent = createComponentClass(
    {
        // 可旋转精灵的name
        rorateSpriteName: {default: 'sprite'},
        // 是否闭合
        isChecked: {default: false},
        // 可旋转的精灵
        sprite: {default: null},
        // 初始角度
        originAngle: {default: 0},
        // 最大旋转角度
        max: {default: 30},
        // 最小旋转角度
        min: {default: -10}
    },
    'RorateableComponent'
);
export default RorateableComponent;
