// 开关
import settings from '@/settings/physical/settings';
import elecType from '@/settings/physical/elecType';
import cloneDeep from 'lodash/cloneDeep';
import RenderDataComponent from '@/components/physical/renderData';
import MovableComponent from '@/components/physical/movable';
import BindPostComponent from '@/components/physical/bindPost';
import ElecAppliance from '@/components/physical/elecAppliance';
import ComplexEntityComponent from '@/components/physical/complexEntity';
import ChildEntityComponent from '@/components/physical/childEntity';
import VoltmeterComponent from '@/components/physical/voltmeter';


const voltmeterRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/Voltmeter.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'Voltmeter_box.png',
            x: 400,
            y: 20,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'sprite',
                    img: 'Voltmeter_line.png',
                    x: 0,
                    y: 46,
                    angle: -25,
                    anchor: {x: 0.5, y: 1},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Voltmeter_hold.png',
                    x: 0,
                    y: 32,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Voltmeter_num.png',
                    x: -67,
                    y: 108,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Voltmeter_30.png',
                    x: 0,
                    y: 108,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'Voltmeter_5.png',
                    x: 67,
                    y: 108,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'label',
                    value: 'V1',
                    x: 0,
                    y: 158,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'label',
                    value: '0V',
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
    atlasUrl: '/texture/physical/Voltmeter.json',
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

//  大量程电阻 100000欧
const elecApplianceData1 = {
    resistance: Math.pow(10, 6),
    maxPower: 500,
    getNextNode: 'twoPostNextNodeFunc',
    editInfo: [
        {
            label: '大量程内阻',
            key: 'resistance',
            value: Math.pow(10, 6),
            unit: 'Ω'
        }
    ]
};

// 小量程电阻 100000欧
const elecApplianceData2 = {
    resistance: Math.pow(10, 6),
    maxPower: 500,
    getNextNode: 'twoPostNextNodeFunc',
    editInfo: [
        {
            label: '小量程内阻',
            key: 'resistance',
            value: Math.pow(10, 6),
            unit: 'Ω'
        }
    ]
};

function createVolmeterEntity(world) {
    const letbindPostData1Copy = cloneDeep(bindPostData1);
    const letbindPostData2Copy = cloneDeep(bindPostData2);
    // 创建两个电阻实体
    // 大量程
    const entity1 = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(nullRenderData))
        .addComponent(ElecAppliance, cloneDeep(elecApplianceData1));
    // 小量程
    const entity2 = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(nullRenderData))
        .addComponent(ElecAppliance, cloneDeep(elecApplianceData2));

    const entity1PostName = `${entity1.id}_0`;
    const entity2PostName = `${entity2.id}_0`;

    letbindPostData1Copy.adjList[entity1PostName] = [entity2PostName];
    letbindPostData2Copy.adjList[entity2PostName] = [entity1PostName];

    entity1.addComponent(BindPostComponent, letbindPostData1Copy);
    entity2.addComponent(BindPostComponent, letbindPostData2Copy);
    // 创建一个电压表
    const entity3 = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(voltmeterRenderData))
        .addComponent(MovableComponent)
        .addComponent(ComplexEntityComponent, {contains: [entity1, entity2], type: elecType.Voltmeter})
        .addComponent(VoltmeterComponent);

    entity1.addComponent(ChildEntityComponent, {parent: entity3});
    entity2.addComponent(ChildEntityComponent, {parent: entity3});
    return entity3;
}
export default createVolmeterEntity;
