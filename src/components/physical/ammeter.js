// 是否是电流表

import {createComponentClass} from 'ecsy';

const AmmeterComponent = createComponentClass(
    {
        // 示数
        current: {default: 0},
        // 状态 0-正常 1-烧毁  2-错误
        status: {default: 0},
        // 当前量程 -1未接线    0 0-0.6A    1 0-3A
        rangeType: {default: -1}
    },
    'AmmeterComponent'
);
export default AmmeterComponent;

