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
            img: 'box.png',
            x: 500,
            y: 589,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: []
        }
    ]
};

function createBoxEntity(world) {
    world
        .createEntity()
        .addComponent(renderDataComponent, cloneDeep(renderData))
        .addComponent(matterDataComponent);
}
export default createBoxEntity;
