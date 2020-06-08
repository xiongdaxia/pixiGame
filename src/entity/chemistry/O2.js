/**
 * 氧气 O{2}
 */

import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';

import {CHEMICAL_STATE} from '@/settings/chemistry';

const createOxygenEntity = function (param) {
    return window.CHEMISTRY.world
        .createEntity()
        .addComponent(ChemicalPropertyComponent, {
            chemicalFormula: 'O{2}',
            state: param.state || CHEMICAL_STATE.GAS,
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

export default createOxygenEntity;
