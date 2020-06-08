/**
 * 化学反应公式
 * reactionRate 反应速率(mol/(L·s))
 */
import CHEMICAL_STATE from './chemicalState';

const REACTION_FORMULAR = [
    {
        reactant: ['Ca[2+]', 'CO{3}[2-]'],
        reactantCount: [1, 1],
        reactantState: [CHEMICAL_STATE.ION, CHEMICAL_STATE.ION],
        condition: [],
        product: ['CaCO{3}'],
        productCount: [1],
        productState: [CHEMICAL_STATE.SOLID],
        reactionRateCoefficient: 0.146
    // reactionRateTemperature: 25,
    // reactionRateConcentration: 25,
    // reactionRate: 0.02
    },
    {
        reactant: ['H[+]', 'CaCO{3}'],
        reactantCount: [2, 1],
        reactantState: [CHEMICAL_STATE.ION, CHEMICAL_STATE.SOLID],
        condition: [],
        product: ['CO{2}', 'H{2}O', 'Ca[2+]'],
        productCount: [1, 1, 1],
        productState: [
            CHEMICAL_STATE.GAS,
            CHEMICAL_STATE.LIQUID,
            CHEMICAL_STATE.ION
        ],
        reactionRate: 0.01
    },
    {
        reactant: ['H[+]', 'CO{3}[2-]'],
        reactantCount: [2, 1],
        reactantState: [CHEMICAL_STATE.ION, CHEMICAL_STATE.ION],
        condition: [],
        product: ['CO{2}', 'H{2}O'],
        productCount: [1, 1],
        productState: [
            CHEMICAL_STATE.GAS,
            CHEMICAL_STATE.LIQUID
        ],
        reactionRate: 0.01
    }
];

export default REACTION_FORMULAR;
