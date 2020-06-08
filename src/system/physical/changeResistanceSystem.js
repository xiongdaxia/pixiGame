// 拖拽系统
import {System} from 'ecsy';
import {Sprite, Graphics} from 'pixi.js';
import store from '@/store/index';
import SlidingRheostatComponent from '@/components/physical/slidingRheostat';
import RenderDataComponent from '@/components/physical/renderData';
import ComplexEntityComponent from '@/components/physical/complexEntity';
import ElecApplianceComponent from '@/components/physical/elecAppliance';


class changeResistanceSystem extends System {
    init() {
        // 记录锚点和当前位置的差异
        this.dXY = {x: 0, y: 0};
        console.log('滑动变阻器系统开始执行');
        // 记录滑动变阻器初始限位、图片坐标
        this.defaultData = {x: -150, y: 20, width: 278, height: 78};
    }

    execute() {
        //  为滑动变阻器滑块绑定事件，并存储
        const {added} = this.queries.slidingRheostat;

        added.forEach(entry => {
            const slidingRheostat = entry.getMutableComponent(SlidingRheostatComponent);
            const renderData = entry.getComponent(RenderDataComponent);
            const {sprite} = renderData;

            const sprite1 = sprite.children.find(
                item => item.name === 'slidingRheostat_1.png'
            );
            if (sprite1 && !sprite1.hasMask) {
                this.setMask(sprite1);
            }

            // 获取滑块
            const {sliderPicName} = slidingRheostat;
            const slider = this.getSlider(sprite, sliderPicName);
            if (slider) {
                slidingRheostat.sprite = slider;
            }
            else {
                return false;
            }

            this.bindMoveEvent(slidingRheostat);
        });
    }

    getSlider(sprite, sliderPicName) {
        if (!(sprite instanceof Sprite)) {
            return null;
        }
        return sprite.children.find(child => {
            if (child.name === sliderPicName) {
                return child;
            }
        });
    }

    bindMoveEvent(slidingRheostat) {
        const {sprite} = slidingRheostat;
        sprite.interactive = true;
        sprite.on('pointerdown', this.touchStart.bind(this));
        sprite.on('pointermove', this.touchMove.bind(this));
        sprite.on('pointerup', this.touchEnd.bind(this));
        sprite.on('pointerupoutside', this.touchEnd.bind(this));
    }

    touchStart(e) {
        e.stopPropagationHint = true;
        const target = e.currentTarget;
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
    }


    touchMove(e) {
        const target = e.currentTarget;

        if (!target || !target.isTouching) {
            return false;
        }

        const {stage} = window.PIXI.app;
        const container = stage.children[0];

        const pos = container.toLocal(e.data.global);
        const {entity} = target.parent;
        const slidingData = entity.getMutableComponent(SlidingRheostatComponent);
        const {maxResistance, minResistance} = slidingData;
        const {min, max} = slidingData.limit;
        const length = max - min;
        let nextPos = pos.x + this.dXY.x;
        if (nextPos <= min) {
            nextPos = min;
        }
        else if (nextPos >= max) {
            nextPos = max;
        }
        target.position.x = nextPos;
        slidingData.percent = (nextPos - min) / length;
        slidingData.resistaneRight
            = (maxResistance - minResistance) * (1 - slidingData.percent);
        slidingData.resistaneLeft
            = (maxResistance - minResistance) * slidingData.percent;

        // 改变电阻数据
        const parentSprite = entity.getComponent(RenderDataComponent).sprite;
        const childArr = entity.getComponent(ComplexEntityComponent).contains;
        const entityLeft = childArr[0];
        const entityRight = childArr[1];
        const dataLeft = entityLeft.getMutableComponent(ElecApplianceComponent);
        const dataRight = entityRight.getMutableComponent(ElecApplianceComponent);
        dataLeft.resistance = slidingData.resistaneLeft;
        dataRight.resistance = slidingData.resistaneRight;

        // 显示特效
        const sprite1 = parentSprite.children.find(
            item => item.name === 'slidingRheostat_1.png'
        );
        const {mask} = sprite1;
        const maskData = {
            x: this.defaultData.x,
            y: target.position.y,
            width: length,
            height: 200
        };
        if (!sprite1.hasMask) {
            this.setMask(sprite1);
        }

        maskData.x = this.defaultData.x - length;
        if (dataRight.current !== 0 && dataLeft.current !== 0) {
            // 完全显示
            maskData.x = this.defaultData.x;
        }
        else if (dataLeft.current !== 0) {
            // 左半部分
            maskData.x = this.defaultData.x + (slidingData.percent - 1) * length;
        }
        else if (dataRight.current !== 0) {
            // 右半部分
            maskData.x = this.defaultData.x + slidingData.percent * length;
        }

        mask.clear();
        mask.beginFill(0x66ccff);
        mask.drawRect(maskData.x, maskData.y, maskData.width, maskData.height);
        mask.endFill();

        store.commit('runCircuitCompute');
    }


    touchEnd(e) {
        e.stopPropagationHint = true;
        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        target.isTouching = false;
    }

    setMask(sprite) {
        const mask = new Graphics();
        mask.anchor = {x: 0.5, y: 1};
        mask.beginFill(0x66ccff);
        mask.drawRect(
            this.defaultData.x,
            this.defaultData.y,
            this.defaultData.width,
            this.defaultData.height
        );
        mask.endFill();
        sprite.hasMask = true;
        sprite.mask = mask;
        sprite.parent.addChild(mask);
    }
}

changeResistanceSystem.queries = {
    slidingRheostat: {
        components: [SlidingRheostatComponent], listen: {
            added: true
        }
    },
};

export default changeResistanceSystem;
