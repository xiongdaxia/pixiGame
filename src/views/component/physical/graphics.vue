<template>
    <div class="container">
        <svg width="500" height="500">
            <path
                ref="path"
            />
            <path
                d="M 10 490 L 490 490 L 480 480  L 490 490 L 480 500"
            />
            <path
                d="M 10 490 L 10 10 L 20 20  L 10 10 L 0 20"
            />
        </svg>
        <el-button type="primary" @click="drawVT">
            v-t
        </el-button>
        <el-button type="primary" @click="drawST">
            s-t
        </el-button>
    </div>
</template>

<script>
export default {
    name: 'Graphics',
    props: {
        svgData: {
            type: Array,
            default() {
                return [];
            }
        }
    },
    data() {
        return {};
    },
    watch: {
        svgData(val) {
            // 重新绘画线条
            this.drawLine(val);
        }
    },
    methods: {
        // ======================事件处理函数======================
        drawST() {
            this.drawLine(this.svgData, 1);
        },
        drawVT() {
            this.drawLine(this.svgData, 2);
        },
        drawLine(val, type = 1) {
            const data =  type === 1 ? this.dealData2(val) : this.dealData(val);
            const dom = this.$refs.path;
            dom.setAttribute('d', data);
        },
        dealData(val) {
            let result = '';
            let head = 'M';
            let x = 0;
            let y = 0;
            const scalex = 200;
            const scaley = 75;
            val.forEach((item, index) => {
                head = index ? 'L' : 'M';
                x = item.time * scalex + 10;
                y = 500 - item.speed * scaley - 10;
                result = `${result} ${head} ${x} ${y} `;
            });
            return result;
        },
        dealData2(val) {
            let result = '';
            let head = 'M';
            let x = 0;
            let y = 0;
            const scalex = 200;
            val.forEach((item, index) => {
                head = index ? 'L' : 'M';
                x = item.time * scalex + 10;
                y = 500 - item.distance / 2 - 10;
                result = `${result} ${head} ${x} ${y} `;
            });
            return result;
        }
    // ======================业务逻辑函数======================
    // ========================纯函数=========================
    // ======================网络请求函数======================
    // =======================初始化函数=======================
    }
};
</script>

<style lang='less' scoped>
.container{
    position: absolute;
    top: 0;
    right: 0;
    svg {
        stroke: #000;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
    }
}
</style>
