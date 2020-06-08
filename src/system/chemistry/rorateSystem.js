// 开关切换动画
import {System} from 'ecsy';
import * as PIXI from 'pixi.js';
import RorateableComponent from '@/components/chemistry/rorateable';
import RenderDataComponent from '@/components/chemistry/renderComponent';
import StructureComponent from '@/components/chemistry/structureComponent';

class RorateSystem extends System {

    init() {
        console.log('旋转系统开始执行了');
    }

    execute() {
        // 新建旋转按钮
        this.singleSpriteRorate();
        // 为旋转按钮绑定或解绑事件
        this.handelPointEventBind();
    }

    /**
     * @description 单个精灵的旋转，在精灵下方添加一个控制块，主动绑定旋转事件
     * @return {void}@memberof RorateSystem
     */
    singleSpriteRorate() {
        const {added} = this.queries.rorateEntitys;
        added.forEach(entity => {
            const rorateData = entity.getMutableComponent(RorateableComponent);
            const {min, max} = rorateData;
            if (!rorateData.sprite) {
                const renderData = entity.getMutableComponent(RenderDataComponent);
                const {sprite} = renderData;
                // 新建一个固定大小的区域作为旋转控制按钮
                const block = this.getRorateControlBlock(sprite.anchor, sprite.width, sprite.height);
                block.alpha = 0;
                renderData.sprite.addChild(block);
                rorateData.sprite = block;
                rorateData.sprite.entity = entity;
            }
            if (rorateData.isRoratable) {
                this.bindRorateEvent(rorateData.sprite, min, max);
            }
        });
    }

    handelPointEventBind() {
        const changedEntities = this.queries.rorateEntitys.changed;
        changedEntities.forEach(entity => {
            const rorateData = entity.getMutableComponent(RorateableComponent);
            if (rorateData.isRoratable) {
                rorateData.sprite.alpha = 1;
                this.bindRorateEvent(rorateData.sprite);
            }
            else {
                rorateData.sprite.alpha = 0;
                this.unBindRorateEvent(rorateData.sprite);
            }
        });
    }

    /**
     * @param anchor 锚点
     * @param width 宽
     * @param height 高
     * @returns {Sprite} 返回一个旋转按钮精灵
     */
    getRorateControlBlock(pivot, width, height) {
        const sprite = new PIXI.Sprite();
        const cache = PIXI.utils.TextureCache;
        const atlasRegPng = 'rorate.png';

        const texture = cache[atlasRegPng];
        if (!texture) {
            console.error('没有对应的纹理', cache, atlasRegPng);
            return false;
        }
        sprite.texture = texture;
        sprite.anchor = {x: 0.5, y: 0.5};
        sprite.y = height + 50;
        sprite.x = (0.5 - pivot.x) * width;
        return sprite;
    }


    /**
     * @description 通过组件里的name得到旋转的精灵
     * @param  {any} name 被旋转精灵的name
     * @param  {any} sprite 父亲精灵
     * @return  {Sprite} 精灵
     * @memberof RorateSystem
     */
    getRorateSpriteByName(name, sprite) {
        if (sprite.name === name) {
            return sprite;
        }
        return sprite.getChildByName(name);
    }


    /**
     * @description 取消精灵事件绑定
     * @return {void}@memberof RorateSystem
     */
    unBindRorateEvent(sprite) {
        sprite.interactive = false;
        sprite.buttonMode = false;
        sprite.off('pointerdown');
        sprite.off('pointermove');
        sprite.off('pointerup');
        sprite.off('pointerupoutside');
    }

    /**
     * @description 为单个精灵的旋转绑定事件
     * @param  {any} sprite 旋转的精灵
     * @param  {any} min 最小旋转角度
     * @param  {any} max 最大旋转角度
     * @return {void}@memberof RorateSystem
     */
    bindRorateEvent(sprite) {
        sprite.interactive = true;
        sprite.buttonMode = true;
        sprite.on('pointerdown', this.touchStart.bind(this));
        sprite.on('pointermove', this.touchMove.bind(this));
        sprite.on('pointerup', this.touchEnd.bind(this));
        sprite.on('pointerupoutside', this.touchEnd.bind(this));
    }

    /**
     * @description 根据鼠标位移和精灵尺寸，计算旋转角度
     * @param  {any} posA 锚点坐标
     * @param  {any} posB 移动的点
     * @return 角度
     * @memberof RorateSystem
     */
    calculateAngle(posA, posB) {
        const dy = posB.y - posA.y;
        const dx = posB.x - posA.x;
        const l = Math.sqrt(dy * dy + dx * dx);
        if (dx < 0) {
            return ((180 * Math.acos(dy / l)) / Math.PI).toFixed(2);
        }
        return -((180 * Math.acos(dy / l)) / Math.PI).toFixed(2);
    }

    /**
     * @description 开始触碰
     * @param  {any} e Event对象
     * @return  null
     * @memberof RorateSystem
     */
    touchStart(e) {
        e.stopPropagationHint = true;
        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        // 计算点击点与旋转点的初始角度
        const bodyPos = target.parent.parent.toGlobal(target.parent.position);
        const ctrPos = {
            y: bodyPos.y + target.parent.height + 50,
            x: bodyPos.x + (0.5 - target.parent.anchor.x) * target.parent.width
        };
        this.deltaAngle = this.calculateAngle(bodyPos, ctrPos);
        target.tint = 0x00FF7F;
        target.isRorating = true;
    }

    /**
     * @description 开始移动
     * @param  {any} e Event对象
     * @return  null
     * @memberof RorateSystem
     */
    touchMove(e) {
        // e.stopPropagationHint = true;
        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        if (!target.isRorating) {
            return false;
        }
        // 考虑旋转锚点与点击点之间有一个初始角度，计算时要减去初始角度
        const bodyPos = target.parent.parent.toGlobal(target.parent.position);
        const angle = this.calculateAngle(bodyPos, e.data.global) - this.deltaAngle;
        target.parent.angle = angle;

        // TODO 考虑容器内物质体积计算多大角度倾倒
        // 倾倒容器内物质
        if (angle >= 90 || angle <= -90) {
            this.clearContains(target.entity);
        }
    }

    /**
     * @description 触碰结束
     * @param  {any} {max = 0} 最大旋转角度
     * @param  {any} e Event对象
     * @return  null
     * @memberof RorateSystem
     */
    touchEnd(e) {
        e.stopPropagationHint = true;

        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        target.tint = 0xFFFFFF;
        target.isRorating = false;
    }

    /**
     * 清空容器内物质
     * @param {*} entity 目标实体
     */
    clearContains(entity) {
        if (!entity.hasComponent(StructureComponent)) {
            return false;
        }
        const materialData = entity.getMutableComponent(StructureComponent);
        materialData.contains = {};
    }
}

RorateSystem.queries = {
    // 绑定主动旋转事件
    rorateEntitys: {
        components: [RorateableComponent],
        listen: {
            added: true,
            changed: true
        }
    }
};

export default RorateSystem;
