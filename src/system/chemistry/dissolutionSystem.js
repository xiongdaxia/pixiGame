/**
 * @file 溶解系统-分子溶解、离子溶解
 */

import {System} from 'ecsy';
import ReactionVesselComponent from '@/components/chemistry/reactionVesselComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
// import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';

// import {IONIZATION_LIST, CHEMICAL_STATE} from '@/settings/chemistry';
// import {
//     updateEntity,
//     createEntityBySubstance
// } from './common/updateEntityQuantity';

class DissolutionSystem extends System {
    init() {
        console.log('溶解 系统init');
    }

    execute() {
        // const entities = this.queries.Dissolution.results;
        // entities.forEach(entity => {
        //     const vessel = entity.getMutableComponent(ReactionVesselComponent);
        //     const {cubage, availableCubage} = vessel;
        //     const structure = entity.getMutableComponent(StructureComponent);
        //     const {contains} = structure;
        //     const solutionCubage = cubage - availableCubage;
        //     // 判断容器中是否有液体
        //     if (solutionCubage > 0) {
        //         Object.values(contains).forEach(conEntity => {
        //             const conChemical = conEntity.getMutableComponent(
        //                 ChemicalPropertyComponent
        //             );
        //             const {chemicalFormula, maxSolubility} = conChemical;
        //             // 溶解产物-计算溶解产物的溶解量是否超过饱和度
        //             const isDissolving = this.isGoingDissolve(
        //                 chemicalFormula,
        //                 contains,
        //                 solutionCubage,
        //                 maxSolubility
        //             );
        //             // 可以溶解, 更新溶解物和产物物理量
        //             if (isDissolving) {
        //                 const dissoluteSubstance = maxSolubility * (solutionCubage / 1000);
        //                 // 溶解原物质
        //                 updateEntity({
        //                     entity: conEntity,
        //                     changeSubstance: -dissoluteSubstance,
        //                     solutionCubage
        //                 });
        //                 // 溶解产物
        //                 const {product: products, count: counts} = IONIZATION_LIST[
        //                     chemicalFormula
        //                 ];
        //                 products.forEach((pro, index) => {
        //                     if (contains[pro]) {
        //                         updateEntity({
        //                             entity: contains[pro],
        //                             changeSubstance: dissoluteSubstance * counts[index],
        //                             solutionCubage
        //                         });
        //                     }
        //                     else {
        //                         const newEntity = createEntityBySubstance({
        //                             chemicalFormula: pro,
        //                             chemicalState: CHEMICAL_STATE.ION,
        //                             amountOfSubstance: dissoluteSubstance * counts[index],
        //                             solutionCubage
        //                         });
        //                         contains[pro] = newEntity;
        //                     }
        //                 });
        //             }
        //         });
        //     }
        // });
    }


    /**
     * 计算溶解产物的溶解量是否超过饱和度
     * @param {*} chemicalFormula
     * @param {*} contains
     * @param {*} solutionCubage
     * @param {*} maxSolubility
     */
    // isGoingDissolve(chemicalFormula, contains, solutionCubage, maxSolubility) {
    //     if (
    //         !IONIZATION_LIST[chemicalFormula]
    //   || !contains[IONIZATION_LIST[chemicalFormula].solvent]
    //     ) {
    //         return false;
    //     }
    //     let isOverSolubility = true;
    //     let hasAllProduct = true;
    //     const {product: products, count: counts} = IONIZATION_LIST[
    //         chemicalFormula
    //     ];
    //     products.forEach((prod, index) => {
    //         const prodEntity = contains[prod];
    //         if (prodEntity) {
    //             const chemical = prodEntity.getMutableComponent(
    //                 ChemicalPropertyComponent
    //             );
    //             let {amountOfSubstance} = chemical;
    //             amountOfSubstance = amountOfSubstance / counts[index];
    //             const curSolubility = amountOfSubstance / (solutionCubage / 1000);
    //             if (curSolubility >= maxSolubility) {
    //                 isOverSolubility = false;
    //             }
    //         }
    //         else {
    //             hasAllProduct = false;
    //         }
    //     });
    //     return !(hasAllProduct && isOverSolubility);
    // }
}

DissolutionSystem.queries = {
    Dissolution: {
        components: [ReactionVesselComponent, StructureComponent]
    }
};

export default DissolutionSystem;
