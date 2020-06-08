/**
 * 物质体积、质量、物质的量之间的计算
 */

import {DENSITY, MOLAR_MASS} from '@/settings/chemistry';

// 根据质量，计算体积、物质的量(solid)
const calculateQuantityByQuality = function (param) {
    const {quality, chemicalFormula} = param;
    const amountOfSubstance = quality / MOLAR_MASS[chemicalFormula];
    const cubage = quality / DENSITY[chemicalFormula] * 1000;
    return {
        cubage,
        quality,
        amountOfSubstance
    };
};

// 根据体积，计算质量、物质的量(gas,liquid)
const calculateQuantityByCubage = function (param) {
    const {chemicalFormula, cubage} = param;
    const quality = (cubage / 1000) * DENSITY[chemicalFormula];
    const amountOfSubstance = quality / MOLAR_MASS[chemicalFormula];
    return {
        cubage,
        quality,
        amountOfSubstance
    };
};

// 根据浓度，计算物质的量(ion)
const calculateIonByCubageConcentration = function (param) {
    const {cubage, concentration} = param;
    const amountOfSubstance = (cubage / 1000) * concentration;
    return {
        amountOfSubstance,
        concentration
    };
};

// 根据物质的量，计算体积、质量(liquid,solid,gas)
const calculateQuantityByAmountOfSubstance = function (param) {
    const {chemicalFormula, amountOfSubstance} = param;
    const quality = amountOfSubstance * MOLAR_MASS[chemicalFormula];
    const cubage = quality / DENSITY[chemicalFormula];
    return {
        cubage,
        quality,
        amountOfSubstance
    };
};

export {
    calculateQuantityByQuality,
    calculateQuantityByCubage,
    calculateIonByCubageConcentration,
    calculateQuantityByAmountOfSubstance
};
