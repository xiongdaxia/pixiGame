//  磁场
import {createComponentClass} from 'ecsy';

const MagneticFieldComponent = createComponentClass(
    {
        // 磁场强度
        B: {
            default: {
                x: 0,
                y: 0,
                // 垂直向下
                z: -1,
                scale: 0.001,
                bounds: {
                    min: {x: -Infinity, y: -Infinity},
                    max: {x: Infinity, y: Infinity}
                }
            }
        },
        editInfo: {
            default: [
                {
                    label: 'x磁场强度',
                    key: 'x',
                    value: 0,
                    unit: 'T'
                },
                {
                    label: 'y磁场强度',
                    key: 'y',
                    value: 0,
                    unit: 'T'
                },
                {
                    label: 'z磁场强度',
                    key: 'z',
                    value: -0.4368,
                    unit: 'T'
                }
            ]
        }
    },
    'MagneticFieldComponent'
);

export default MagneticFieldComponent;
