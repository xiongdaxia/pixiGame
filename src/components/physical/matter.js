// 刚体组件

import {createComponentClass} from 'ecsy';
//  该组件用于刚体存放的信息
const matterDataComponent = createComponentClass(
    {
        // 用于存放生成的刚体body
        rigidBody: {default: {}},
        params: {default: {}},
        editInfo: {
            default:
            [
                {
                    label: 'x方向速度',
                    key: 'x',
                    value: 1,
                    unit: 'm/s'
                },
                {
                    label: 'y方向速度',
                    key: 'y',
                    value: 0,
                    unit: 'm/s'
                }
            ]
        }
    },
    'lineDataComponent'
);
export default matterDataComponent;
