/**
 * 二氧化碳 (CO{2})
 */

import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';

import {CHEMICAL_STATE} from '@/settings/chemistry';

const createCO2Entity = function (param) {

    return window.CHEMISTRY.world
        .createEntity()
        .addComponent(ChemicalPropertyComponent, {
            chemicalFormula: 'CO{2}',
            chemicalState: param.chemicalState || CHEMICAL_STATE.GAS,
            // 温度(单位: 摄氏度)
            temperature: param.temperature,
            // 压强(单位: Pa)
            pressure: param.pressure,
            // 体积
            cubage: param.cubage || 0,
            // 质量
            quality: param.quality || 0,
            // 物质的量
            amountOfSubstance: param.amountOfSubstance || 0
        });
};

export default createCO2Entity;
