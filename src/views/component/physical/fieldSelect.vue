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
import elecAndMagneticEntity from '@/entity/physical/elecAndMagnetic';

Vue.component(Button.name, Button);

export default {
    name: 'SelectBar',
    data() {
        return {
            buttonList: [
                {
                    label: '带电粒子',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '电场',
                    type: 'primary',
                    disabled: false
                },
                {
                    label: '磁场',
                    type: 'primary',
                    disabled: false
                },
            ]
        };
    },
    methods: {
        // ======================事件处理函数======================
        createEntity(index) {
            const {world} = window.ECS;
            switch (index) {
                case 0:
                    elecAndMagneticEntity.createBallEntity(world);
                    break;
                case 1:
                    elecAndMagneticEntity.createElecFieldEntity(world);
                    break;
                case 2:
                    elecAndMagneticEntity.createMagneticFieldEntity(world);
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
