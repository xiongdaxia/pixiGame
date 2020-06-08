// 接线柱组件

import {createComponentClass} from 'ecsy';
//  该组件存放接线柱的连线生效范围
const BindPostComponent = createComponentClass(
    {
        // 接线柱的生效范围
        bindPostArea: {
            default: [
                {x: -20, y: 0, w: 30, h: 30, isIgnore: false},
                {x: 20, y: 0, w: 30, h: 30, isIgnore: false}
            ]
        },
        // 接线柱下一个连接的值
        adjList: {default: {}}
    },
    'BindPostComponent'
);
export default BindPostComponent;
