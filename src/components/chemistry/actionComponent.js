// 动作管理组件
import {createComponentClass} from 'ecsy';

const ActionComponent = createComponentClass(
    {
        // 待执行动作的队列
        actionQuene: {default: []}
    },
    'ActionComponent'
);

export default ActionComponent;
