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
            img: 'board.png',
            x: 500,
            y: 400,
            angle: 20,
            anchor: {x: 1, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: []
        }
    ]
};

function createBoardEntity(world) {
    world
        .createEntity()
        .addComponent(renderDataComponent, cloneDeep(renderData))
        .addComponent(matterDataComponent, {
            params: {
                isStatic: true,
                friction: 1,
                frictionStatic: 1,
                render: {
                    visible: true,
                    opacity: 1,
                    sprite: {
                        xScale: 1,
                        yScale: 1,
                        xOffset: 0,
                        yOffset: 0
                    },
                    lineWidth: 0
                }
            }
        });
}
export default createBoardEntity;
