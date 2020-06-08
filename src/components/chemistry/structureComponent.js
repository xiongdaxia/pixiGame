/**
 * 结构组件-包含的物质成分
 */

import {createComponentClass} from 'ecsy';

// 容器等组成
const StructureComponent = createComponentClass(
    {
        // 容器类型
        type: {default: ''},
        // 可装进该容器的容器类型
        loadable: {default: []},
        // 当前装载的容器
        currentChild: {default: null},
        // 当前装载到某容器
        currentParent: {default: null},
        // 包含的物质成分
        contains: {default: {}}

    },
    'StructureComponent'
);

export default StructureComponent;
