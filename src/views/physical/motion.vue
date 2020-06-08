<template>
    <div class="appContainer">
        <div ref="physical" class="physicalContainer"></div>
    </div>
</template>

<script>
import {env} from '@/environment';

//
import ECS from '@/world/ecs';
import Matter from '@/world/matter';
import Pixi from '@/world/pixi';
//
import MechanicsEntity from '@/entity/physical/mechanics';
import System from '@/system/physical';

// 自定义vue组件
// import Graphics from '@/views/component/physical/graphics';

export default {
    name: 'Motion',
    data() {
        return {
            atlasUrl: [`${env.publicPath}/texture/mechanics/demo.json`],
        };
    },

    /**
     * 渲染层（将图形数据渲染出来） 使用Pixi.js
     * 物理层（负责更新物理逻辑：碰撞检测、力学模拟）
     * 业务层（使用ECS，解耦各个业务模块）
     */
    mounted() {
        // pixi实例的参数
        const pixiOptions = {
            atlasUrl: this.atlasUrl,
            dom: this.$refs.physical,
            containerMove: false,
            containerScale: false,
        };

        // matter实例的参数
        const matterOption = {
            dom: this.$refs.physical,
            debug: false,
            autoStart: true,
            mouseControl: true
        };

        // 渲染
        window.PIXI = new Pixi(
            pixiOptions,
            () => {
                //  物理引擎
                window.MATTER = new Matter(matterOption);
                //  业务
                window.ECS = new ECS();
                this.world = window.ECS.world;
                this.addSystems();
                this.addEntitys();
            }
        );

    },
    methods: {
        addSystems() {
            // 引入system
            this.world
                .registerSystem(System.RenderSystem)
                .registerSystem(System.MatterSystem);
        },
        addEntitys() {
            MechanicsEntity.createBoardEntity(this.world);
            MechanicsEntity.createCarEntity(this.world);
            MechanicsEntity.createObstacleEntity(this.world);
        }
    }
};
</script>
<style lang='less' scoped>
    .appContainer {
        .physicalContainer {
            position: relative;
            width: 100%;
            height: 100%;
        }
    }
</style>
