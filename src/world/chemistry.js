/**
 * @file 化学world
 */

import {Ticker} from 'pixi.js';
import {World} from 'ecsy';

import CalculateChemicalSystem from '@/system/chemistry/calculateChemicalSystem';
import ChemicalReactionSystem from '@/system/chemistry/chemicalReactionSystem';
import DissolutionSystem from '@/system/chemistry/dissolutionSystem';
import DragSystem from '@/system/chemistry/dragSystem';
import RenderSystem from '@/system/chemistry/renderSystem';
import RorateSystem from '@/system/chemistry/rorateSystem';
import VesselAppearanceSystem from '@/system/chemistry/vesselLiquidFlowSystem';
import VesselSedimentSystem from '@/system/chemistry/vesselSedimentSystem';
import ActionSystem from '@/system/chemistry/actionSystem';

import {Medicine, CHEMICAL_STATE} from '@/settings/chemistry';
import {
    calculateQuantityByQuality,
    calculateQuantityByCubage,
    calculateIonByCubageConcentration
} from '@/system/chemistry/common/calculateQuantity';
import {addChildEntitiesToPEntity} from '@/system/chemistry/common/updateParentContains';
import Entities from '@/entity/chemistry';
import Singletons from '@/entity/chemistry/singleton';

class ChemistryWorld {
    constructor() {
        this.world = null;
        this.ticker = null;

        this.init();
    }

    init() {
        this.creatWorld();
        this.addSingletons();
        this.addSystems();
        this.start();
    }

    creatWorld() {
        const world = new World();
        this.world = world;
    }

    addSingletons() {
        // 创建单例
        Object.values(Singletons).forEach(singleton => singleton(this.world));
    }

    addSystems() {
        this.world
            .registerSystem(RenderSystem)
            .registerSystem(DragSystem)
            .registerSystem(CalculateChemicalSystem)
            .registerSystem(ChemicalReactionSystem)
            .registerSystem(DissolutionSystem)
            .registerSystem(RorateSystem)
            .registerSystem(ActionSystem)
            .registerSystem(VesselAppearanceSystem)
            .registerSystem(VesselSedimentSystem);
    }

    start() {
        const ticker = new Ticker();
        this.ticker = ticker;

        ticker.add(delta => {
            this.world.execute(delta, delta);
        });

        ticker.start();

        // setInterval(() => {
        //     this.world.execute();
        // }, 1000);
    }

    createEnities(entities) {
        entities.forEach(item => {
            const entities = [];
            if (item.entityType === 'instrument') {
                // 仪器实体
                const entity = Entities[item.entityValue](item);
                entities.push(entity);
            }
            else if (item.entityType === 'medicine') {
                // 药品成分实体
                const {cubage, quality} = item;
                const {chemicals, concentration} = Medicine[item.entityValue];
                chemicals.forEach(chemi => {
                    const {value, count, chemicalState} = chemi;
                    let entity = null;
                    if (chemicalState === CHEMICAL_STATE.ION) {
                        const {amountOfSubstance} = calculateIonByCubageConcentration({
                            chemicalFormula: value,
                            cubage,
                            concentration: concentration * (count || 1)
                        });
                        entity = Entities[value]({
                            ...item,
                            amountOfSubstance,
                            concentration: concentration * (count || 1),
                            chemicalState
                        });
                    }
                    else if (chemicalState === CHEMICAL_STATE.LIQUID || chemicalState === CHEMICAL_STATE.GAS) {
                        const {quality, amountOfSubstance} = calculateQuantityByCubage({
                            chemicalFormula: value,
                            cubage
                        });
                        entity = Entities[value]({
                            ...item,
                            quality,
                            amountOfSubstance,
                            chemicalState
                        });
                    }
                    else if (chemicalState === CHEMICAL_STATE.SOLID) {
                        const {amountOfSubstance, cubage} = calculateQuantityByQuality({quality});
                        entity = Entities[value]({
                            ...item,
                            cubage,
                            amountOfSubstance,
                            chemicalState
                        });
                    }
                    else {
                        console.log('添加药品状态有误！');
                    }
                    entities.push(entity);
                });
            }
            else {
                console.log('entity type wrong!');
            }
            if (item.parentId >= 0) {
                this.updateParentEntity(item.parentId, entities);
            }
        });
    }

    /**
     * 向容器contains中添加物质
     * @param {x} parentId
     * @param {*} childEntities
     */
    updateParentEntity(parentId, childEntities) {
        // eslint-disable-next-line no-underscore-dangle
        const allEntitiese = this.world.entityManager._entities;
        const entity = allEntitiese.find(entity => entity.id === parentId);
        if (entity) {
            addChildEntitiesToPEntity(entity, childEntities);
        }
        else {
            console.warn('没有找到父实体！', parentId);
        }
    }

}

export default ChemistryWorld;
