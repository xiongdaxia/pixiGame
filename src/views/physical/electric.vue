<template>
    <div class="appContainer">
        <div ref="physical" class="physicalContainer"></div>
        <div class="elecOprateContainer">
            <SelectBar />
            <EditEntityData />
            <ExportAndImport
                @rebuildWorld="rebuildWorld"
            />
        </div>
    </div>
</template>

<script>
import {env} from '@/environment';

//
import ECS from '@/world/ecs';
import Pixi from '@/world/pixi';

// 自定义vue组件
import ExportAndImport from '@/views/component/physical/exportAndImport';
import EditEntityData from '@/views/component/physical/editEntityData';
import SelectBar from '@/views/component/physical/selectBar';

//
import Entity from '@/entity/physical';
import System from '@/system/physical';


export default {
    name: 'Electric',
    components: {SelectBar, EditEntityData, ExportAndImport},
    data() {
        return {
            atlasUrl: [
                `${env.publicPath}/texture/physical/battery.json`,
                `${env.publicPath}/texture/physical/lamp.json`,
                `${env.publicPath}/texture/physical/resistance.png`,
                `${env.publicPath}/texture/physical/switch.json`,
                `${env.publicPath}/texture/physical/line.json`,
                `${env.publicPath}/texture/physical/Ammeter.json`,
                `${env.publicPath}/texture/physical/Voltmeter.json`,
                `${env.publicPath}/texture/physical/SlidingRheostat.json`,
            ],
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
        };
        // 渲染
        window.PIXI = new Pixi(
            pixiOptions,
            () => {
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
                .registerSystem(System.DrawLineSystem)
                .registerSystem(System.DragSystem)
                .registerSystem(System.CircuitSystem)
                .registerSystem(System.GlowSystem)
                .registerSystem(System.RorateSystem)
                .registerSystem(System.ChangeResistanceSystem);
        },
        // 电学
        addEntitys() {
            // 创建电路管理单例
            const circuitEntity = Entity.createCircuitEntity(this.world);
            circuitEntity.id = 0;

            this.$store.commit('updateCircuitEntity', circuitEntity);
        },
        rebuildWorld() {
            // 预留
            window.PIXI.reset();
            window.ECS.reset();
        },
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
