/* eslint-disable no-restricted-properties */
/* eslint-disable no-loop-func */
//  环形电路判断
import {System} from 'ecsy';
import cloneDeep from 'lodash/cloneDeep';
import store from '@/store/index';
import CircuitComponent from '@/components/physical/circuitData';
import ElecAppliance from '@/components/physical/elecAppliance';
import BindPost from '@/components/physical/bindPost';
import ElecType from '@/settings/physical/elecType';
import gauss from '@/settings/physical/gauss';
import ComplexEntityComponent from '@/components/physical/complexEntity';
import VoltmeterComponent from '@/components/physical/voltmeter';
import AmmeterComponent from '@/components/physical/ammeter';
import * as getNextNode from '@/settings/physical/getNextNodeFunc';

// 算法参考：HDU 3976
// https://www.cnblogs.com/kuangbin/p/3428573.html

const MinResistance = Math.pow(10, -10);
class CircuitSystem extends System {
    init() {
        console.log('电路管理单例开始执行了');
    }

    execute() {
        const circuit = store.state.physical.circuitEntity.getMutableComponent(CircuitComponent);
        if (!circuit.isChange) {
            return false;
        }
        // 收集信息
        let {entities, adjList, props, battery} = this.getAllInfo();
        if (!this.validData(entities, adjList, props, battery)) {
            circuit.isChange = false;
            return false;
        }

        // 计算器件数据
        props = this.getProps(entities, adjList, props, battery);
        if (!props) {
            circuit.isChange = false;
            return false;
        }


        // 对器件提交数据
        this.distributeData(props, entities, battery);
        // 处理 电流电压表
        this.dealVoltmeter();
        this.dealAmmeter();

        circuit.isChange = false;
    }


    /**
     * 校验收集到的数据是否符合要求
     * @param {*} entities
     * @param {*} adjList
     * @param {*} props
     * @param {*} battery
     */
    validData(entities, adjList, props, battery) {
        if (!(entities instanceof Array) || entities.length <= 0) {
            return false;
        }
        const totalNodeNum = entities.length;
        if (!adjList || Object.keys(adjList).length !== totalNodeNum * 2) {
            return false;
        }
        if (!props || Object.keys(props).length !== totalNodeNum) {
            return false;
        }
        if (!battery) {
            return false;
        }
        return true;
    }

    /**
     * 计算元器件属性总入口
     * @param {*} entities 实体
     * @param {*} adjList 邻接表
     * @param {*} props 属性
     * @param {*} battery 电源
     * @returns 返回props
     */
    getProps(entities, adjList, props, battery) {
        // 取起点和终点接线柱名
        const start = `${battery.id}_1`;
        const end = `${battery.id}_0`;

        // 是否有通路
        const accessRoad = this.getAllAccessRoad(adjList, entities, start, end);
        if (!accessRoad) {
            return props;
        }

        // 根据通路信息 去除 “杂点”  DONE!
        const waitVisitPost = this.filterLinkPost(accessRoad);
        if (waitVisitPost.length <= 0) {
            return props;
        }

        // 遍历待划分等势点的接线柱数组，找出 ①等势点->接线柱映射表 DONE!
        const postMapTable = this.getEquipotentialPointInfo(adjList, entities, props, waitVisitPost, start, end);

        // 等势点间阻值数据 作为算法输入
        const algorithmInput = this.getEquipotentialResistance(postMapTable, waitVisitPost, battery, props);

        // 生成并求解基尔霍夫方程组
        const algorithmOutput = this.getPotential(algorithmInput, postMapTable);

        // 根据算法输出结果，计算各等势点电势，进而得到各个元器件的电压、电流、功率
        props = this.caculate(props, postMapTable, algorithmOutput, waitVisitPost, battery);
        return props;
    }

    /**
     * 获取电路需要的全部信息，包括entities, props, adjList,battery实体
     * @returns {Object} 返回对象：{entities, adjList, props, battery}
     */
    getAllInfo() {
        const entities = this.queries.entities.results;
        const adjList = {};
        const props = {};
        // 取电源 DONE!
        const battery = this.getBattery(entities);
        entities.forEach(entity => {
            const elecProp = entity.getComponent(ElecAppliance);
            const post = entity.getComponent(BindPost);

            for (const key of Object.keys(post.adjList)) {
                adjList[key] = post.adjList[key];
            }

            props[entity.id] = {
                r: elecProp.resistance === 0 ? MinResistance : elecProp.resistance,
                u: 0,
                i: 0,
                power: 0,
                maxPower: elecProp.maxPower,
                ratedPower: elecProp.ratedPower
            };
        });
        store.commit('updateAdjList', adjList);
        return {entities, adjList, props, battery};
    }


    /**
     * 从entities中找到battery实体
     * @param {Object} entities 所有实体数组
     */
    getBattery(entities) {
        const batteryEntity = entities.find(entity =>
            entity.getComponent(ElecAppliance).type === ElecType.Battery);
        return batteryEntity || null;
    }

    /**
     * 找到adjList邻接表中所有从startName -> endName的通路（简单路径）
     * @param {Object} adjList 邻接表
     * @param {Object} entities 实体数组
     * @param {String} startName 开始接线柱名
     * @param {String} endName 结束接线柱名
     * @returns {Array} accessRoad是数组，元素为通路，通路是节点的数组
     */
    getAllAccessRoad(adjList, entities, startName, endName) {
        const startAdjList = adjList[startName];
        const endAdjList = adjList[endName];
        if (!(startAdjList instanceof Array) || startAdjList.length <= 0) {
            return false;
        }
        if (!(endAdjList instanceof Array) || endAdjList.length <= 0) {
            return false;
        }
        const accessRoad = [];
        // 进入查找循环，先初始化两个栈
        const stackMain = [];
        const stackAssitance = [];
        // 首次建栈
        stackMain.push(startName);
        stackAssitance.push(startAdjList);
        while (stackMain.length > 0) {
            // 获取辅栈栈顶，为邻接节点列表，邻接节点列表应过滤主栈元素
            const adjVerticesList = stackAssitance.pop().filter(item => !stackMain.includes(item));

            if (adjVerticesList.length > 0) {
                // 1.获取邻接节点列表首个元素
                // 2.将该元素压入主栈，剩下列表压入辅栈
                // 3.建栈
                let node = adjVerticesList.shift();
                stackMain.push(node);
                stackAssitance.push(adjVerticesList);
                stackAssitance.push(adjList[node].filter(item => !stackMain.includes(item)));
                // 让器件选择下一步节点
                const currentElecAppliance = entities
                    .find(entity => `${entity.id}` === node.substring(0, node.length - 2))
                    .getComponent(ElecAppliance);

                node = getNextNode[currentElecAppliance.getNextNode](
                    node,
                    currentElecAppliance.isDistinguish,
                    currentElecAppliance.status
                );
                if (node !== null) {
                    let tempList = adjList[node];
                    stackMain.push(node);
                    tempList = tempList instanceof Array ? tempList : [];
                    stackAssitance.push(tempList);
                }
            }
            else {
                // 邻接点列表为空 削栈
                stackMain.pop();
            }
            if (stackMain[stackMain.length - 1] === endName) {
                // 到达结束节点，保存当前路径
                accessRoad.push(cloneDeep(stackMain));
                stackMain.pop();
                stackAssitance.pop();
            }
        }
        return accessRoad;
    }

    /**
     * 过滤所有不在通路中出现的点，以便计算划分等势点
     * @param {Array} accessRoad 通路数组
     * @returns {Set} 返回所有待划分等势点的接线柱
     */
    filterLinkPost(accessRoad) {
        // 根据通路信息找出待划分等势点的接线柱数组
        let result = new Set();
        accessRoad.map(road => {
            road.map(post => result.add(post));
            return false;
        });
        result = Array.from(result);
        return result;
    }

    /**
     * 传入接线柱名和邻接表，查找出该接线柱所有通过导线可达的连接点
     * @param {String} post 待查找接线柱
     * @param {Object} adjList 邻接表
     */
    getSamePostLink(post, adjList) {
        // 获取导线直连的所有点
        if (!post.includes('_')) {
            return [];
        }
        let list = adjList[post];
        const quene = [...list];
        let samePostArr = [post];
        while (quene.length > 0) {
            const v = quene.shift();
            samePostArr.push(v);
            list = adjList[v].filter(key => !samePostArr.includes(key));
            samePostArr.push(...list);
            quene.push(...list);
        }
        samePostArr = Array.from(new Set(samePostArr));
        return samePostArr;
    }

    /**
     * 找到所有零电阻可达的点
     * @param {Array} entities 所有实体
     * @param {Object} props 所有实体对应属性
     * @param {Array} nodeArr 待查节点数组
     * @returns {Array} 零电阻可达点
     */
    getZeroResistance(entities, props, nodeArr) {
        // 获取所有0阻值可达点
        const visited = new Set(nodeArr);
        const quene = nodeArr;
        while (quene.length > 0) {
            let currentNode = quene.shift();
            const entityId = currentNode.split('_')[0];
            if (props[entityId].r === 0) {
                // 器件电阻值为0
                const entity = entities.find(e => `${e.id}` === entityId);
                const currentElecAppliance = entity.getComponent(ElecAppliance);
                currentNode = currentElecAppliance.getNextNode(
                    currentNode,
                    currentElecAppliance.isDistinguish,
                    currentElecAppliance.status
                );
                if (currentNode !== null && !visited.has(currentNode)) {
                    // getNextNode 是一个新的点，那么让它入队，且它的所有直连的点也要入队
                    let tempArr = this.getSamePostLink(currentNode);
                    tempArr = tempArr.filter(node => !visited.has(node));
                    tempArr.forEach(node => visited.add(node));
                    visited.add(currentNode);
                    quene.push(currentNode, ...tempArr);
                }
            }
        }
        return Array.from(visited);
    }

    /**
     * 划分接线柱->等势点，且start和end要分别处于第一个和最后一个等势点，方便之后的基尔霍夫算法计算
     * @param {Object} adjList 邻接表
     * @param {Array} entities 所有实体数组
     * @param {Object} props 所有实体属性对象
     * @param {Set} waitVisitPost 带划分的接线柱
     * @param {String} start 开始点
     * @param {String} end 结束点
     * @returns {Array} 等势点 -> 接线柱数组的映射，数组下标为等势点，对应值为接线柱数组，一个等势点可以对应多个接线柱。
     */
    getEquipotentialPointInfo(adjList, entities, props, waitVisitPost, start, end) {
        // 遍历带划分等势点的接线柱数组，找出  ①等势点->接线柱映射表
        // 划分等势点 DONE!
        const visited = [];
        const postMapTable = [];
        let leftPostQuene = cloneDeep(waitVisitPost);
        let equiPost = [];
        while (leftPostQuene.length > 0) {
            const node = leftPostQuene.shift();
            // 找到所有导线直连点
            equiPost = this.getSamePostLink(node, adjList);
            // 找到所有0阻值可达点
            equiPost = this.getZeroResistance(entities, props, equiPost);
            if (visited.filter(n => equiPost.includes(n)).length > 0) {
                // 两个等势点所具有的接线柱不可能有交集
                return false;
            }
            // visited加入这些点
            visited.push(...equiPost);
            // 等势点表加入
            postMapTable.push(equiPost);
            // 更新待遍历节点
            leftPostQuene = leftPostQuene.filter(post => !visited.includes(post));
        }
        // 对等势点排序，start - 第一个等势点   end - 最后一个等势点
        let startIndex = -1;
        let endIndex = -1;
        postMapTable.forEach((nodeArr, index) => {
            if (nodeArr.includes(start)) {
                startIndex = index;
            }
            else if (nodeArr.includes(end)) {
                endIndex = index;
            }
        });
        if (startIndex >= 0 && endIndex >= 0) {
            this.swapPostMapElement(postMapTable, startIndex, 0);
            this.swapPostMapElement(postMapTable, endIndex, postMapTable.length - 1);
        }
        return postMapTable;
    }

    /**
     * 根据器件信息、等势点->接线柱映射，可以获取相邻两个等势点间的电阻数据 PS:两个等势点确定一个器件
     * @param {Array} postMapTable 等势点->接线柱映射 数组
     * @param {String[]|Set} waitVisitPost 带划分节点
     * @param {Object} batteryEntity 电源实体
     * @param {Object} props 属性对象
     * @returns {Number[]} 返回电阻数组
     */
    getEquipotentialResistance(postMapTable, waitVisitPost, batteryEntity, props) {
        const waitVisit = waitVisitPost.filter(post => post.split('_')[0] !== `${batteryEntity.id}`);
        const result = [];
        const visited = [];
        const waitVisitEntity = waitVisit.map(post => post.split('_')[0]);
        waitVisitEntity.forEach(entityId => {
            // nodeArr暂存节点对
            const nodeArr = [];
            postMapTable.forEach((postArr, pointNum) => {
                if (postArr.findIndex(post => post.split('_')[0] === entityId) > -1) {
                    nodeArr.push(pointNum);
                }
            });

            // 按理说nodeArr只有2元素
            if (nodeArr.length === 2 && !visited.includes(entityId)) {
                visited.push(entityId);
                result.push([...nodeArr, props[entityId].r]);
            }
        });
        return result;
    }

    /**
     * 交换数组的两个下标元素
     * @param {*} array 待交换数组
     * @param {Number} index1 下标1
     * @param {Number} index2 下标2
     * @returns {Void}
     */
    swapPostMapElement(array, index1, index2) {
        const temp = array[index1];
        array[index1] = array[index2];
        array[index2] = temp;
    }

    /**
     * 求解基尔霍夫方程 得到等势点电压
     * @param {Number[]} algorithmInput 等势点电阻
     * @param {Object} postMapTable 等势点接线柱映射表
     * @returns {Number[]} 等势点电压数组
     */
    getPotential(algorithmInput, postMapTable) {
        // 初始化方程组
        const A = [];
        const X = [];
        const nodeNum = postMapTable.length;
        if (nodeNum <= 1) {
            return false;
        }
        // 等式数量
        const equ = nodeNum;
        // 等效点数量
        const vNum = nodeNum;

        // 初始化系数矩阵A
        for (let i = 0; i < nodeNum; i++) {
            A[i] = [];
            for (let j = 0; j < nodeNum; j++) {
                A[i][j] = 0;
            }
        }

        // 系数矩阵计算，只取无向图的邻接矩阵的上三角矩阵
        for (let k = 0; k < algorithmInput.length; k++) {
            const i = algorithmInput[k][0];
            const j = algorithmInput[k][1];
            const val = 1 / algorithmInput[k][2];
            A[i][j] += val;
            A[j][i] += val;
            A[i][i] -= val;
            A[j][j] -= val;
        }

        // 初始化常量向量
        for (let i = 0; i < nodeNum; i++) {
            X[i] = 0;
            A[nodeNum - 1][i] = 0;
        }
        X[0] = -1;
        X[nodeNum - 1] = 0;
        A[nodeNum - 1][0] = 1;

        // 高斯消元法解方程组
        const result = gauss(A, X, equ, vNum, Math.pow(10, -8));
        return result;
    }

    /**
     * 计算器件属性值
     * @param {*} props 实体属性数组
     * @param {*} postMapTable 等势点-> 接线柱映射表
     * @param {Array} pointResistance  数组下标为等势点，两个元素之差为等势点间电阻值
     * @param {Array} waitVisitPost 待计算节点数组
     * @param {*} batteryEntity 电源实体
     */
    caculate(props, postMapTable, pointResistance, waitVisitPost, batteryEntity) {
        if (!(pointResistance instanceof Array)) {
            return false;
        }
        // STEP1 准备数据
        // 说明：EMF=电源电动势   BIR=电源内阻  OTV=电源外接电路总电压  OTR = 电源外总电阻
        // waitVisit 为不包含电源的entityID数组
        const waitVisit = waitVisitPost
            .filter(post => post.split('_')[0] !== `${batteryEntity.id}`)
            .map(post => post.split('_')[0]);
        const batteryData = batteryEntity.getComponent(ElecAppliance);
        const EMF = batteryData.voltage;
        const BIR = batteryData.resistance;
        let OTV = 0;
        const OTR = Math.abs(pointResistance[0] - pointResistance[pointResistance.length - 1]);
        if (BIR === 0) {
            // 电源内阻为0
            OTV = EMF;
        }
        else {
            OTV = (OTR * EMF) / (BIR + OTR);
        }
        props[batteryEntity.id].i = OTV / OTR;
        props[batteryEntity.id].power = (OTV * OTV) / OTR;

        // STEP2 计算等势点电势
        const potential = [0];
        for (let i = 1; i < pointResistance.length; i++) {
            const resistance = pointResistance[i];
            potential.push((OTV * resistance) / OTR);
        }

        // STEP3 遍历器件，计算器件的数据
        for (let i = 0; i < waitVisit.length; i++) {
            const entityId = waitVisit[i];
            const prop = props[entityId];
            const tempPoint = [];
            // 找到该元器件对应的等势点
            postMapTable.forEach((postArr, index) => {
                if (postArr.findIndex(post => post === `${entityId}_0`) > -1) {
                    // 负极
                    tempPoint[0] = index;
                }
                else if (postArr.findIndex(post => post === `${entityId}_1`) > -1) {
                    // 正极
                    tempPoint[1] = index;
                }
            });
            if (tempPoint.length === 2) {
                // 阻值不为0的器件,计算 正极->负极的电势差
                prop.u = potential[tempPoint[1]] - potential[tempPoint[0]];
                prop.i = prop.u / prop.r;
                prop.u = Math.abs(prop.u);
                prop.power = Math.abs(prop.u * prop.i);
                props[entityId] = prop;
            }
        }
        return props;
    }

    /**
     * 处理电压表状态和示数
     * @returns {Void}
     */
    dealVoltmeter() {
        const voltmeters = this.queries.voltmeterEntitys.results;
        voltmeters.forEach(voltmeter => {
            const voltmeterData = voltmeter.getMutableComponent(VoltmeterComponent);
            const childArr = voltmeter.getComponent(ComplexEntityComponent).contains;

            const entityLarge = childArr[0];
            const entitySmall = childArr[1];

            const u1 = entityLarge.getComponent(ElecAppliance).voltage;
            const u2 = entitySmall.getComponent(ElecAppliance).voltage;

            // 如果两个都有电压，错误，电压为0
            if (u1 && u2) {
                voltmeterData.voltage = 0;
                voltmeterData.status = 2;
                voltmeterData.rangeType = -1;
            }
            else if (u1 || u2) {
                // 如果一个有电压，正常，电压为有示数的电压值
                voltmeterData.voltage = u1 || u2;
                voltmeterData.status = 0;
                voltmeterData.rangeType = u1 ? 1 : 0;
            }
            else if (!u1 && !u2) {
                // 如果都没有电压，未俩连接，电压未0
                voltmeterData.voltage = 0;
                voltmeterData.status = 0;
                voltmeterData.rangeType = -1;
            }
        });
    }


    /**
     * 处理电流表状态和示数
     * @returns {Void}
     */
    dealAmmeter() {
        const ammeter = this.queries.ammeterEnetitys.results;
        ammeter.forEach(ammeter => {
            const ammterData = ammeter.getMutableComponent(AmmeterComponent);
            const childArr = ammeter.getComponent(ComplexEntityComponent).contains;

            const entityLarge = childArr[0];
            const entitySmall = childArr[1];

            const i1 =  entityLarge.getComponent(ElecAppliance).current;
            const i2 =  entitySmall.getComponent(ElecAppliance).current;
            // 如果两个都有电压，错误，电压为0
            if (i1 * 10000 && i2 * 10000) {
                ammterData.current = 0;
                ammterData.status = 2;
                ammterData.rangeType = -1;
            }
            else if (i1 || i2) {
                // 如果一个有电压，正常，电压为有示数的电压值
                ammterData.current = i1 || i2;
                ammterData.status = 0;
                ammterData.rangeType = i1 ? 1 : 0;
            }
            else if (!i1 && !i2) {
                // 如果都没有电压，未俩连接，电压未0
                ammterData.current = 0;
                ammterData.status = 0;
                ammterData.rangeType = -1;
            }
        });
    }

    /**
     * 给元器件们分发数据
     * @param {Object} props 属性
     * @param {Object} entities 实体
     * @param {Object} batteryEntity 电源实体
     * @returns {Void}
     */
    distributeData(props, entities, batteryEntity) {
        for (const entityID of Object.keys(props)) {
            const prop = props[entityID];
            const entity = entities.find(v => `${v.id}` === entityID);
            const data = entity.getMutableComponent(ElecAppliance);
            data.power = prop.power;
            data.current = prop.i;
            if (entityID !== `${batteryEntity.id}`) {
                data.voltage = prop.u;
            }
        }
    }
}

CircuitSystem.queries = {
    entities: {components: [ElecAppliance, BindPost]},
    voltmeterEntitys: {components: [VoltmeterComponent]},
    ammeterEnetitys: {components: [AmmeterComponent]},
    complex: {components: [ComplexEntityComponent]}
};
export default CircuitSystem;
