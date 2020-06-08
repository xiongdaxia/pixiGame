// 电阻
import {env} from '@/environment';
import settings from '@/settings/physical/settings';
import cloneDeep from 'lodash/cloneDeep';
import RenderDataComponent from '@/components/physical/renderData';
import MovableComponent from '@/components/physical/movable';
import BindPostComponent from '@/components/physical/bindPost';
import ElecAppliance from '@/components/physical/elecAppliance';
import elecType from '@/settings/physical/elecType';

const resistenceRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/resistance.png',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: `${env.publicPath}/texture/physical/resistance.png`,
            x: 200,
            y: -300,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'label',
                    value: 'R1(1 Ω)',
                    x: 0,
                    y: 50,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                }
            ]
        }
    ]
};
const bindPostData = {
    bindPostArea: [
        {
            x: -82 + settings.BINDPOST_WIDTH / 2,
            y: -22 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        },
        {
            x: 56 + settings.BINDPOST_WIDTH / 2,
            y: -22 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        }
    ],
    // 接线柱下一个连接的值
    adjList: {},
};
const elecApplianceData = {
    status: 0,
    postNum: 2,
    resistance: 1,
    power: 0,
    ratedPower: 100,
    maxPower: 100,
    voltage: 0,
    isDistinguish: false,
    type: elecType.Resistance,
    getNextNode: 'twoPostNextNodeFunc',
    editInfo: [
        {
            label: '电阻值',
            key: 'resistance',
            value: 1,
            unit: 'Ω'
        }
    ]
};

function createResistanceEntity(world) {
    return world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(resistenceRenderData))
        .addComponent(MovableComponent)
        .addComponent(ElecAppliance, cloneDeep(elecApplianceData))
        .addComponent(BindPostComponent, cloneDeep(bindPostData));
}
export default createResistanceEntity;
