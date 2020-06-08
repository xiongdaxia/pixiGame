//  导线组件

import {createComponentClass} from 'ecsy';
//  该组件存放的信息，用于render系统读取信息并渲染出精灵🧚‍
const LineDataComponent = createComponentClass(
    {
        // 渲染后生成的精灵
        sprite: {default: {}},
        // 连接的实体ID
        connectEntityID: {default: []},
        // 连接的接线柱Name
        connectBindPost: {default: []},
        //  图集信息
        atlasUrl: {default: '/texture/line.json'},
        //  使用的图片
        img: {default: 'redLine.png'},
        // 绘制的点
        points: {default: []}
    },
    'LineDataComponent'
);
export default LineDataComponent;
