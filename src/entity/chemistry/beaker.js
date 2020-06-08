/**
 * 烧杯
 */
import {env} from '@/environment';
import RenderComponent from '@/components/chemistry/renderComponent';
import ReactionVesselComponent from '@/components/chemistry/reactionVesselComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
import MoveComponent from '@/components/chemistry/moveComponent';
import RorateComponent from '@/components/chemistry/rorateable';
import CollisionableComponent from '@/components/chemistry/collisionable';

import containerTypeList from '@/settings/chemistry/containerTypeList';
import cloneDeep from 'lodash/cloneDeep';

const renderData = {
    //  图集信息
    atlasUrl: '/texture/chemistry/beaker.png',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: `${env.publicPath}/texture/chemistry/beaker.png`,
            x: 50,
            y: 100,
            angle: 0,
            anchor: {x: 0, y: 0},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    name: 'container',
                    type: 'container',
                    x: 35,
                    y: 0,
                    scale: {x: 1, y: 1},
                    initialWidth: 180,
                    initialHeight: 240,
                    // children: [
                    //     {
                    //         id: 87674,
                    //         name: 'maskGraphic',
                    //         type: 'rectGraphics',
                    //         x: 0,
                    //         y: 0,
                    //         scale: {x: 1, y: 1},
                    //         blockColor: 0x9400D3,
                    //         width: 180,
                    //         height: 240,
                    //     },
                    // ]
                }
            ]
        }
    ]
};

const structureData = {
    type: containerTypeList.beaker,
    loadable: [containerTypeList.bigTestTube],
    currentChild: null,
    currentParent: null,
    contains: {}
};


const createBeakerEntity = function (param) {
    // createEntity参数为name属性值，id为world系统自动赋值
    return window.CHEMISTRY.world
        .createEntity(param.name || '')
        .addComponent(RenderComponent, cloneDeep(renderData))
        .addComponent(ReactionVesselComponent, {
            cubage: 250,
            availableCubage: 250,
            width: param.width,
            height: param.height
        })
        .addComponent(MoveComponent,
            {
                flag: true,
                limit: {up: Infinity, down: Infinity, left: Infinity, right: Infinity}
            })
        .addComponent(StructureComponent, cloneDeep(structureData))
        .addComponent(RorateComponent)
        .addComponent(CollisionableComponent);
};

export default createBeakerEntity;
