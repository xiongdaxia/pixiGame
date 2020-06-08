//  电池
import cloneDeep from 'lodash/cloneDeep';
import RenderDataComponent from '@/components/physical/renderData';
import movableComponent from '@/components/physical/movable';
import BindPostComponent from '@/components/physical/bindPost';
import elecAppliance from '@/components/physical/elecAppliance';
import settings from '@/settings/physical/settings';
import elecType from '@/settings/physical/elecType';

const batteryRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/battery.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'battery1.png',
            x: 100,
            y: 300,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'label',
                    value: 'E1',
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
            x: -100 + settings.BINDPOST_WIDTH / 2,
            y: -10 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        },
        {
            x: 76 + settings.BINDPOST_WIDTH / 2,
            y: -10 + settings.BINDPOST_HEIGHT / 2,
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
    resistance: 0,
    power: 0,
    ratedPower: 100,
    maxPower: 100,
    voltage: 3,
    isDistinguish: true,
    type: elecType.Battery,
    getNextNode: 'batteryGetNextNode',
    editInfo: [
        {
            label: '内阻',
            key: 'resistance',
            value: 0,
            unit: 'Ω'
        },
        {
            label: '电压',
            key: 'voltage',
            value: 3,
            unit: 'V'
        }
    ]
};
function createBatteryEntity(world) {
    return world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(batteryRenderData))
        .addComponent(movableComponent)
        .addComponent(elecAppliance, cloneDeep(elecApplianceData))
        .addComponent(BindPostComponent, cloneDeep(bindPostData));
}
export default createBatteryEntity;
