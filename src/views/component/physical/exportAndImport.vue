<template>
    <div class="container">
        <el-button type="success" @click="export2File()">
            导出
        </el-button>
        <el-button type="success" @click="import4File()">
            导入
        </el-button>
        <el-button type="success" @click="circuitConver()">
            电路图转换
        </el-button>
        <el-button type="danger" icon="el-icon-delete" circle @click="clear()" />
        <CircuitConversion ref="converDialog" />
        <input id="upload" type="file" style="display:none" @change="handelUploadChange">
    </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import componentMap from '@/components/physical';
import CircuitConversion from '@/views/component/physical/circuitConversion';

export default {
    name: 'ExportAndImport',
    components: {CircuitConversion},
    data() {
        return {
        };
    },
    methods: {
        // ======================事件处理函数======================
        clear() {
            this.$emit('rebuildWorld');
        },
        showLoading(text = '导出') {
            return this.$notify({
                title: `正在${text}，请勿操作`,
                dangerouslyUseHTMLString: true,
                message: `<p><i class="el-icon-loading"></i>正在${text}，请勿操作</p>`,
                duration: 0,
                showClose: false
            });
        },
        hideLoading(notify) {
            notify.close();
        },
        // ***** 导出部分 start *****

        /**
         * 导出world中所有实体，生成json数据
         * @returns {Void}
         */
        export2File() {
            console.log('开始导出');
            const start = performance.now();
            const notify = this.showLoading('导出');
            // 暂停world 所有system 执行
            const world = window.ECS.world || null;
            const circuitEntity = this.$store.state.physical.circuitEntity || null;
            if (world) {
                world.stop();
            }
            else {
                this.$notify({message: '导出异常！！', type: 'error'});
                return false;
            }

            // 遍历世界的实体，不包括电路管理单例、连线实体 ，取数据
            // eslint-disable-next-line no-underscore-dangle
            const allEntitys =  world.entityManager._entities;
            const entities = allEntitys.filter(entity => entity.id !== circuitEntity.id && entity.alive);


            let wholeData = {time: new Date(), entityNum: entities.length, entities: {}};

            // eneity ID 作为KEY，读取时依赖ID顺序生成实体，确保连线正确
            const entitiesData = new Map();
            let times = 0;
            entities.forEach(entity => {
                // 用component类名作为key
                const components = entity.getComponents();
                const pre = performance.now();
                const componentsData = this.dealComponents(components);
                times = times + (performance.now() - pre);
                entitiesData.set(entity.id, JSON.stringify(componentsData));
            });

            wholeData.entities.keys = JSON.stringify([...entitiesData.keys()]);
            wholeData.entities.values = JSON.stringify([...entitiesData.values()]);

            wholeData = JSON.stringify(wholeData);

            // 启动下载
            const fileNmae = `电学实验${new Date().getTime()}.json`;
            this.download(fileNmae, wholeData);
            // 恢复world system 执行
            world.play();
            console.log('导出总耗时', performance.now() - start);
            this.hideLoading(notify);
            this.$notify({message: '导出成功！！', type: 'success'});
        },

        /**
         * 处理实体中的组件们
         * @param {Object} components 传入entity.getComponents()的返回值
         * @returns {Object} 返回的对象为实体所有组件的数据
         */
        dealComponents(components) {
            const entityData = {};
            for (const componentKey of Object.keys(components)) {
                // 只加入需要的数据，不涉及修改删除，不需要深拷贝了！👍
                const tempComponent = components[componentKey];
                const tempData = {type: 'normal'};
                const keys = Object.keys(tempComponent).filter(item => item !== 'sprite');
                keys.forEach(key => {
                    tempData[key] = tempComponent[key];
                    if (key === 'contains') {
                        // 复杂组件中存储子节点的entity数据
                        const newChildArr = [];
                        const childArr = tempComponent.contains;
                        for (let i = 0; i < childArr.length; i++) {
                            newChildArr[i] = childArr[i].id;
                        }
                        tempData.contains = newChildArr;
                        entityData.type = 'complex';
                    }
                    else if (key === 'parent') {
                        // 复杂组件中存储子节点的entity数据
                        tempData.parent = tempComponent.parent.id;
                        entityData.type = 'child';
                    }
                });

                entityData[componentKey] = tempData;
            }
            return entityData;
        },

        /**
         * 传入文件名和内容下载文件
         * @param {String} fileName 文件名
         * @param {String} text 要写入json文件的字符串
         * @returns {Void}
         */
        download(fileName, text) {
            const element = document.createElement('a');
            element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
            element.setAttribute('download', fileName);

            element.style.display = 'none';

            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },

        // ****导出部分 start*****
        /**
         * 导入的入口函数，调出文件上传框
         * @returns {Void}
         */
        import4File() {
            const element = document.getElementById('upload');
            element.click();
        },

        /**
         * 处理input标签 type='file' 的onchange
         * @param {Object} event event对象
         * @returns {Void}
         */
        handelUploadChange(event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = event => {
                this.resumeWorld(event.target.result);
            };
            reader.onerror = event => {
                this.$notify({message: '读取错误！！', type: 'error'});
            };
        },

        /**
         * 根据json数据恢复world
         * @param {JSON} jsonObj 传入导出时写入到文件里的json数据
        */
        resumeWorld(jsonObj) {
            const notify = this.showLoading('导入');
            // 校验数据
            const wholeObject = JSON.parse(jsonObj);
            if (!wholeObject) {
                this.$notify({message: '文件已损坏！！', type: 'error'});
                return false;
            }
            const entityDatas = JSON.parse(wholeObject.entities.values);
            const keys = JSON.parse(wholeObject.entities.keys);
            if (keys.length !== wholeObject.entityNum) {
                this.$notify({message: '文件已损坏！！', type: 'error'});
            }
            // 重新生成world
            this.$emit('rebuildWorld');

            // 开始恢复数据
            const world = window.ECS.world || null;
            // eslint-disable-next-line no-underscore-dangle
            const entities = world.entityManager._entities;
            keys.forEach((entityId, index) => {
                const entityData = JSON.parse(entityDatas[index]);
                const compKeys = Object.keys(entityData);
                // 生成实体，根据component类名增加component
                const newEntity = world.createEntity();
                if (entityData.type === 'complex') {
                    // 复杂组件必在它的子组件之后生成！
                    const childArr = entityData.ComplexEntityComponent.contains;
                    childArr.forEach((id, index) => {
                        const child = entities.find(entity => entity.id === +id);
                        entityData.ComplexEntityComponent.contains[index] = child;
                        child.getMutableComponent(componentMap.ChildEntityComponent).parent = newEntity;
                    });
                }
                compKeys.forEach(componentKey => {
                    if (componentMap[componentKey]) {
                        if (componentKey === 'ComplexEntityComponent') {
                            // do somthings
                        }
                        const componentData = entityData[componentKey];
                        newEntity.addComponent(componentMap[componentKey], componentData);
                    }
                });
                newEntity.id = +entityId;
            });
            this.$store.commit('runCircuitCompute');
            this.hideLoading(notify);
            this.$notify({message: '导入成功！！', type: 'success'});
        },

        /**
         *  电路图转换
         *
         */
        circuitConver() {
            // ********获得得pixi中所有精灵的位置信息
            const spriteArr = window.PIXI.container.children;
            const elecData = [];
            const linkInfo = [];
            const childEntityId = [];
            spriteArr.forEach(sprite => {
                const temp = {};
                temp.x = sprite.position.x;
                temp.y = sprite.position.y;
                temp.entityId = sprite.entity.id;
                // 分别处理简单实体和复杂实体
                if (sprite.entity.hasComponent(componentMap.ElecApplianceComponent)) {
                    temp.elecType = sprite.entity.getComponent(componentMap.ElecApplianceComponent).type;
                }
                else if (sprite.entity.hasComponent(componentMap.ComplexEntityComponent)) {
                    const complexData = sprite.entity.getComponent(componentMap.ComplexEntityComponent);
                    temp.elecType = complexData.type;
                    temp.childIdArr = complexData.contains.map(entity => entity.id);
                    childEntityId.push(...temp.childIdArr);
                }
                else {
                    return false;
                }
                elecData.push(temp);
            });

            // ******** 获得连线信息
            const adjList = cloneDeep(this.$store.state.physical.adjList);
            const keys = Object.keys(adjList);
            // 对adjList去重，只保留单向连线
            for (const start of keys) {
                adjList[start].forEach(end => {
                    const i = adjList[end].indexOf(start);
                    if (i >= 0) {
                        adjList[end].splice(i, 1);
                    }
                });
            }

            // 遍历adjList，转换成svg中的连线信息
            for (const start of keys) {
                const startResult = this.getLinkPos(childEntityId, elecData, start);

                if (!startResult) {
                    return false;
                }
                // 遍历终点集，生成连线节点对，压入linkInfo
                adjList[start].forEach(end => {
                    const endResult = this.getLinkPos(childEntityId, elecData, end);
                    if (!endResult) {
                        return false;
                    }
                    linkInfo.push([startResult, endResult]);
                });
            }
            // 过滤： A->B 与B->A重复   A->B 与A->B重复   A->A 自己连到自己不画线
            let deleteIndex = new Set();
            for (let i = 0; i < linkInfo.length; i++) {
                if (linkInfo[i][0] === linkInfo[i][1]) {
                    // A->A
                    deleteIndex.add(i);
                }
                else {
                    for (let k = i + 1; k < linkInfo.length; k++) {
                        if (linkInfo[i][0] === linkInfo[k][0] && linkInfo[i][1] === linkInfo[k][1]) {
                            // A->B  A->B
                            deleteIndex.add(k);
                        }
                        if (linkInfo[i][0] === linkInfo[k][1] && linkInfo[i][1] === linkInfo[k][0]) {
                            // A->B  B->A
                            deleteIndex.add(k);
                        }
                    }
                }
            }
            deleteIndex = [...deleteIndex];
            deleteIndex.sort((a, b) => b - a);
            deleteIndex.forEach(i => {
                linkInfo.splice(i, 1);
            });
            this.$refs.converDialog.show(elecData, linkInfo);
        },

        /**
         * 得到连线位置
         * @param childEntityId 子节点的entityid数组
         * @param elecData 上一步获取到的pixi精灵信息
         * @param node 要计算的接线柱信息
         */
        getLinkPos(childEntityId, elecData, node) {
            const nodeSplitArr = node.split('_');
            if (childEntityId.indexOf(+nodeSplitArr[0]) >= 0) {
                // 点或终点为复杂实体的子，找到它的父节点，并根据器件类型给出对应接线柱
                return this.getComplexLinkPos(elecData, nodeSplitArr);
            }
            // 点不是复杂实体的子节点
            return this.getNormalLinkPos(nodeSplitArr);
        },

        /**
         * 普通实体的连线位置
         * @param splitNodeArr 要计算的接线柱节点  split('_')的数组
         */
        getNormalLinkPos(splitNodeArr) {
            if (splitNodeArr[1] === '0') {
                // 负极在左边
                return `${splitNodeArr[0]}_l_2`;
            }
            // 正极在右边
            return `${splitNodeArr[0]}_r_2`;
        },

        /**
         * 获取复杂实体的连线位置
         * @param entityInfo 上一步获取到的pixi精灵信息
         * @param splitNodeArr 要计算的接线柱节点  split('_')的数组
         */
        getComplexLinkPos(entityInfo, splitNodeArr) {
            // 找到当前接线柱处在的复杂实体
            const parent = entityInfo.find(info => {
                // 是一个复杂组件
                if (info.childIdArr instanceof Array) {
                    const i = info.childIdArr.findIndex(childId => `${childId}` === splitNodeArr[0]);
                    if (i >= 0) {
                        return info;
                    }
                }
            });
            if (!parent) {
                console.warn('数据异常，没有找到对应的复杂节点');
                return false;
            }
            // TODO 根据复杂组件的类型决定位置，暂时写死只用l_2/r_2，负极（0）左，正极（1）右
            if (splitNodeArr[1] === '0') {
                // 负极在左边
                return `${parent.entityId}_l_2`;
            }
            // 正极在右边
            return `${parent.entityId}_r_2`;
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
