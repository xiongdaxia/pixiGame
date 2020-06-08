/**
 * 反应容器
 */

import {createComponentClass} from 'ecsy';

const ReactionVesselComponent = createComponentClass(
    {
    // 容积
        cubage: {default: 0},
        // 剩余容积
        availableCubage: {default: 0},
        // 宽
        width: {default: 0},
        // 高
        height: {default: 0},
        // 温度
        temperature: {default: 25}
    },
    'ReactionVesselComponent'
);

export default ReactionVesselComponent;
