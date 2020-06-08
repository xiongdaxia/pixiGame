/**
 * 氯离子 Cl[-]
 */

import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';
import IonComponent from '@/components/chemistry/ionComponent';

import {CHEMICAL_STATE} from '@/settings/chemistry';

const createIonClEntity = function (param) {

    return window.CHEMISTRY.world
        .createEntity()
        .addComponent(ChemicalPropertyComponent, {
            chemicalFormula: 'Cl[-]',
            chemicalState: CHEMICAL_STATE.ION,
            // 温度(单位: 摄氏度)
            temperature: param.temperature,
            // 物质的量
            amountOfSubstance: param.amountOfSubstance,
            // 浓度
            concentration: param.concentration
        })
        .addComponent(IonComponent, {
            // 得失电子状态
            electronicState: 'lose',
            // 得失电子数量
            electronicCount: 1
        });
};

export default createIonClEntity;
