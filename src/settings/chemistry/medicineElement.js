import CHEMICAL_STATE from './chemicalState';

// 药品成分
const Medicine = {
    'NaOH_Aqua': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.LIQUID
            },
            {
                value: 'Na[+]',
                chemicalState: CHEMICAL_STATE.ION
            },
            {
                value: 'OH[-]',
                chemicalState: CHEMICAL_STATE.ION
            }
        ],
        concentration: 1.712
    },
    'HCl_Aqua': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.LIQUID
            },
            {
                value: 'H[+]',
                chemicalState: CHEMICAL_STATE.ION
            },
            {
                value: 'Cl[-]',
                chemicalState: CHEMICAL_STATE.ION
            }
        ],
        concentration: 2.468
    },
    'Na{2}CO{3}_Aqua': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.LIQUID
            },
            {
                value: 'Na[+]',
                count: 2,
                chemicalState: CHEMICAL_STATE.ION
            },
            {
                value: 'CO{3}[2-]',
                chemicalState: CHEMICAL_STATE.ION
            }
        ],
        concentration: 0.768
    },
    'Na{2}CO{3}_Aqua_1': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.LIQUID
            },
            {
                value: 'Na[+]',
                count: 2,
                chemicalState: CHEMICAL_STATE.ION
            },
            {
                value: 'CO{3}[2-]',
                chemicalState: CHEMICAL_STATE.ION
            }
        ],
        concentration: 1.536
    },
    'Na{2}CO{3}_Aqua_2': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.LIQUID
            },
            {
                value: 'Na[+]',
                count: 2,
                chemicalState: CHEMICAL_STATE.ION
            },
            {
                value: 'CO{3}[2-]',
                chemicalState: CHEMICAL_STATE.ION
            }
        ],
        concentration: 1
    },
    'CaCl{2}_Aqua': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.LIQUID
            },
            {
                value: 'Ca[2+]',
                chemicalState: CHEMICAL_STATE.ION
            },
            {
                value: 'Cl[-]',
                count: 2,
                chemicalState: CHEMICAL_STATE.ION
            }
        ],
        concentration: 0.788
    },
    'H{2}O_Liquid': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.LIQUID
            }
        ]
    },
    'H{2}O_Solid': {
        chemicals: [
            {
                value: 'H{2}O',
                chemicalState: CHEMICAL_STATE.SOLID
            }
        ]
    },
    'CO{2}_Gas': {
        chemicals: [
            {
                value: 'CO{2}',
                chemicalState: CHEMICAL_STATE.GAS
            }
        ]
    }
};

export default Medicine;
