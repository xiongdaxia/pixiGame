// 开关
import cloneDeep from 'lodash/cloneDeep';
import renderDataComponent from '@/components/physical/renderData';
import matterDataComponent from '@/components/physical/matter';

// import settings from '@/settings/settings';

const renderData = {
    //  图集信息
    atlasUrl: '/texture/mechanics/demo.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'boardEnd.png',
            x: 730,
            y: 240,
            angle: Math.PI * 0.09,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: []
        }
    ]
};

function createObstacleEntity(world) {
    world
        .createEntity()
        .addComponent(renderDataComponent, cloneDeep(renderData))
        .addComponent(matterDataComponent, {
            params: {
                isStatic: true,
                friction: 1,
                frictionStatic: 1
            }
        });
}
export default createObstacleEntity;
