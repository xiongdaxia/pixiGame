// 开关
import cloneDeep from 'lodash/cloneDeep';
import renderDataComponent from '@/components/physical/renderData';
import matterDataComponent from '@/components/physical/matter';
// import movableComponent from '@/components/physical/movable';


// import settings from '@/settings/settings';

const renderData = {
    //  图集信息
    atlasUrl: '/texture/mechanics/demo.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'car.png',
            x: -600,
            y: -140,
            angle: 20,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: []
        }
    ]
};

function createCarEntity(world) {
    world
        .createEntity()
        .addComponent(renderDataComponent, cloneDeep(renderData))
        // .addComponent(movableComponent)
        .addComponent(matterDataComponent, {
            params: {
                friction: 0,
                frictionStatic: 0,
                // isStatic: false,
                restitution: 0,
                label: 'car'
                // inverseInertia: 0,
            }
        });
}
export default createCarEntity;
