// 开关
import cloneDeep from 'lodash/cloneDeep';
import renderDataComponent from '@/components/physical/renderData';
import matterDataComponent from '@/components/physical/matter';
import movableComponent from '@/components/physical/movable';

const renderData = {
    //  图集信息
    atlasUrl: '/texture/mechanics/demo.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'graphics',
            shape: 'circle',
            img: '',
            x: -300,
            y: 0,
            r: 10,
            w: 30,
            h: 30,
            fillColor: 0x0000ff,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: []
        }
    ]
};

function createBallEntity(world, color = 0x0000ff) {
    const data = cloneDeep(renderData);
    data.postionJson[0].fillColor = color;
    world
        .createEntity()
        .addComponent(renderDataComponent, data)
        .addComponent(movableComponent)
        .addComponent(matterDataComponent, {
            params: {
                friction: 0,
                frictionStatic: 0,
                frictionAir: 0,
                q: 0.01,
                velocity: {
                    x: 1,
                    y: 0
                }
            }
        });
}

export default createBallEntity;
