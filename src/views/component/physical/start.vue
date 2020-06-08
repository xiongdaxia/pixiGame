<template>
    <div class="container">
        <el-button
            type="primary"
            @click="start"
        >
            开始
        </el-button>
        <el-button
            type="primary"
            @click="stop"
        >
            停止
        </el-button>
    </div>
</template>

<script>
import {Button} from 'element-ui';
import Vue from 'vue';

Vue.component(Button.name, Button);

export default {
    name: 'SelectBar',
    data() {
        return {
        };
    },
    methods: {
        // ======================事件处理函数======================
        start() {
            console.log(1);
            window.MATTER.start();
        },
        stop() {
            window.MATTER.stop();
        },
        reset() {
            window.MATTER.reset();
        }
    }
};
</script>

<style lang="less" scoped>
.container {
        // position: relative;
        // float: left;
        position: absolute;
        top: 0;
        // float: left;
    }
</style>
