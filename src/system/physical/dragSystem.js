// 拖拽系统
import {System} from 'ecsy';
import {SimpleRope} from 'pixi.js';
import cloneDeep from 'lodash/cloneDeep';
import store from '@/store/index';
import {Body} from 'matter-js';


import MovableComponent from '@/components/physical/movable';
import RenderDataComponent from '@/components/physical/renderData.js';
import LineDataComponent from '@/components/physical/line';
import matterDataComponent from '@/components/physical/matter.js';

import ElecFieldComponent from '@/components/physical/elecField';
import MagneticFieldComponent from '@/components/physical/magneticField';


class DragSystem extends System {

    init() {
        console.log('拖拽系统开始执行了');
        // 当次拖拽，需要移动的线精灵数组
        this.moveLineSpriteArr = [];
        // 当初拖动时候的初始位置
        this.originPos = {};
        // 记录锚点和当前位置的差异
        this.dXY = {x: 0, y: 0};
    }

    execute() {
        this.bindMoveEvent();
    }

    /**
     * @description 为元器件绑定拖拽事件和点击事件（掉编辑页面），且拖拽的时候线也跟着移动
     * @return {void}@memberof DragSystem
     */
    bindMoveEvent() {
        const {added} = this.queries.moveEntity;
        added.forEach(entry => {
            let sprite;
            // 渲染的实体
            if (entry.hasComponent(RenderDataComponent)) {
                const renderData = entry.getMutableComponent(RenderDataComponent);
                // eslint-disable-next-line prefer-destructuring
                sprite = renderData.sprite;
            }
            // 特例：线实体
            if (entry.hasComponent(LineDataComponent)) {
                const renderData = entry.getMutableComponent(LineDataComponent);
                // eslint-disable-next-line prefer-destructuring
                sprite = renderData.sprite;
            }
            sprite.interactive = true;
            sprite.on('pointerdown', this.touchStart.bind(this));
            sprite.on('pointermove', this.touchMove.bind(this));
            sprite.on('pointerup', this.touchEnd.bind(this));
            sprite.on('pointerupoutside', this.touchEnd.bind(this));
        });

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
        this.originPos = pos;
        const dragEntityID = target.entity.id;

        const {results} = this.queries.lineEntitys;
        // 将线的初始points存起来，并判断连接顺序
        results.forEach(entity => {
            const data = entity.getMutableComponent(LineDataComponent);
            if (!data.connectEntityID) {
                return false;
            }
            const index = data.connectEntityID.indexOf(dragEntityID);
            if (index !== -1) {
                const originPos = cloneDeep(data.sprite.geometry.points);
                // 顺序还是倒序
                data.sprite.order = index === 1 ? 'order' : 'reverse';
                // 线连接到同一实体上
                if (data.connectEntityID.length >= 2 && data.connectEntityID[0] === data.connectEntityID[1]) {
                    data.sprite.order = 'equal';
                }
                data.sprite.originPos = originPos;
                this.moveLineSpriteArr.push(data);
            }
        });
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

        target.position = {x: pos.x + this.dXY.x, y: pos.y + this.dXY.y};

        if (this.moveLineSpriteArr.length !== 0) {
            this.dynamicChangeLine(pos);
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
        if (target instanceof SimpleRope) {
            return false;
        }
        // 更新位置信息
        const renderData =  target.entity.getMutableComponent(RenderDataComponent);
        renderData.postionJson[0].x = target.position.x;
        renderData.postionJson[0].y = target.position.y;

        const {entity} = target;
        //  刚体位置更新

        if (entity.hasComponent(matterDataComponent)) {
            const {rigidBody} = entity.getMutableComponent(matterDataComponent);
            Body.setPosition(rigidBody, this.transformPos(target));
        }

        // 电场信息更新
        if (entity.hasComponent(ElecFieldComponent)) {
            const {E} = entity.getMutableComponent(ElecFieldComponent);
            const {x, y, width, height} =  this.transformPos(target);
            E.bounds = {
                max: {x: x + width / 2, y: y + height / 2},
                min: {x: x - width / 2, y: y - height / 2}
            };
        }

        // 磁场信息更新
        if (entity.hasComponent(MagneticFieldComponent)) {
            const {B} = entity.getMutableComponent(MagneticFieldComponent);
            const {x, y, width} =  this.transformPos(target);
            B.rounds = {
                x, y, r: width / 2
            };
        }
    }

    /**
     * @description 点击精灵，调起编辑删除选项
     * @param  {any} e Event对象
     * @param  {any} target 选择的目标精灵
     * @return {void}@memberof DragSystem
     */
    clickSprite(e, target) {
        const globalPos = e.data.global;
        // TODO: 给精灵设置选中范围

        store.commit('updateEditBoxPosition', {
            x: globalPos.x - 40,
            y: globalPos.y - 20
        });
        store.commit('updateEditPageVisible', true);
        store.commit('updateEditEntity', target.entity);
        store.commit('updateEditBoxVisible', false);

    }

    /**
     * @description 移动实体时，其连接的线也动态移动
     * @param  {any} pos 当前鼠标相对舞台的坐标
     * @return {void}@memberof DragSystem
     */
    dynamicChangeLine(pos) {
        const deltaX = pos.x - this.originPos.x;
        const deltaY = pos.y - this.originPos.y;
        this.moveLineSpriteArr.forEach(item => {
            const {sprite} = item;
            const {points} = sprite.geometry;
            const x = deltaX / (points.length - 1);
            const y = deltaY / (points.length - 1);

            const {originPos} = sprite;
            if (sprite.order === 'order') {
                points.forEach((pos, index) => {
                    pos.x = originPos[index].x + x * index;
                    pos.y = originPos[index].y + y * index;
                });
            }
            else if (sprite.order === 'reverse') {
                for (let i = points.length - 1; i >= 0; i--) {
                    const pos = points[i];
                    pos.x = originPos[i].x + x * (points.length - 1 - i);
                    pos.y = originPos[i].y + y * (points.length - 1 - i);
                }
            }
            else if (sprite.order === 'equal') {
                points.forEach((pos, index) => {
                    pos.x = originPos[index].x + deltaX;
                    pos.y = originPos[index].y + deltaY;
                });
            }
            item.points = sprite.geometry.points;
        });
    }

    // TODO:  重复函数
    transformPos(sprite) {
        const scale = 0.6;

        const {width, height, angle, x, y} = sprite;
        const anchor = sprite.anchor || {x: 0.5, y: 0.5};


        const dx =  (anchor.x - 0.5) * width * Math.cos(angle * Math.PI / 180) * scale;
        const dx2 =  (anchor.y - 0.5) * height * Math.sin(angle * Math.PI / 180) * scale;

        const dy = (anchor.x - 0.5) * width * Math.sin(angle * Math.PI / 180) * scale;
        const dy2 = (anchor.y - 0.5) * height * Math.cos(angle * Math.PI / 180) * scale;
        return {
            x: window.innerWidth  / 2 + x * scale - dx + dx2,
            y: window.innerHeight  / 2 + y * scale - dy - dy2,
            width: width * scale,
            height: height * scale,
            angle
        };
    }
}

DragSystem.queries = {
    moveEntity: {
        components: [MovableComponent],
        listen: {
            added: true
        }
    },
    lineEntitys: {components: [LineDataComponent]}
};

export default DragSystem;
