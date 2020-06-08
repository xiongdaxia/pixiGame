// 电复杂组件

import {createComponentClass} from 'ecsy';
//  该组件存放接线柱的连线生效范围
const ComplexEntityComponent = createComponentClass(
    {
    //  包含的子节点
        contains: {default: []},
        // 器件类型
        type: {default: null}
    },
    'ComplexEntityComponent'
);
export default ComplexEntityComponent;
