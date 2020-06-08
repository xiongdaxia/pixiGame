<template>
    <div class="container">
        <el-select v-model="value" placeholder="请选择" @change="change">
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-select>
    </div>
</template>

<script>
import {Select, Option} from 'element-ui';
import Vue from 'vue';

Vue.component(Select.name, Select);
Vue.component(Option.name, Option);

export default {
    name: 'CategoryOption',
    data() {
        return {
            options: [
                {
                    value: '1',
                    label: '电学'
                },
                {
                    value: '2',
                    label: '力学'
                },
                {
                    value: '3',
                    label: '化学'
                }
            ],
            value: '1'
        };
    },
    methods: {
        // ======================事件处理函数======================
        change(value) {
            this.$emit('changeCategory', value);
        }
    // ======================业务逻辑函数======================
    // ========================纯函数=========================
    // ======================网络请求函数======================
    // =======================初始化函数=======================
    }
};
</script>

<style lang='less' scoped>
.container {
        position: absolute;
        bottom: 0;
        float: left;
    }
</style>
