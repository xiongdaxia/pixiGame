
import {createComponentClass} from 'ecsy';

const VoltmeterComponent = createComponentClass(
    {
        // 示数
        voltage: {default: 0},
        // 状态 0-正常 1-烧毁  2-错误
        status: {default: 0},
        // 当前量程 -1未接线    0 0-3V    1 0-15V
        rangeType: {default: -1}
    },
    'VoltmeterComponent'
);
export default VoltmeterComponent;
