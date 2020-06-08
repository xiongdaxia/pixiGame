// 电器通用组件

import {createComponentClass} from 'ecsy';

const ElecApplianceComponent = createComponentClass(
    {
        // 状态：0 正常 1 断路 2 短路
        status: {default: 0},
        // 接线柱数量默认2
        postNum: {default: 2},
        // 阻值 单位欧姆
        resistance: {default: 1},
        // 当前功率
        power: {default: 0},
        // 额定功率
        ratedPower: {default: 100},
        // 最大功率
        maxPower: {default: 120},
        // 电压，一般情况下为当前器件两端电压，当type = 电源时，为电源电动势
        voltage: {default: 0},
        // 电流
        current: {default: 0},
        // 是否区分正负极
        isDistinguish: {default: false},
        // 类型 ElecType为枚举
        type: {default: null},
        // getNextNode()方法，在Entity 声明时应当重写这个方法！！
        // TODO Component 中不应该有方法，需要找一个更合适的地方
        getNextNode: {default: null},
        // 编辑的所有信息
        editInfo: {default: []}
    },
    'ElecApplianceComponent'
);

export default ElecApplianceComponent;
