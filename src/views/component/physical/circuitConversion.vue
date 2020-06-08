<template>
    <div
        v-show="dialogVisible"
        ref="dialog"
        class="circuit-dialog"
        draggable="true"
    >
        <div class="dialog-header">
            <p class="dialog-title">
                实物图->电路图
            </p>
            <el-button class="close-btn" icon="el-icon-close" circle size="small" @click="closeDialog()" />
        </div>
        <div id="svg"></div>
    </div>
</template>

<script>
import Vue from 'vue';
import {Button} from 'element-ui';
import {SVG} from '@svgdotjs/svg.js';
import * as SvgElecData from '@/settings/physical/svgData.js';

Vue.component(Button.name, Button);

export default {
    name: 'CircuitConversion',
    data() {
        return {
            dialogVisible: false
        };
    },
    mounted() {
        // 无需监听的数据们
        this.initData();
    },
    methods: {
        initData() {
            // 初始化一些数据，不需要vue监听
            this.count = {};
            this.elecList = [];
            this.draw = null;
            this.root = null;
            this.lineArea = null;
            this.defaultStroke = {color: '#000000', width: 1};
            this.stepLength = 20;
            this.svgSize = {width: window.innerWidth / 2, height: window.innerHeight / 2};
        },

        /**
         * 初始化svg
         */
        initSvg() {
            if (document.getElementById('_rootSvg')) {
                document.getElementById('_rootSvg').remove();
            }
            // eslint-disable-next-line babel/new-cap
            this.draw = SVG().size(this.svgSize.width, this.svgSize.height)
                .addTo('#svg');
            this.draw.attr({id: '_rootSvg'});
            this.root = this.draw.group('root');
            this.lineArea = this.root.group('lineArea');
            this.drawBackground();
        },

        /**
         * 打开窗口方法
         */
        show(elecData, linkInfo) {
            this.initData();
            this.initSvg();
            // 转换坐标到svg下
            this.posTranslate(elecData);

            // 根据elecData 画出图形
            this.drawSvgGraphs(elecData);

            // 画完图形后开始画线
            this.drawLine(elecData, linkInfo);
            this.dialogVisible = true;
        },

        /**
         * 坐标变换,转换原则：1、与pixi中相对位置一致   2、所有器件落在网格上   3、必须留出最边上一格用于走线
         */
        posTranslate(elecData) {
            // 获取pixi与svg之间比例
            const radio = {};
            const limitX = this.svgSize.width - 80 - this.stepLength;
            const limitY = this.svgSize.height - 80 - this.stepLength;
            radio.x = this.svgSize.width / window.innerWidth;
            radio.y = this.svgSize.height / window.innerHeight;
            // 将元器件距离进行缩放
            elecData.forEach(data => {
                // pixi中坐标原点在中心
                const x = radio.x * (data.x + window.innerWidth / 2);
                const y = radio.y * (data.y + window.innerHeight / 2);
                if (x >= 0 && x <= limitX) {
                    data.x = x;
                }
                else if (x < this.stepLength) {
                    data.x = this.stepLength;
                }
                else {
                    data.x = limitX;
                }

                if (y >= 0 && y <= limitY) {
                    data.y = y;
                }
                else if (y < this.stepLength) {
                    data.y = this.stepLength;
                }
                else {
                    data.y = limitY;
                }
                // 对步长取整，保证器件落在网格上
                data.x = data.x - data.x % 20;
                data.y = data.y - data.y % 20;
            });
        },

        /**
         * 画连线入口
         * @param elecData 元器件信息
         * @param linkInfo 连线信息，节点对数组
         */
        drawLine(elecData, linkInfo) {
            // 获取到元器件的位置，注意：之前为了使器件居中，矩形是向上移了一个步长的
            linkInfo.forEach(line => {
                const startSplitArr = line[0].split('_');
                const endSplitArr = line[1].split('_');
                const startData = elecData.find(item => item.entityId === +startSplitArr[0]);
                const endData = elecData.find(item => item.entityId === +endSplitArr[0]);
                if (!startData || !endData) {
                    console.warn('数据异常，画线时缺失数据', line);
                    return false;
                }
                const startPos = {
                    x: startData.x + this.getDeltaX(startSplitArr[1]),
                    y: startData.y + 20
                };
                const endPos = {
                    x: endData.x + this.getDeltaX(endSplitArr[1]),
                    y: endData.y + 20
                };
                // 开始生成svg path数据，先走x再走y
                const pathData
                    = this.getPathDataByPos(startPos, endPos, startSplitArr[1] + endSplitArr[1]);
                if (!pathData) {
                    console.warn('数据异常，生成线的path失败');
                    return false;
                }
                this.drawSvgPath(this.lineArea, [pathData], this.defaultStroke);
                // 在线的两端点画一个圆点表示连线点
                this.drawSvgPoint(this.lineArea, startPos);
                this.drawSvgPoint(this.lineArea, endPos);
            });
        },


        /**
         * 根据两个坐标点获得svg path数据，主要用到svg的M\V\H
         * @param startPos 开始坐标点
         * @param endPos 结束坐标点
         * @param type 两个点的方向如 ll lr rl rr
         */
        getPathDataByPos(startPos, endPos, type) {
            // TODO 优化代码！！！
            let pathData = '';

            if (type === 'll') {
                // 左到左
                if (startPos.x - endPos.x >= 0) {
                    pathData = `M${startPos.x} ${startPos.y} H${endPos.x} `
                        +  `M${endPos.x} ${startPos.y} V${endPos.y} `;
                }
                else {
                    pathData = `M${endPos.x} ${endPos.y} H${startPos.x}  `
                        + `M${startPos.x} ${endPos.y} V${startPos.y} `;
                }
                return pathData;
            }
            if (type === 'rr') {
                // 右到右
                if (startPos.x - endPos.x >= 0) {
                    pathData = `M${endPos.x} ${endPos.y} H${startPos.x} `
                        +  `M${startPos.x} ${endPos.y} V${startPos.y} `;
                }
                else {
                    pathData = `M${startPos.x} ${startPos.y} H${endPos.x}  `
                        + `M${endPos.x} ${startPos.y} V${endPos.y} `;
                }
                return pathData;
            }
            if (type === 'lr') {
                // 左到右
                if (startPos.x - endPos.x >= 0) {
                    pathData = `M${startPos.x} ${startPos.y} H${endPos.x} `
                        +  `M${endPos.x} ${startPos.y} V${endPos.y} `;
                }
                else {
                    const deltaY = startPos.y - endPos.y;
                    let tempY;
                    if (deltaY > 0) {
                        tempY = -40;
                    }
                    else if (deltaY < 0) {
                        tempY = 40;
                    }
                    else {
                        tempY = 0;
                    }
                    pathData = `M${startPos.x} ${startPos.y} V${startPos.y + tempY}  `
                        + `M${startPos.x} ${startPos.y + tempY} H${endPos.x}  `
                        + `M${endPos.x} ${startPos.y + tempY} V${endPos.y} `;
                }
                return pathData;
            }
            if (type === 'rl') {
                // 右到左
                if (startPos.x - endPos.x >= 0) {
                    const deltaY = endPos.y - startPos.y;
                    let tempY;
                    if (deltaY > 0) {
                        tempY = -40;
                    }
                    else if (deltaY < 0) {
                        tempY = 40;
                    }
                    else {
                        tempY = 0;
                    }
                    pathData = `M${endPos.x} ${endPos.y} V${endPos.y + tempY}  `
                        + `M${endPos.x} ${endPos.y + tempY} H${startPos.x}  `
                        + `M${startPos.x} ${endPos.y + tempY} V${startPos.y} `;
                }
                else {
                    pathData = `M${startPos.x} ${startPos.y} H${endPos.x} `
                        +  `M${endPos.x} ${startPos.y} V${endPos.y} `;
                }
                return pathData;
            }
            return false;
        },

        /**
         * 根据svg图中位置，得到x的相对偏移量
         * @param direct 方向 l/r/t/b
         */
        getDeltaX(direct) {

            switch (direct) {
                // 左
                case 'l':
                    return 0;
                // 右
                case 'r':
                    return 80;

                default:
                    break;
            }
        },

        // ************ SVG 相关方法

        /**
         * 根据show()传入的数据画出器件svg
         */
        drawSvgGraphs(elecData) {
            elecData.forEach(item => {
                this.drawSvgElecByData(SvgElecData[item.elecType], {x: item.x, y: item.y, id: item.entityId});
            });
        },

        /**
         * 画连线端点
         */
        drawSvgPoint(container, pos) {
            const size = 6;
            const t = container.circle(size).x(pos.x - size / 2)
                .y(pos.y - size / 2);
            t.attr({fill: '#000000'});
        },


        /**
         * 给元器件加一个透明矩形
         */
        drawSvgBackRect(container) {
            return container.rect(80, 80)
                .dy(-20)
                .css({
                    opacity: 0
                });
        },

        /**
         * 获取一个新的path
         */
        getNewSvgPath(container, prop = this.defaultStroke) {
            return container.path().stroke(prop);
        },

        /**
         * 根据path数据数组画出path
         */
        drawSvgPath(container, pathData = [], lineProp = this.defaultStroke) {
            if (!pathData || !lineProp || !container) {
                console.error('生成路径失败');
                return false;
            }
            pathData.forEach(path => {
                this.getNewSvgPath(container, lineProp).plot(path);
            });
        },

        /**
         * 在元器件底部增加一个名字表示
         */
        addSvgTextUnder(container, text) {
            container.text(text).dx(30)
                .dy(40);
        },

        /**
         * 根据预设的数据画元器件
         */
        drawSvgElecByData(svgData, props = {}) {
            if (!svgData) {
                console.warn('数据异常');
                return false;
            }
            this.count[svgData.name] = isNaN(this.count[svgData.name]) ? 1 : this.count[svgData.name] + 1;
            const p = this.root.group(svgData.name);
            this.drawSvgBackRect(p);
            const {path} = svgData;
            // 画线
            this.drawSvgPath(p, path);
            // 画图形
            if (svgData.shape) {
                for (const key of Object.keys(svgData.shape)) {
                    svgData.shape[key].forEach(shape => {
                        const t = p[key](shape.size);
                        t.x(shape.x || 0).y(shape.y || 0);
                        t.stroke(this.defaultStroke);
                        t.attr({fill: 'none'});
                    });
                }
            }
            // 写字
            if (svgData.text) {
                svgData.text.forEach(item => {
                    const t = p.text(item.text);
                    t.x(item.x || 0).y(item.y || 0);
                    t.font({size: item.size});
                });
            }
            this.addSvgTextUnder(p, `${svgData.name} ${this.count[svgData.name]}`);
            p.attr({id: props.id || -1});

            // 根据elec位置数据，添加transform
            p.attr({transform: `translate(${props.x},${props.y})`});
            this.elecList.push(p);
            return p;
        },

        /**
         * 画背景网格
         */
        drawBackground() {
            const b = this.root.group('background');
            let gridData = '';
            //  横网格
            for (let i = 0; i < this.svgSize.height / this.stepLength; i++) {
                gridData += `M0 ${i * this.stepLength}H ${this.svgSize.width}`;
            }

            // 竖网格
            for (let i = 0; i < this.svgSize.width / this.stepLength; i++) {
                gridData += `M${i * this.stepLength} 0 V ${this.svgSize.height}`;
            }
            this.drawSvgPath(b, [gridData], {color: '#000000', width: 0.1});
        },

        /**
         * 关闭窗口回调，清空数据
         */
        closeDialog() {
            document.getElementById('_rootSvg').remove();
            this.dialogVisible = false;
        }
    }
};
</script>

<style lang='less' scoped>
    .container {
        position: absolute;
        bottom: 0;
        float: left;
    }

    .circuit-dialog {
        background-color: #EEEEEE;
        box-shadow: 1px 3px 20px;
        .dialog-header {
            width: 100%;
            height: 40px;
            background-color: #cccccc;
            .dialog-title{
                font-size: 20px;
                display: inline-block;
                margin: 10px
            }
            .close-btn{
                float: right;
            }
        }
    }

    .elec-rect-back {
        opacity: 0.05;
    }
</style>
