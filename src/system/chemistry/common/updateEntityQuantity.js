/**
 * 创建实体/更新实体中物质量
 */

import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';
import Entities from '@/entity/chemistry';
import {CHEMICAL_STATE} from '@/settings/chemistry';
import {calculateQuantityByAmountOfSubstance} from './calculateQuantity';

const updateEntityQuantity = function (param = {}) {
    const {entity, changeSubstance, solutionCubage} = param;
    const chemical = entity.getMutableComponent(ChemicalPropertyComponent);
    const {chemicalFormula, chemicalState} = chemical;
    switch (chemicalState) {
        case CHEMICAL_STATE.ION: {
            chemical.amountOfSubstance += changeSubstance;
            chemical.concentration
        = chemical.amountOfSubstance / (solutionCubage / 1000);
            break;
        }
        default: {
            chemical.amountOfSubstance += changeSubstance;
            const {quality, cubage} = calculateQuantityByAmountOfSubstance({
                amountOfSubstance: changeSubstance,
                chemicalFormula
            });
            chemical.quality += quality;
            chemical.cubage += cubage;
            break;
        }
    }
};

const createEntityBySubstance = function (param = {}) {
    const {
        chemicalFormula,
        chemicalState,
        amountOfSubstance,
        solutionCubage
    } = param;
    let entity = null;
    switch (chemicalState) {
        case CHEMICAL_STATE.ION: {
            entity = Entities[chemicalFormula]({
                amountOfSubstance,
                concentration: amountOfSubstance / (solutionCubage / 1000)
            });
            break;
        }
        default: {
            const {quality, cubage} = calculateQuantityByAmountOfSubstance({
                chemicalFormula,
                amountOfSubstance
            });
            entity = Entities[chemicalFormula]({
                quality,
                amountOfSubstance,
                cubage
            });
            break;
        }
    }
    return entity;
};

export {updateEntityQuantity, createEntityBySubstance};
