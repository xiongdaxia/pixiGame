<template>
    <div class="appContainer">
        <div ref="physical" class="physicalContainer"></div>
        <FieldSelect />
        <EditEntityData />
        <div class="elecOprateContainer">
            <Start />
        </div>
    </div>
</template>

<script>
import {env} from '@/environment';

//
import ECS from '@/world/ecs';
import Matter from '@/world/matter';
import Pixi from '@/world/pixi';

//
import System from '@/system/physical';
import elecAndMagneticEntity from '@/entity/physical/elecAndMagnetic';
import FieldSelect from '@/views/component/physical/fieldSelect';
import EditEntityData from '@/views/component/physical/editEntityData';


// 自定义vue组件
import Start from '@/views/component/physical/start';

export default {
    name: 'Physical',
    components: {Start, FieldSelect, EditEntityData},
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
            addEditEvent: true
        };
        // matter实例的参数
        const matterOption = {
            hasGravity: false,
            dom: this.$refs.physical,
            debug: false,
            wall: false
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
                .registerSystem(System.MatterSystem)
                .registerSystem(System.ElecFieldSystem)
                .registerSystem(System.MagneticFieldSystem)
                .registerSystem(System.DrawFieldLineSystem)
                .registerSystem(System.DragSystem);
        },
        // 电场和磁场
        addEntitys() {
            elecAndMagneticEntity.createBallEntity(this.world, 0x00ff00);
            elecAndMagneticEntity.createElecFieldEntity(this.world);
            elecAndMagneticEntity.createMagneticFieldEntity(this.world);
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
