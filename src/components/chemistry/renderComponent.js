import {createComponentClass} from 'ecsy';

const RenderComponent = createComponentClass(
    {
        // 渲染后生成的精灵
        sprite: {default: {}},
        //  图集信息
        atlasUrl: {default: '/texture/chemistry/beaker.png'},
        //  层级信息及布局
        postionJson: {
            default: [
                {
                    img: 'beaker.png',
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
    'RenderComponent'
);

export default RenderComponent;
