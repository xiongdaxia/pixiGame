// 纹理位置信息组件

import {createComponentClass} from 'ecsy';
//  该组件存放的信息，用于render系统读取信息并渲染出精灵🧚‍
const RenderDataComponent = createComponentClass(
    {
        // 渲染后生成的精灵
        sprite: {default: {}},
        //  图集信息
        atlasUrl: {default: '/texture/battery.json'},
        //  层级信息及布局
        postionJson: {
            default: [
                {
                    img: 'battery1.png',
                    x: 0,
                    y: 0,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1,
                    children: []
                }
            ]
        }
    },
    'RenderDataComponent'
);
export default RenderDataComponent;
