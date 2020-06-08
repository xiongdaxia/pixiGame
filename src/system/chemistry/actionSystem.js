// 开关切换动画
import {System} from 'ecsy';
import ActionComponent from '@/components/chemistry/actionComponent';
import RenderComponent from '@/components/chemistry/renderComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
import MoveComponent from '@/components/chemistry/moveComponent';

import action from '@/settings/chemistry/action/action';

class ActionSystem extends System {

    init() {
        console.log('动作管理系统开始执行了');
    }

    execute() {
        this.excuteAction();
    }

    excuteAction() {
        if (this.queries.actionSingleton.changed.length <= 0) {
            return false;
        }
        const singleton = this.queries.actionSingleton.changed[0];
        const {actionQuene} = singleton.getMutableComponent(ActionComponent);
        console.log('待执行动作队列', actionQuene);
        while (actionQuene.length > 0) {
            const action = actionQuene.pop();
            // 进行挂载检测 并调用对应动作
            const {A, B, collisionType} = action;
            const structDataA = A.getComponent(StructureComponent);
            const structDataB = B.getComponent(StructureComponent);
            // 可挂载且未被挂载
            if (structDataA.loadable.includes(structDataB.type)) {
                if (collisionType === 1) {
                    // 上碰撞 B装入A
                    this.loadChild(A, B);
                }
                else if (collisionType === 0) {
                    // 其他位置碰撞 B向A靠边
                    this.combination(A, B);
                }
            }
        }
    }

    // TODO 将这些动作封装起来，放到一个动作列表里，未来根据容器组件内存储的信息执行对应动作

    /**
     * 父子容器放入
     * @param {*} parent 父容器
     * @param {*} child 子容器
     */
    loadChild(parent, child) {
        return new Promise(resolve => {
            // 把子容器挂在父容器currentChild上，父容器挂载到子容器的currentParent上
            const parentStructData = parent.getMutableComponent(StructureComponent);
            const childStructData = child.getMutableComponent(StructureComponent);
            parentStructData.currentChild = child;
            childStructData.currentParent = parent;
            const childSprite = child.getComponent(RenderComponent).sprite;
            const parentSprite = parent.getComponent(RenderComponent).sprite;
            // 把子精灵挂载在父上
            parentSprite.addChild(childSprite);

            // 执行移动动画
            const targetPos = {
                x: parentSprite.width + childSprite.width / 2,
                y: -parentSprite.height
            };

            const jumpData = {target: childSprite, pos: targetPos, height: 0, duration: 300};
            const rorateData = {target: childSprite, angle: 27, duration: 300, easing: 'Linear'};
            Promise.all([action.runMoveTo(jumpData), action.runAngleTo(rorateData)])
                .then(() => {
                    // 限制子容器移动范围：只允许向上移动
                    this.moveLimit(child, Infinity, 0, 0, 0);
                    resolve();
                });
        });
    }

    /**
     * B向A的右边对齐
     * @param {*} A 实体A
     * @param {*} B 实体B
     */
    combination(A, B) {
        return new Promise((resolve, reject) => {
            // 把子容器挂在父容器currentChild上，父容器挂载到子容器的currentParent上
            const AStructData = A.getMutableComponent(StructureComponent);
            const BStructData = B.getMutableComponent(StructureComponent);
            AStructData.currentChild = B;
            BStructData.currentParent = A;
            const ASprite = A.getComponent(RenderComponent).sprite;
            const BSprite = B.getComponent(RenderComponent).sprite;

            // 执行移动动画
            const deltaX = ASprite.width * Math.cos(ASprite.rotation);
            let deltaY;
            if (ASprite.angle >= 0 && ASprite.angle <= 45) {
                deltaY = ASprite.width * Math.sin(ASprite.rotation);
            }
            else if (ASprite.angle < 0 && ASprite.angle >= -45) {
                deltaY = -ASprite.width * Math.sin(-ASprite.rotation);
            }
            else {
                reject(new Error('父容器旋转角度过大'));
            }
            const targetPos = {
                x: ASprite.x + deltaX,
                y: ASprite.y + deltaY
            };

            const moveData = {target: BSprite, pos: targetPos, height: 0, duration: 300};
            action.runMoveTo(moveData).then(() => resolve());
        });
    }

    /**
     * 上下左右移动限制，-1为不限制
     * @param {Entity} entity 限制的实体
     * @param {Number} up 上限
     * @param {Number} down 下限
     * @param {Number} left 左限
     * @param {Number} right 右限
     */
    moveLimit(entity, up, down, left, right) {
        up = (up >= 0) ? up : Infinity;
        down = (down >= 0) ? down : Infinity;
        left = (left >= 0) ? left : Infinity;
        right = (right >= 0) ? right : Infinity;
        entity.getMutableComponent(MoveComponent).limit = {up, down, left, right};
    }

}

ActionSystem.queries = {
    actionSingleton: {
        components: [ActionComponent],
        listen: {
            changed: true
        }
    }
};

export default ActionSystem;
