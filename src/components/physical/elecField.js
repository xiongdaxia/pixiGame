//  电场
import {createComponentClass} from 'ecsy';

const ElecFieldComponent = createComponentClass(
    {
        // 电场强度
        E: {
            default: {
                x: 0,
                y: 1,
                z: 0,
                scale: 0.001,
                bounds: {
                    min: {x: -Infinity, y: -Infinity},
                    max: {x: Infinity, y: Infinity}
                }
            }
        },
        editInfo: {
            default:
            [
                {
                    label: 'x方向电场',
                    key: 'x',
                    value: 0,
                    unit: 'N/C'
                },
                {
                    label: 'y方向电场',
                    key: 'y',
                    value: 0.3,
                    unit: 'N/C'
                },
                {
                    label: 'z方向电场',
                    key: 'z',
                    value: 0,
                    unit: 'N/C'
                }
            ]
        }
    },
    'ElecFieldComponent'
);

export default ElecFieldComponent;
