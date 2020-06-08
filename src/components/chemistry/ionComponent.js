/**
 * 离子组件
 */

import {createComponentClass} from 'ecsy';

const IonComponent = createComponentClass(
    {
    // 得失电子状态
        electronicState: {default: 'get'},
        // 得失电子数量
        electronicCount: {default: 0}
    // H离子有ph值等
    },
    'IonComponent'
);

export default IonComponent;
