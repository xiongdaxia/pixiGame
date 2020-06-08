// 开关
import cloneDeep from 'lodash/cloneDeep';

import RenderDataComponent from '@/components/physical/renderData';
import movableComponent from '@/components/physical/movable';
// 是否是电流表
import ComplexEntityComponent from '@/components/physical/complexEntity';
import ChildEntityComponent from '@/components/physical/childEntity';
import AmmeterComponent from '@/components/physical/ammeter';

import BindPostComponent from '@/components/physical/bindPost';
import elecAppliance from '@/components/physical/elecAppliance';
import settings from '@/settings/physical/settings';
import elecType from '@/settings/physical/elecType';
//  电流表的接线柱方法

const ammeterRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/Ammeter.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'Ammeter_box.png',
            x: 100,
            y: 20,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'sprite',
                    img: 'Ammeter_line.png',
                    x: 0,
                    y: 46,
                    angle: -25,
                    anchor: {x: 0.5, y: 1},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Ammeter_hold.png',
                    x: 0,
                    y: 32,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Ammeter_num.png',
                    x: -67,
                    y: 108,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Ammeter_6.png',
                    x: 0,
                    y: 108,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Ammeter_30.png',
                    x: 67,
                    y: 108,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'label',
                    value: 'A1',
                    x: 0,
                    y: 158,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'label',
                    value: '0A',
                    x: 0,
                    y: -158,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                }
            ]
        }
    ]
};
const nullRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/Ammeter.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: '',
            x: 0,
            y: 0,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1
        }
    ]
};
const bindPostData1 = {
    bindPostArea: [
        {
            x: -85 + settings.BINDPOST_WIDTH / 2,
            y: 50 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT,
            isIgnore: true
        },
        {
            x: 45 + settings.BINDPOST_WIDTH / 2,
            y: 50 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        }
    ],
    adjList: {},
};
const bindPostData2 = {
    bindPostArea: [
        {
            x: -85 + settings.BINDPOST_WIDTH / 2,
            y: 50 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        },
        {
            x: -20 + settings.BINDPOST_WIDTH / 2,
            y: 50 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        }
    ],
    adjList: {},
};

//  大量程不带电阻
const elecApplianceData1 = {
    resistance: 0,
    maxPower: 500,
    getNextNode: 'twoPostNextNodeFunc',
    editInfo: [
        {
            label: '大量程内阻',
            key: 'resistance',
            value: 0,
            unit: 'Ω'
        }
    ]
};

// 小量程带小电阻
const elecApplianceData2 = {
    resistance: 0.01,
    maxPower: 500,
    getNextNode: 'twoPostNextNodeFunc',
    editInfo: [
        {
            label: '小量程内阻',
            key: 'resistance',
            value: 0.01,
            unit: 'Ω'
        }
    ]
};
function createAmmeterEntity(world) {
    const bindPostDataCopy1 = cloneDeep(bindPostData1);
    const bindPostDataCopy2 = cloneDeep(bindPostData2);

    // 创建两个电阻实体
    // 大量程 0 电阻
    const entity1 = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(nullRenderData))
        .addComponent(elecAppliance, cloneDeep(elecApplianceData1));
    // 小量程 小电阻
    const entity2 = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(nullRenderData))
        .addComponent(elecAppliance, cloneDeep(elecApplianceData2));

    const entity1PostName = `${entity1.id}_0`;
    const entity2PostName = `${entity2.id}_0`;

    bindPostDataCopy1.adjList[entity1PostName] = [entity2PostName];
    bindPostDataCopy2.adjList[entity2PostName] = [entity1PostName];

    entity1.addComponent(BindPostComponent, bindPostDataCopy1);
    entity2.addComponent(BindPostComponent, bindPostDataCopy2);
    // 创建一个电流表
    const entity3 = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(ammeterRenderData))
        .addComponent(movableComponent)
        .addComponent(ComplexEntityComponent, {contains: [entity1, entity2], type: elecType.Ammeter})
        .addComponent(AmmeterComponent);


    entity1.addComponent(ChildEntityComponent, {parent: entity3});
    entity2.addComponent(ChildEntityComponent, {parent: entity3});
    return entity3;
}

export default createAmmeterEntity;
