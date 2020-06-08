/**
 * 大试管
 */
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
    atlasUrl: '/texture/chemistry/bigTestTube.json',
    //  层级信息及布局
    postionJson: [
        {
            type: 'sprite',
            img: 'tubeBody.png',
            x: 100,
            y: 100,
            angle: 0,
            anchor: {x: 0, y: 0},
            scale: {x: 1, y: 1},
            alpha: 1,
            children: [
                {
                    name: 'container',
                    type: 'container',
                    x: 5,
                    y: 0,
                    scale: {x: 1, y: 1},
                    initialWidth: 65,
                    initialHeight: 520,
                }
            ]
        }
    ]
};

const structureData = {
    type: containerTypeList.bigTestTube,
    loadable: [],
    currentChild: null,
    currentParent: null,
    contains: {}
};

const createBigTubeEntity = function (param) {
    return window.CHEMISTRY.world
        .createEntity()
        .addComponent(RenderComponent, cloneDeep(renderData))
        .addComponent(ReactionVesselComponent, {
            cubage: 100,
            availableCubage: 100,
            width: param.width,
            height: param.height
        })
        .addComponent(MoveComponent, {
            flag: true,
            limit: {up: Infinity, down: Infinity, left: Infinity, right: Infinity}
        })
        .addComponent(StructureComponent, cloneDeep(structureData))
        .addComponent(RorateComponent)
        .addComponent(CollisionableComponent);
};

export default createBigTubeEntity;
