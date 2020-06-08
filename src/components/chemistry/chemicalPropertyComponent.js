/**
 * 物质属性
 */

import {createComponentClass} from 'ecsy';

const ChemicalPropertyComponent = createComponentClass(
    {
    // 化学式
        chemicalFormula: {default: 'O{2}'},
        // 物质状态: gas,liquid,solid,aq溶液,ion离子
        chemicalState: {default: 'g'},
        // 温度(单位: 摄氏度)
        temperature: {default: 25},
        // TODO 压强(单位: Pa)
        pressure: {default: 101325},

        // 体积
        cubage: {default: 0},
        // 质量
        quality: {default: 0},
        // 物质的量
        amountOfSubstance: {default: 0},

        // 浓度(单位: mol/L)
        concentration: {default: 0},
        // 饱和度/最大溶解度
        maxSolubility: {default: 0}
    },
    'ChemicalPropertyComponent'
);

export default ChemicalPropertyComponent;
