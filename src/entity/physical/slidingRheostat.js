// 开关
import cloneDeep from 'lodash/cloneDeep';
import RenderDataComponent from '@/components/physical/renderData';
import MovableComponent from '@/components/physical/movable';
import BindPostComponent from '@/components/physical/bindPost';
import ElecAppliance from '@/components/physical/elecAppliance';
import SlidingRheostatComponent from '@/components/physical/slidingRheostat';
import ComplexEntityComponent from '@/components/physical/complexEntity';
import ChildEntityComponent from '@/components/physical/childEntity';

import settings from '@/settings/physical/settings';
import elecType from '@/settings/physical/elecType';

const renderData = {
    maskPic: 'slidingRheostat_1.png',
    //  图集信息
    atlasUrl: '/texture/physical/SlidingRheostat.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'slidingRheostat_box.png',
            x: -160,
            y: 0,
            angle: 0,
            anchor: {x: 0.5, y: 0.5},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    type: 'sprite',
                    img: 'slidingRheostat_2.png',
                    x: -2,
                    y: 20,
                    angle: 0,
                    anchor: {x: 0.5, y: 1},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'sprite',
                    img: 'slidingRheostat_1.png',
                    x: -2,
                    y: 20,
                    angle: 0,
                    anchor: {x: 0.5, y: 1},
                    scale: {x: 1, y: 1},
                    alpha: 0
                },
                {
                    type: 'sprite',
                    img: 'slidingRheostat_3.png',
                    x: 160,
                    y: -68,
                    angle: 0,
                    anchor: {x: 0.5, y: 0.5},
                    scale: {x: 1, y: 1},
                    alpha: 1
                },
                {
                    type: 'label',
                    value: 'R2(0-10 Ω)',
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
const nullRenderData = {
    //  图集信息
    atlasUrl: '/texture/physical/SlidingRheostat.json',
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
const bindPostDataLeft = {
    bindPostArea: [
        {
            x: -235 + settings.BINDPOST_WIDTH / 2,
            y: -95 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        },
        {
            x: -210 + settings.BINDPOST_WIDTH / 2,
            y: -14 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        }
    ],
    adjList: {},
};
const bindPostDataRight = {
    bindPostArea: [
        {
            x: 190 + settings.BINDPOST_WIDTH / 2,
            y: -95 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        },
        {
            x: 165 + settings.BINDPOST_WIDTH / 2,
            y: -14 + settings.BINDPOST_HEIGHT / 2,
            w: settings.BINDPOST_WIDTH,
            h: settings.BINDPOST_HEIGHT
        }
    ],
    adjList: {},
};

const slidingRheostatData = {
    // 最大 最小阻值
    maxResistance: 10,
    minResistance: 0,
    // 当前阻值百分比，规定：左->右  0->100%
    percent: 100,
    // 滑块精灵图片名
    sliderPicName: 'slidingRheostat_3.png'
};

const elecApplianceData = {
    status: 0,
    postNum: 2,
    resistance: slidingRheostatData.maxResistance,
    power: 0,
    ratedPower: Infinity,
    maxPower: Infinity,
    voltage: 0,
    isDistinguish: false,
    type: null,
    getNextNode: 'twoPostNextNodeFunc',
    editInfo: [
        {
            label: '电阻值',
            key: 'resistance',
            value: 0
        }
    ]
};

function createSlidingRheostatEntity(world) {
    const bindPostDataLeftCopy = cloneDeep(bindPostDataLeft);
    const bindPostDataRightCopy = cloneDeep(bindPostDataRight);

    const elecApplianceDataCopy1 = cloneDeep(elecApplianceData);
    const elecApplianceDataCopy2 = cloneDeep(elecApplianceData);

    const childLeft = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(nullRenderData))
        .addComponent(ElecAppliance, elecApplianceDataCopy1);

    elecApplianceDataCopy2.resistance = 0;
    const childRight = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(nullRenderData))
        .addComponent(ElecAppliance, elecApplianceDataCopy2);

    const leftPostName = `${childLeft.id}_0`;
    const rightPostName = `${childRight.id}_0`;

    bindPostDataLeftCopy.adjList[leftPostName] = [rightPostName];
    bindPostDataRightCopy.adjList[rightPostName] = [leftPostName];

    childLeft.addComponent(BindPostComponent, bindPostDataLeftCopy);
    childRight.addComponent(BindPostComponent, bindPostDataRightCopy);

    const parent = world
        .createEntity()
        .addComponent(RenderDataComponent, cloneDeep(renderData))
        .addComponent(SlidingRheostatComponent, cloneDeep(slidingRheostatData))
        .addComponent(MovableComponent)
        .addComponent(ComplexEntityComponent, {
            contains: [childLeft, childRight], type: elecType.SlidingRheostat
        });

    childLeft.addComponent(ChildEntityComponent, {parent});
    childRight.addComponent(ChildEntityComponent, {parent});
    return parent;
}

export default createSlidingRheostatEntity;
