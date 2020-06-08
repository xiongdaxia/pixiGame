<template>
    <div class="container">
        <el-button
            v-for="(item, index) in buttonList"
            :key="index"
            :type="item.type"
            :disabled="item.disabled"
            @click="createEntity(index)"
        >
            {{item.label}}
        </el-button>
    </div>
</template>

<script>
import {Button} from 'element-ui';
import Vue from 'vue';
import Entity from '@/entity/physical';

Vue.component(Button.name, Button);

export default {
    name: 'SelectBar',
    data() {
        return {
            buttonList: [
                {
                    label: '电源',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '电阻',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '开关',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '灯泡',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '滑动变阻器',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '电流表',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '电压表',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '电动机',
                    type: 'info',
                    disabled: true
                },
                {
                    label: '电容',
                    type: 'info',
                    disabled: true
                }
            ]
        };
    },
    methods: {
        // ======================事件处理函数======================
        createEntity(index) {
            const {world} = window.ECS;
            switch (index) {
                case 0:
                    Entity.createBatteryEntity(world);
                    break;
                case 1:
                    Entity.createResistanceEntity(world);
                    break;
                case 2:
                    Entity.createSwitchEntity(world);
                    break;
                case 3:
                    Entity.createLampEntity(world);
                    break;
                case 4:
                    Entity.createSlidingRheostatEntity(world);
                    break;
                case 5:
                    Entity.createAmmeterEntity(world);
                    break;
                case 6:
                    Entity.createVoltmeterEntity(world);
                    break;
            }
        }
    }
};
</script>

<style lang="less" scoped>
.container {
    position: absolute;
    // float: right;
    top: 0;
    right: 0;
}
</style>
