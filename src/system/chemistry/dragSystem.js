// 拖拽系统
import {System} from 'ecsy';
import {SimpleRope} from 'pixi.js';
import store from '@/store/index';

import MoveComponent from '@/components/chemistry/moveComponent';
import RenderComponent from '@/components/chemistry/renderComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
import RorateableComponent from '@/components/chemistry/rorateable';
import ActionComponent from '@/components/chemistry/actionComponent';
import CollisionableComponent from '@/components/chemistry/collisionable';

class DragSystem extends System {

    init() {
        console.log('拖拽系统开始执行了');
        // 当初拖动时候的初始位置
        this.originPos = {};
        // 记录锚点和当前位置的差异
        this.dXY = {x: 0, y: 0};
        // 动作管理单例
        this.actionSingleton = this.queries.actionSingleton.results[0];
    }

    execute() {
        // 为新增的绑定事件
        this.bindMoveEvent();
        // 移动组件数据改变
        this.moveDataChanged();
    }

    /**
     * @description 为元器件绑定拖拽事件和点击事件（掉编辑页面），且拖拽的时候线也跟着移动
     * @return {void}@memberof DragSystem
     */
    bindMoveEvent() {
        const {added} = this.queries.moveEntity;
        added.forEach(entry => {
            if (entry.getComponent(MoveComponent).flag) {
                // 渲染的实体
                const renderData = entry.getMutableComponent(RenderComponent);
                // eslint-disable-next-line prefer-destructuring
                const sprite = renderData.sprite;
                sprite.interactive = true;
                sprite.on('pointerdown', this.touchStart.bind(this));
                sprite.on('pointermove', this.touchMove.bind(this));
                sprite.on('pointerup', this.touchEnd.bind(this));
                sprite.on('pointerupoutside', this.touchEnd.bind(this));
            }
        });

    }

    moveDataChanged() {
        const {changed} = this.queries.moveEntity;
        if (changed.length > 0) {
            // do somthings
        }
    }

    /**
     * @description 取消移动事件
     * @param  {any} sprite 被取消的精灵
     * @return {void}@memberof DragSystem
     */
    cancelMoveEvent(sprite) {
        sprite.interactive = false;
        sprite.off('pointerdown', this.touchStart.bind(this));
        sprite.off('pointermove', this.touchMove.bind(this));
        sprite.off('pointerup', this.touchEnd.bind(this));
        sprite.off('pointerupoutside', this.touchEnd.bind(this));

        sprite.isTouching = false;
    }

    /**
     * @description 开始触碰
     * @param  {any} e Event对象
     * @return  null
     * @memberof DragSystem
     */
    touchStart(e) {
        // 阻止事件继续传递
        e.stopPropagationHint = true;

        const nowTime = Date.now();
        this.nowTime = nowTime;
        const target = e.currentTarget;
        if (target instanceof SimpleRope) {
            return false;
        }
        if (!target) {
            return false;
        }
        target.isTouching = true;
        // 数据初始化
        const {stage} = window.PIXI.app;
        const container = stage.children[0];

        const pos = container.toLocal(e.data.global);

        this.dXY.x = target.x - pos.x;
        this.dXY.y = target.y - pos.y;

        this.moveLineSpriteArr = [];
        this.originPos = target.position;
    }

    /**
     * @description 开始移动
     * @param  {any} e Event对象
     * @return  null
     * @memberof DragSystem
     */
    touchMove(e) {
        const target = e.currentTarget;
        if (target instanceof SimpleRope) {
            return false;
        }
        if (!target) {
            return false;
        }
        if (!target.isTouching) {
            return false;
        }


        const {stage} = window.PIXI.app;
        const container = stage.children[0];
        const pos = container.toLocal(e.data.global);

        // 根据移动数据限制位移
        const {limit} = target.entity.getComponent(MoveComponent);

        const deltaX = this.originPos.x - pos.x - this.dXY.x;
        const deltaY = this.originPos.y - pos.y - this.dXY.y;
        // 左右移动范围不能超过 limit.left 和 limit.right
        // 上下移动范围不能超过 limit.up 和limit.down
        if (limit.left >= 0 && deltaX < 0 && Math.abs(deltaX) < limit.left) {
            target.position.x = pos.x + this.dXY.x;
        }
        if (limit.right >= 0 && deltaX > 0 && Math.abs(deltaX) < limit.right) {
            target.position.x = pos.x + this.dXY.x;
        }
        if (limit.up >= 0 && deltaY > 0 && Math.abs(deltaY) < limit.up) {
            target.position.y = pos.y + this.dXY.y;
        }
        if (limit.down >= 0 && deltaY < 0 && Math.abs(deltaY) < limit.down) {
            target.position.y = pos.y + this.dXY.y;
        }
    }

    /**
     * @description 触碰结束
     * @param  {any} e Event对象
     * @return  null
     * @memberof DragSystem
     */
    touchEnd(e) {
        // e.stopPropagationHint = true;
        const target = e.currentTarget;
        if (!target) {
            return false;
        }

        target.isTouching = false;
        const endTime = Date.now();
        const delay = (endTime - this.nowTime) / 1000;
        if (delay < 0.25) {
            this.clickSprite(e, target);
        }

        // 碰撞检测，是否需要执行包含动画(只取一个碰撞)
        if (this.actionCheck(target)) {
            // 更新位置信息
            const renderData = target.entity.getMutableComponent(RenderComponent);
            renderData.postionJson[0].x = target.position.x;
            renderData.postionJson[0].y = target.position.y;
        }
        this.originPos = null;
    }

    /**
     * @description 点击精灵，调起旋转（TODO 编辑删除）选项
     * @param  {any} e Event对象
     * @param  {any} target 选择的目标精灵
     * @return {void}@memberof DragSystem
     */
    clickSprite(e, target) {
        // 禁用其他可旋转 启用当前实体可旋转
        const rorateEntities = this.queries.rorateEntity.results;
        rorateEntities.forEach(entity => {
            if (target.entity.id !== entity.id) {
                entity.getMutableComponent(RorateableComponent).isRoratable = false;
            }
        });
        if (target.entity.hasComponent(RorateableComponent)) {
            target.entity.getMutableComponent(RorateableComponent).isRoratable = true;
        }

        store.commit('updateEditEntity', target.entity);
    }


    /**
     * 判断两个矩形是否碰撞
     * @param {*} rectA 矩形A
     * @param {*} rectB 矩形B
     * @returns 0-无碰撞  1-A在B上方碰撞  2-B在A上方碰撞 3-其他
     */
    rectCollisionDetection(rectA, rectB) {
        let result = 0;
        if (
            rectA.bottom < rectB.bottom
            && rectA.bottom > rectB.top
            && rectB.top > rectA.top
            && rectA.left < rectB.right
            && rectA.right > rectB.left
        ) {
            result = 1;
        }
        else if (
            rectB.bottom < rectA.bottom
            && rectB.bottom > rectA.top
            && rectA.top > rectB.top
            && rectB.left < rectA.right
            && rectB.right > rectA.left
        ) {
            result = 2;
        }
        else if (
            rectA.x < rectB.x + rectB.width
            && rectA.x + rectA.width > rectB.x
            && rectA.y < rectB.y + rectB.height
            && rectA.height + rectA.y > rectB.y
        ) {
            result = 3;
        }
        return result;
    }

    /**
     * 碰撞检测及动作处理逻辑
     * @param {*} target 当前点击target
     * @returns {Boolean} true-无碰撞   false-碰撞
     */
    actionCheck(target) {
        const container = this.queries.container.results.filter(entity => entity.id !== target.entity.id);
        const currentRect = this.getSpriteVisibleBounds(target);
        let noneCollision = true;
        for (const entity of container) {
            const {sprite} = entity.getComponent(RenderComponent);
            if (!sprite) {
                return false;
            }
            const detectionRect = this.getSpriteVisibleBounds(sprite);
            const collisionType = this.rectCollisionDetection(currentRect, detectionRect);
            console.log(collisionType);
            // 动作在动作管理系统中处理，此处只负责检测碰撞类型，压入动作队列
            if (collisionType === 0) {
                // 无碰撞
            }
            else {
                // 有碰撞，区分碰撞类型
                let actionData;
                if (collisionType === 1) {
                    // currentRect在detectionRect上方碰撞
                    const id = `${target.entity.id}${entity.id}${1}`;
                    actionData = {id, A: entity, B: target.entity, collisionType: 1};
                }
                // 暂时只区分 上碰撞 和其他
                // else if (collisionType === 2) {
                //     // detectionRect在currentRect上方碰撞
                //     const id = entity.id + target.entity.id + 1;
                //     actionData = {id, A: target.entity, B: entity, collisionType: 1};
                // }
                else {
                    // 其他碰撞
                    const id = `${entity.id}${target.entity.id}${0}`;
                    actionData = {id, A: entity, B: target.entity, collisionType: 0};
                }
                // 入动作队列，等待动作系统处理
                const {actionQuene} = this.actionSingleton.getMutableComponent(ActionComponent);
                const thisActionIndex = actionQuene.findIndex(action => action.id === actionData.id);
                if (thisActionIndex === -1) {
                    actionQuene.push(actionData);
                }
                noneCollision = false;
                break;
            }
        }
        // 全部实体无碰撞，取消当前实体挂载与被挂载
        if (noneCollision) {
            this.cancelAllLoad(target.entity);
            this.moveLimit(target.entity, Infinity, Infinity, Infinity, Infinity);
            return true;
        }
        return false;
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

    /**
     * 取消传入实体的所有挂载情况，包括：它的挂载、它的被挂载
     * @param {*} entity 实体
     */
    cancelAllLoad(entity) {
        const {stage} = window.PIXI.app;
        const structData = entity.getMutableComponent(StructureComponent);
        const {currentParent, currentChild} = structData;
        if (currentParent) {
            const tempStructData = currentParent.getMutableComponent(StructureComponent);
            if (tempStructData.currentChild) {
                const {sprite} = tempStructData.currentChild.getComponent(RenderComponent);
                if (sprite) {
                    stage.children[0].addChild(sprite);
                    sprite.angle = 0;
                }
                tempStructData.currentChild = null;
            }
        }
        if (currentChild) {
            const tempStructData = currentChild.getMutableComponent(StructureComponent);
            const {sprite} = currentChild.getComponent(RenderComponent);
            if (sprite) {
                stage.children[0].addChild(sprite);
                sprite.angle = 0;
            }
            tempStructData.currentParent = null;
        }
        structData.currentChild = null;
        structData.currentParent = null;
    }

    /**
     * 获取精灵可视区域的矩形
     * @param {*} sprite 精灵
     * @returns {Object} 返回类似pixi矩形的对象
     */
    getSpriteVisibleBounds(sprite) {
        const rect = {width: sprite.width, height: sprite.height};
        const pos = sprite.position;

        rect.x = pos.x;
        rect.y = pos.y;
        rect.top = rect.y - (rect.height * sprite.pivot.y);
        rect.bottom = rect.y + (rect.height * (1 - sprite.pivot.y));
        rect.left = rect.x  - (rect.width * sprite.pivot.x);
        rect.right = rect.x + (rect.width * (1 - sprite.pivot.x));
        return rect;
    }
}

DragSystem.queries = {
    moveEntity: {
        components: [MoveComponent],
        listen: {
            added: true,
            changed: true
        }
    },
    rorateEntity: {
        components: [RorateableComponent, RenderComponent]
    },
    container: {
        components: [StructureComponent, RenderComponent, CollisionableComponent]
    },
    actionSingleton: {
        components: [ActionComponent]
    }
};

export default DragSystem;
