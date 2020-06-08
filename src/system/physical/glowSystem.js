// 灯泡效果，根据电器当前功率显示怎样的
import {System} from 'ecsy';
import RenderDataComponent from '@/components/physical/renderData.js';
import ShineableComponent from '@/components/physical/shineable.js';
import ElecApplianceComponent from '@/components/physical/elecAppliance.js';
import {utils} from 'pixi.js';

class glowSystem extends System {
    init() {
        console.log('发光系统开始执行了');
        // key - entityId     value - power
        this.prePower = {};
    }

    execute() {
        const entities = this.queries.shineableEntities.changed;
        entities.forEach(entity => {
            const elecData = entity.getMutableComponent(ElecApplianceComponent);
            const keys = Object.keys(this.prePower);
            if (
                !keys.includes(`${entity.id}`)
        || this.prePower[entity.id] !== elecData.power
            ) {
                // 上次的功率数据为空 或 功率值改变了 则需要计算
                this.prePower[entity.id] = elecData.power;
                const percentage = this.caculatePercentage(
                    elecData.power,
                    elecData.ratedPower,
                    elecData.maxPower
                );

                this.showLightEffect(entity, percentage);
            }
        });
    }

    caculatePercentage(currentPower, ratedPower, maxPower) {
        if (currentPower <= 0) {
            return 0;
        }
        if (currentPower > maxPower) {
            return 9999;
        }
        // 暂定额定功率时为75%亮度
        if (currentPower <= ratedPower) {
            return (75 * currentPower) / ratedPower;
        }

        return 75 + (15 * (currentPower - ratedPower)) / (maxPower - currentPower);
    }

    showLightEffect(entity, percentage) {
        const renderData = entity.getMutableComponent(RenderDataComponent);
        const {sprite} = renderData;
        if (typeof sprite.on !== 'function') {
            return false;
        }
        const lightSprite = renderData.sprite.children[0];
        const lightData = entity.getComponent(ShineableComponent);
        let showPic;
        let opacity;

        if (percentage === 0) {
            showPic = lightData.normalPicArr[0];
        }
        else if (percentage === 9999) {
            // 烧毁
            showPic = lightData.burnPic;
        }
        else {
            // 计算应选用的图片在数组中的下标
            const totalLevel = lightData.normalPicArr.length;
            const lightLevel = (totalLevel * percentage) / 100;
            let picIndex = 0;
            if (Math.ceil(lightLevel) >= totalLevel) {
                picIndex = totalLevel - 1;
            }
            else {
                picIndex = Math.ceil(lightLevel);
            }
            showPic = lightData.normalPicArr[picIndex];
            // 计算透明度
            opacity = 1 - ((picIndex + 1) / totalLevel - percentage / 100);
        }

        const cache = utils.TextureCache;

        const texture = cache[showPic] || null;
        if (!texture && showPic !== '') {
            console.error('生产精灵时缓存里没有相应的纹理');
            return false;
        }
        lightSprite.texture = texture;
        lightSprite.alpha = opacity || 1;
    }
}

glowSystem.queries = {
    shineableEntities: {
        components: [
            RenderDataComponent,
            ShineableComponent,
            ElecApplianceComponent
        ],
        listen: {
            changed: [ElecApplianceComponent]
        }
    }
};

export default glowSystem;
