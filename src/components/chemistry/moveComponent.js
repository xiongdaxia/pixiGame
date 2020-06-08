// 是否可以移动

import {createComponentClass} from 'ecsy';
//  该组件存放是否可以移动的信息
const MoveComponent = createComponentClass(
    {
        // 可移动
        flag: {default: true},
        // 移动范围限制，-1为不限制
        limit: {default: {up: Infinity, down: Infinity, left: Infinity, right: Infinity}}
    },
    'MoveComponent'
);
export default MoveComponent;
