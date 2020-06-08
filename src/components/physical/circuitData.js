// 电路信息单例
import {SystemStateComponent} from 'ecsy';

class CircuitDataComponent extends SystemStateComponent {
    constructor() {
        super();
        // 用于circuit System 中判断电路是否需要重新计算通路
        this.isChange = false;

        // 剩余允许添加节点数量
        this.maxBatteryNum = 1;
        this.maxEntityNum = 100;
    }
}
export default CircuitDataComponent;
