// 旋转系统

import {System} from 'ecsy';
import store from '@/store/index';
import RorateableComponent from '@/components/physical/rorateable';
import RenderDataComponent from '@/components/physical/renderData.js';
import ElecApplianceComponent from '@/components/physical/elecAppliance';
import AmmeterComponent from '@/components/physical/ammeter';
import VoltmeterComponent from '@/components/physical/voltmeter';

// 定义电流电压表满偏角度
const totalDialDegre = 75;
const initDialDegre = -25;
class RorateSystem extends System {

    init() {
        console.log('旋转系统开始执行了');
    }

    execute() {
        // 类似开关的旋转
        this.singleSpriteRorate();
        // 电流表的旋转
        this.ammeterRorate();
        // 电压表的旋转
        this.voltmeterRorate();
    }

    /**
     * @description 单个精灵的旋转，主动绑定旋转事件
     * @return {void}@memberof RorateSystem
     */
    singleSpriteRorate() {
        const {added} = this.queries.rorateEntitys;
        added.forEach(entity => {
            const rorateData = entity.getMutableComponent(RorateableComponent);
            const {rorateSpriteName, min, max} = rorateData;
            let rorateSprite = rorateData.sprite;
            if (!rorateSprite) {
                const renderData = entity.getMutableComponent(RenderDataComponent);
                const {sprite} = renderData;
                rorateData.sprite = this.getRorateSpriteByName(rorateSpriteName, sprite);
                rorateSprite = rorateData.sprite;
                rorateData.sprite.entity = entity;
            }
            this.bindRorateEvent(rorateSprite, min, max);
        });
    }

    /**
     * @description 电压表指针的旋转
     * @return {void}@memberof RorateSystem
     */
    voltmeterRorate() {
        const {changed} = this.queries.voltmeterRorate;
        // 所有电压表
        changed.forEach(entity => {
            const renderData = entity.getComponent(RenderDataComponent);
            const voltmeterData = entity.getMutableComponent(VoltmeterComponent);

            const label = renderData.sprite.children[6];
            const line = renderData.sprite.children.find(
                item => item.name === 'Voltmeter_line.png'
            );
            const {voltage, rangeType, status} = voltmeterData;
            let statusTemp;
            let angle = initDialDegre;
            let text = '';
            let max = 3;
            let min = -1;
            if (rangeType === 0) {
                // -1-3V
                min = -1;
                max = 3;
            }
            else if (rangeType === 1) {
                // -5-15V
                min = -5;
                max = 15;

            }
            if (voltage > max || voltage < min) {
                text = '烧毁';
                statusTemp = 1;
            }
            else {
                angle = angle + (totalDialDegre * voltage) / max;
                text = `${voltage.toFixed(2)}`;
                if (status === 2) {
                    text = '错误';
                    statusTemp = status;
                }
            }
            voltmeterData.status = statusTemp;
            line.angle = angle;
            label.text = text;
        });
    }

    /**
     * @description 电流表指针的旋转
     * @return {void}@memberof RorateSystem
     */
    ammeterRorate() {
        const {changed} = this.queries.ammeterRorate;
        // 所有电流表
        changed.forEach(entity => {
            const data = entity.getComponent(AmmeterComponent);
            const renderData = entity.getComponent(RenderDataComponent);

            const label = renderData.sprite.children[6];
            const line = renderData.sprite.children.find(item => item.name === 'Ammeter_line.png');


            const {current, rangeType, status} = data;
            let statusTemp;
            let angle = initDialDegre;
            let text = '';
            let min = -0.2;
            let max = 0.6;
            if (rangeType === 0) {
                // 0.6A
                min = -0.2;
                max = 0.6;
            }
            else if (rangeType === 1) {
                // 3A
                min = -1;
                max = 3;

            }
            if (current > max || current < min) {
                text = '烧毁';
                statusTemp = 1;
            }
            else {
                angle = angle + (totalDialDegre * current) / max;
                text = `${current.toFixed(2)}`;
                if (status === 2) {
                    text = '错误';
                    statusTemp = status;
                }
            }
            data.status = statusTemp;
            line.angle = angle;
            label.text = text;
        });
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
     * @description 为单个精灵的旋转绑定事件
     * @param  {any} sprite 旋转的精灵
     * @param  {any} min 最小旋转角度
     * @param  {any} max 最大旋转角度
     * @return {void}@memberof RorateSystem
     */
    bindRorateEvent(sprite, min, max) {
        sprite.interactive = true;
        sprite.on('pointerdown', this.touchStart.bind(this));
        sprite.on('pointermove', this.touchMove.bind(this, {min, max}));
        sprite.on('pointerup', this.touchEnd.bind(this, {min, max}));
        sprite.on('pointerupoutside', this.touchEnd.bind(this, {min, max, sprite}));
    }

    /**
     * @description 计算旋转角度
     * @param  {any} posA 锚点坐标
     * @param  {any} posB 移动的点
     * @return 角度
     * @memberof RorateSystem
     */
    calculateAngle(posA, posB) {
        const dy = posB.y - posA.y;
        const dx = posB.x - posA.x;
        return ((180 * Math.atan(dy / dx)) / Math.PI).toFixed(2);
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
        target.isRorating = true;
        target.startY = e.data.global.y;
    }

    /**
     * @description 开始移动
     * @param  {any} {min = 0, max = 0} 最小旋转角度 最大旋转角度
     * @param  {any} e Event对象
     * @return  null
     * @memberof RorateSystem
     */
    touchMove({min = 0, max = 0}, e) {
        // e.stopPropagationHint = true;
        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        if (!target.isRorating) {
            return false;
        }
        const angle = this.calculateAngle(target.position, target.parent.toLocal(e.data.global));
        if (angle > max || angle < min) {
            return false;
        }
        target.angle = angle;
    }

    /**
     * @description 触碰结束
     * @param  {any} {max = 0} 最大旋转角度
     * @param  {any} e Event对象
     * @return  null
     * @memberof RorateSystem
     */
    touchEnd({max = 0}, e) {
        e.stopPropagationHint = true;

        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        target.isRorating = false;
        const isChecked = Math.abs(target.angle - max) < 10;
        const {entity} = target;
        const rorateData = entity.getMutableComponent(RorateableComponent);

        // TODO 暂时在这里改变elecAppliance中的状态，未来开关将没有elecAppliance
        const elecAppliance = entity.getMutableComponent(ElecApplianceComponent);
        const preStatus = elecAppliance.status;
        elecAppliance.status = isChecked ? 0 : 1;

        // TODO 应判断器件类型，开关闭合应通知电路重新判断，电流、电压表不需要
        if (preStatus !== elecAppliance.status) {
            console.log('重新判断电路');
            store.commit('runCircuitCompute');
        }
        rorateData.isChecked = isChecked;
    }
}

RorateSystem.queries = {
    // 绑定主动旋转事件
    rorateEntitys: {
        components: [RorateableComponent],
        listen: {
            added: true
        }
    },
    // 电流表旋转
    ammeterRorate: {
        components: [AmmeterComponent],
        listen: {
            changed: true
        }
    },
    // 电压表
    voltmeterRorate: {
        components: [VoltmeterComponent],
        listen: {
            changed: true
        }
    }
};

export default RorateSystem;
