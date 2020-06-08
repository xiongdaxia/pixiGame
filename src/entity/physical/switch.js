// 开关
import cloneDeep from 'lodash/cloneDeep';
import RenderDataComponent from '@/components/physical/renderData';
import MovableComponent from '@/components/physical/movable';
import BindPostComponent from '@/components/physical/bindPost';
import ElecAppliance from '@/components/physical/elecAppliance';
import RorateableComponent from '@/components/physical/rorateable';
import settings from '@/settings/physical/settings';
import elecType from '@/settings/physical/elecType';

const switchRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/switch.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: '',
            x: -200,
            y: 300,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'sprite',
                    img: 'switchPipe.png',
                    x: -60,
                    y: -20,
                    angle: -30,
                    anchor: {x: 0.1, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'switchHolder.png',
                    x: 0,
                    y: 0,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'label',
                    value: 'K1',
                    x: 0,
                    y: 70,
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
            x: -103 + settings.BINDPOST_WIDTH / 2,
            y: 0 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        },
        {
            x: 80 + settings.BINDPOST_WIDTH / 2,
            y: 0 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        }
    ],
    // 接线柱下一个连接的值
    // entityID_0 \ entityID_1 : {Area,end:[entityID2_0]}
    adjList: {},
};
const rorateableData = {
    // 是否闭合
    isChecked: false,
    // 可旋转精灵的name
    rorateSpriteName: 'switchPipe.png',
    // 可旋转的精灵
    sprite: null,
    // 初始角度
    originAngle: -30,
    // 最大旋转角度
    max: 0,
    // 最小旋转角度
    min: -30
};

const elecApplianceData = {
    status: 1,
    postNum: 2,
    resistance: 0,
    power: 0,
    ratedPower: Infinity,
    maxPower: Infinity,
    voltage: 0,
    isDistinguish: false,
    type: elecType.Switch,
    getNextNode: 'twoPostNextNodeFunc'
};
function createSwitchEntity(world) {
    world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(switchRenderData))
        .addComponent(MovableComponent)
        .addComponent(ElecAppliance, cloneDeep(elecApplianceData))
        .addComponent(RorateableComponent, cloneDeep(rorateableData))
        .addComponent(BindPostComponent, cloneDeep(bindPostData));
}
export default createSwitchEntity;
