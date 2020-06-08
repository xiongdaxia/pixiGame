// 灯泡
import cloneDeep from 'lodash/cloneDeep';

import RenderDataComponent from '@/components/physical/renderData';
import MovableComponent from '@/components/physical/movable';
import BindPostComponent from '@/components/physical/bindPost';
import elecAppliance from '@/components/physical/elecAppliance';
import ShineableComponent from '@/components/physical/shineable';
import elecType from '@/settings/physical/elecType';
import settings from '@/settings/physical/settings';

const lampRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/lamp.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'lampHold.png',
            x: -150,
            y: -200,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'sprite',
                    img: 'lamp1.png',
                    x: -2,
                    y: -43,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'label',
                    value: 'L1',
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
    ratedPower: 2,
    maxPower: 3,
    voltage: 0,
    isDistinguish: false,
    type: elecType.Lamp,
    getNextNode: 'twoPostNextNodeFunc',
    editInfo: [
        {
            label: '电阻',
            key: 'resistance',
            value: 1,
            unit: 'Ω'
        },
        {
            label: '额定功率',
            key: 'ratedPower',
            value: 2,
            unit: 'W'
        },
        {
            label: '最大功率',
            key: 'maxPower',
            value: 3,
            unit: 'W'
        }
    ]
};

const lampData = {
    // 正常状态图片名 0-100%亮度
    normalPicArr: ['lamp1.png', 'lamp3.png', 'lamp4.png'],
    // 烧毁图片名
    burnPic: 'lamp2.png'
};
function createLampEntity(world) {
    return world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(lampRenderData))
        .addComponent(MovableComponent)
        .addComponent(elecAppliance, cloneDeep(elecApplianceData))
        .addComponent(ShineableComponent, cloneDeep(lampData))
        .addComponent(BindPostComponent, cloneDeep(bindPostData));
}

export default createLampEntity;
