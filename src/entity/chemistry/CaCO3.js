/**
 * 碳酸钙 (CaCO{3})
 */

import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';

import {CHEMICAL_STATE} from '@/settings/chemistry';

const createCaCO3Entity = function (param) {

    return window.CHEMISTRY.world
        .createEntity()
        .addComponent(ChemicalPropertyComponent, {
            chemicalFormula: 'CaCO{3}',
            chemicalState: param.chemicalState || CHEMICAL_STATE.SOLID,
            // 温度(单位: 摄氏度)
            temperature: param.temperature,
            // 压强(单位: Pa)
            pressure: param.pressure,
            // 体积
            cubage: param.cubage || 0,
            // 质量
            quality: param.quality || 0,
            // 物质的量
            amountOfSubstance: param.amountOfSubstance || 0,
            // 饱和度/最大溶解度
            maxSolubility: 0.00015
        });
};

export default createCaCO3Entity;
