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
            img: 'desk2.png',
            width: 1500,
            height: 0,
            x: 768,
            y: 826,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'sprite',
                    img: 'desk1.png',
                    x: -350,
                    y: 0,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1,
                },
                {
                    type: 'sprite',
                    img: 'tesk3.png',
                    x: 406 - 62,
                    y: 0,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1,
                }
            ]
        }
    ]
};

function createDeskEntity(world) {
    world
        .createEntity()
        .addComponent(renderDataComponent, cloneDeep(renderData))
        .addComponent(matterDataComponent);
}
export default createDeskEntity;
