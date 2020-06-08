/**
 * @file 计算/更新 反应容器内化学物质
 */

import {System} from 'ecsy';
import ReactionVesselComponent from '@/components/chemistry/reactionVesselComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';
import IonComponent from '@/components/chemistry/ionComponent';

import store from '@/store/index';
import Entities from '@/entity/chemistry';
import {CHEMICAL_STATE} from '@/settings/chemistry';

import {calculateQuantityByCubage} from './common/calculateQuantity';

class CalculateChemicalSystem extends System {
    init() {
        console.log('计算物质成分系统init');
    }

    execute() {
        const {results} = this.queries.reactionVessel;
        results.forEach(entity => {
            const reactionVessel = entity.getMutableComponent(
                ReactionVesselComponent
            );
            const strcture = entity.getMutableComponent(StructureComponent);
            const {cubage} = reactionVessel;
            const {contains} = strcture;
            const availableCubage = this.calculateVesselCubage(cubage, contains);
            reactionVessel.availableCubage = availableCubage;
            this.calculateAirElement(availableCubage, contains);
        });
        // 只显示选中的那个容器
        const seletedEntity = store.state.chemistry.editEntity;
        if (seletedEntity) {
            this.showReactionVesselData(seletedEntity);
        }
        else {
            store.commit('updateShowData', ['暂时没有选择容器噢！']);
        }

    }

    /**
     * 计算容器中剩余可用容积
     * @param {*} vasselCubage 容器容积
     * @param {*} contains 容器内实体组合
     */
    calculateVesselCubage(vasselCubage, contains) {
        let availableCubage = vasselCubage;
        Object.values(contains).forEach(entity => {
            const chemical = entity.getMutableComponent(ChemicalPropertyComponent);
            const {chemicalFormula, cubage} = chemical;
            if (chemicalFormula !== 'O{2}' && chemicalFormula !== 'N{2}') {
                availableCubage -= cubage;
            }
        });
        return availableCubage > 0 ? availableCubage : 0;
    }


    /**
     * 计算空气中氧气和氮气的含量
     * @param {*} cubage 空气体积
     * @param {*} contains
     */
    calculateAirElement(cubage, contains) {
        // 氧气
        const oxygenCubage = cubage * 0.21;
        const {
            quality: oxygenQuality,
            amountOfSubstance: oxygenAmountOfSubstance
        } = calculateQuantityByCubage({
            chemicalFormula: 'O{2}',
            cubage: oxygenCubage
        });
        this.updateAirEntityData(
            {
                chemical: 'O{2}',
                cubage: oxygenCubage,
                quality: oxygenQuality,
                amountOfSubstance: oxygenAmountOfSubstance
            },
            contains
        );
        // 氮气
        const nitrogenCubage = cubage * 0.78;
        const {
            quality: nitrogenQuality,
            amountOfSubstance: nitrogenAmountOfSubstance
        } = calculateQuantityByCubage({
            chemicalFormula: 'N{2}',
            cubage: oxygenCubage
        });
        this.updateAirEntityData(
            {
                chemical: 'N{2}',
                cubage: nitrogenCubage,
                quality: nitrogenQuality,
                amountOfSubstance: nitrogenAmountOfSubstance
            },
            contains
        );
    }

    updateAirEntityData(param, contains) {
        const {chemical, cubage, quality, amountOfSubstance} = param;
        if (contains[chemical]) {
            const entity = contains[chemical];
            const property = entity.getMutableComponent(ChemicalPropertyComponent);
            property.cubage = cubage;
            property.quality = quality;
            property.amountOfSubstance = amountOfSubstance;
        }
        else {
            const entity = Entities[chemical]({
                cubage,
                quality,
                amountOfSubstance
            });
            contains[chemical] = entity;
        }
    }

    /**
     * 显示反应容器内物质成分
     * @param {*} entity 反应容器实体
     */
    // TODO
    showReactionVesselData(entity) {
        const containChemicalArr = [];
        const structure = entity.getMutableComponent(StructureComponent);
        if (!structure) {
            console.log('没有包含物质！');
            return false;
        }

        Object.values(structure.contains).forEach(item => {
            const prop = item.getMutableComponent(ChemicalPropertyComponent);
            if (prop && prop.chemicalState === CHEMICAL_STATE.AQUA) {
                containChemicalArr.push({
                    chemicalFormula: `${prop.chemicalFormula}(aq)`,
                    quality: `质量: ${(+prop.quality).toFixed(5)}g`,
                    amountOfSubstance: `物质的量: ${(+prop.amountOfSubstance).toFixed(
                        5
                    )}mol`
                });
            }
            if (prop && prop.chemicalState === CHEMICAL_STATE.GAS) {
                containChemicalArr.push({
                    chemicalFormula: `${prop.chemicalFormula}(g)`,
                    temperature: `温度: ${prop.temperature}℃`,
                    quality: `质量: ${(+prop.quality).toFixed(5)}g`,
                    cubage: `体积: ${(+prop.cubage).toFixed(5)}ml`,
                    amountOfSubstance: `物质的量: ${(+prop.amountOfSubstance).toFixed(
                        5
                    )}mol`
                });
            }
            if (prop && prop.chemicalState === CHEMICAL_STATE.LIQUID) {
                containChemicalArr.push({
                    chemicalFormula: `${prop.chemicalFormula}(l)`,
                    temperature: `温度: ${prop.temperature}℃`,
                    quality: `质量: ${(+prop.quality).toFixed(5)}g`,
                    cubage: `体积: ${(+prop.cubage).toFixed(5)}ml`,
                    amountOfSubstance: `物质的量: ${(+prop.amountOfSubstance).toFixed(
                        5
                    )}mol`
                });
            }
            if (prop && prop.chemicalState === CHEMICAL_STATE.SOLID) {
                containChemicalArr.push({
                    chemicalFormula: `${prop.chemicalFormula}(g)`,
                    temperature: `温度: ${prop.temperature}℃`,
                    quality: `质量: ${(+prop.quality).toFixed(5)}g`,
                    amountOfSubstance: `物质的量: ${(+prop.amountOfSubstance).toFixed(
                        5
                    )}mol`
                });
            }
            if (prop && item.getMutableComponent(IonComponent)) {
                containChemicalArr.push({
                    chemicalFormula: `${prop.chemicalFormula}`,
                    amountOfSubstance: `物质的量: ${(+prop.amountOfSubstance).toFixed(
                        5
                    )}mol`,
                    concentration: `浓度: ${(+prop.concentration).toFixed(5)}mol/L`
                });
            }
        });
        // console.log("containChemicalArr--", containChemicalArr);
        // TODO
        store.commit('updateShowData', containChemicalArr);
    }
}

CalculateChemicalSystem.queries = {
    reactionVessel: {
        components: [ReactionVesselComponent, StructureComponent],
        listen: {
            changed: [StructureComponent]
        }
    }
};

export default CalculateChemicalSystem;
