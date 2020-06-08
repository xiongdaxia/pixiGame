// 离子化合物 电离 成分
const IONIZATION_LIST = {
    'NaOH': {
        product: ['Na[+]', 'OH[-]'],
        count: [1, 1]
    },
    'HCl': {
        product: ['H[+]', 'Cl[-]'],
        count: [1, 1]
    },
    'NaCl': {
        product: ['Na[+]', 'Cl[-]'],
        count: [1, 1]
    },
    'CaCO{3}': {
    // 溶剂
        solvent: 'H{2}O',
        product: ['Ca[2+]', 'CO{3}[2-]'],
        count: [1, 1]
    }
};

export default IONIZATION_LIST;
