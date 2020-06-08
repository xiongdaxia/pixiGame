// 划线
import {System} from 'ecsy';
import {Graphics, SimpleRope, utils} from 'pixi.js';

import settings from '@/settings/physical/settings';
import store from '@/store/index';

import BindPostComponent from '@/components/physical/bindPost';
import RenderDataComponent from '@/components/physical/renderData.js';
import LineDataComponent from '@/components/physical/line';
import ChildEntityComponent from '@/components/physical/childEntity';

import createLineEntity from '@/entity/physical/line';

class DrawLineSystem extends System {
    init() {
        console.log('画线系统开始执行了');
        // 存放全局的接线柱graphcs
        this.bindPostGraphcsArr = [];
        // 存放开始生效的graphcs
        this.activeStartGraphcs = null;
        // 记录画虚线时候的点
        this.points2 = [];
    }

    execute() {
        this.bindDrawDottedLineEvent();
        // 为每一个真实的线实体，通过纹理画真正的实线
        this.drawRealLineEntity();
        // 删除线实体
        this.deleteLineEntty();
    }

    /**
     * @description 为每一个有接线柱的实体添加画虚线事件
     * @return {void}@memberof DrawLineSystem
     */
    bindDrawDottedLineEvent() {
        const {added} = this.queries.bindPostEntitys;
        added.forEach(entity => {
            const bindPostData = entity.getMutableComponent(BindPostComponent);
            const {bindPostArea} = bindPostData;

            const renderData = entity.getComponent(RenderDataComponent);
            const {sprite} = renderData;
            if (!sprite) {
                console.error('为接线柱绑定画虚线事件时，没有实体精灵～');
                return false;
            }
            this.startBindEvent(bindPostArea, sprite, entity);
        });
    }

    /**
     * @description 为每一个真实的线实体，通过纹理画真正的实线
     * @return {void}@memberof DrawLineSystem
     */
    drawRealLineEntity() {
        const {added} = this.queries.realLineEntitys || [];

        added.forEach(entity => {
            const lineData = entity.getMutableComponent(LineDataComponent);
            const {atlasUrl, img, points} = lineData;

            const sprite = this.renderLine(atlasUrl, img, points);
            sprite.entity = entity;
            lineData.sprite = sprite;
        });
    }

    /**
     * @description 删除线精灵，并删除相关接线柱信息
     * @return {void}@memberof DrawLineSystem
     */
    deleteLineEntty() {
        const results = this.queries.realLineEntitys.removed || [];
        results.forEach(entity => {
            if (entity.hasRemovedComponent(LineDataComponent)) {
                const data = entity.getRemovedComponent(LineDataComponent);
                const {sprite, connectBindPost} = data;
                const connectEntityIDArr = connectBindPost.map(item => +item.split('_')[0]);
                sprite.destroy();
                // 删除接线柱信息
                const {results} = this.queries.bindPostEntitys;
                const entityArr = [];
                results.forEach(item => {
                    if (connectEntityIDArr.indexOf(item.id) !== -1) {
                        entityArr.push(item);
                    }
                });

                const p0 = connectBindPost[0];
                const p1 = connectBindPost[1];
                entityArr.forEach(item2 => {
                    const data2 = item2.getMutableComponent(BindPostComponent);
                    const r0 = data2.adjList[p0];
                    const r1 = data2.adjList[p1];

                    if (r0 && r0.length > 0) {
                        r0.splice(r0.indexOf(p1), 1);
                    }
                    if (r1 && r1.length > 0) {
                        r1.splice(r1.indexOf(p0), 1);
                    }
                });
            }
        });
        if (results.length !== 0) {
            store.commit('runCircuitCompute');
        }
    }

    /**
     * @description 使用线的纹理画出真实的线
     * @param  {any} atlasUrl 线的纹理图集
     * @param  {any} img 线使用的具体纹理
     * @return  {SimpleRope} SimpleRope线精灵
     * @memberof DrawLineSystem
     */
    renderLine(atlasUrl, img, points) {
        const cache = utils.TextureCache;
        const atlasReg = /.json$/;
        const atlasRegPng = atlasUrl.replace(atlasReg, '.png');

        const texture = cache[atlasRegPng];
        // TODO: 请求loader 重新加载图片
        if (!texture) {
            console.error('没有线的图集');
        }

        const sprite = new SimpleRope(cache[img], points);

        const {stage} = window.PIXI.app;
        stage.children[0].addChild(sprite);
        return sprite;
    }

    /**
     * @description TODO: (带优化)根据points中点的值计算关键点数组
     * @param  {any} points 画线的原始点
     * @return   {Array} 新生成的点
     * @memberof DrawLineSystem
     */
    calculateKeyPoints(points) {
        // 1,分段，每一小段15-20个点，每个小段的长度是固定的，（每一小段按照夹角划分）
        // 2，points 的总长度 = 初始值 + 段数 * 20 + 终点值
        const distance = settings.REALLNE_DISTANCE;
        const pointArr = [];
        const startPoints = points.shift();
        const endPoints = points.pop();
        pointArr.push(startPoints);
        const len = points.length;
        console.log(len, 'len');
        const num = Math.floor(len / distance);
        console.log(num, 'num');

        for (let i = 1; i < num; i++) {
            pointArr.push(this.points2[distance * i]);
        }
        pointArr.push(endPoints);
        console.log(pointArr.length, 'length');

        return pointArr;
    }

    /**
     * @description 往精灵里添加两个graphs，绑定事件连线，并实时更新adjList
     * @param  {any} area graphs的生效范围
     * @param  {any} sprite 绑定事件的纹理精灵
     * @param  {any} entity 实体
     * @return {void}@memberof DrawLineSystem
     */
    startBindEvent(area, sprite, entity) {
        const bindPostData = entity.getMutableComponent(BindPostComponent);
        const {adjList} = bindPostData;

        area.forEach((item, index) => {
            if (item.isIgnore) {
                // 忽略，不执行的接线柱
                return false;
            }
            const {x, y, w, h} = item;

            const graphcs = new Graphics();
            graphcs.beginFill(0x66ccff, 1);
            graphcs.alpha = 0.5;
            graphcs.pivot = {x: w / 2, y: h / 2};

            graphcs.drawRect(0, 0, w, h);
            graphcs.x = x;
            graphcs.y = y;

            graphcs.endFill();
            graphcs.entity = entity;
            graphcs.bindPostName = `${entity.id}_${index}`;

            if (!Object.keys(adjList).includes(graphcs.bindPostName)) {
                bindPostData.adjList[graphcs.bindPostName] = [];
            }
            sprite.addChild(graphcs);
            this.bindPostEvent(graphcs);

            this.bindPostGraphcsArr.push(graphcs);
        });
    }

    /**
     * @description 为单个接线柱绑定事件
     * @param  {any} graphcs 图形节点
     * @return {void}@memberof DrawLineSystem
     */
    bindPostEvent(graphcs) {
        graphcs.interactive = true;
        graphcs.on('pointerdown', this.touchStart.bind(this));
        graphcs.on('pointermove', this.touchMove.bind(this));
        graphcs.on('pointerup', this.touchEnd.bind(this));
        graphcs.on('pointerupoutside', this.touchEnd.bind(this));
    }

    /**
     * @description 开始触碰
     * @param  {any} e Event对象
     * @return  null
     * @memberof DrawLineSystem
     */
    touchStart(e) {
        // 阻止事件继续传递
        e.stopPropagationHint = true;

        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        this.activeStartGraphcs = target;

        const graphcs = new Graphics();

        graphcs.lineStyle(settings.DOTTED_WIDTH, settings.DOTTED_COLOR);
        graphcs.isTouching = true;

        const {stage} = window.PIXI.app;
        const container = stage.children[0];

        graphcs.startPos = container.toLocal(target.toGlobal({x: target.width / 2, y: target.height / 2}));
        container.lineGraphcs = graphcs;
        container.addChild(graphcs);

        // 开始画线
        this.points2 = [];
        this.points2.push({x: graphcs.startPos.x, y: graphcs.startPos.y});
    }

    /**
     * @description 开始移动
     * @param  {any} e Event对象
     * @return  null
     * @memberof DrawLineSystem
     */
    touchMove(e) {
        // e.stopPropagationHint = true;

        const target = e.currentTarget;
        if (!target) {
            return false;
        }

        const {stage} = window.PIXI.app;
        const container = stage.children[0];

        const graphcs = container.lineGraphcs;

        if (!graphcs || !graphcs.isTouching) {
            return false;
        }

        const {startPos} = graphcs;

        const endPos = container.toLocal(e.data.global);
        graphcs.moveTo(startPos.x, startPos.y);
        graphcs.lineTo(endPos.x, endPos.y);
        this.points2.push({x: endPos.x, y: endPos.y});
        graphcs.startPos = endPos;
    }

    /**
     * @description 触碰结束，离开屏幕
     * @param  {any} e Event对象
     * @return  null
     * @memberof DrawLineSystem
     */
    touchEnd(e) {
        // e.stopPropagationHint = true;
        const {stage} = window.PIXI.app;
        const container = stage.children[0];
        const graphcs = container.lineGraphcs;
        if (!graphcs || !graphcs.isTouching) {
            return false;
        }

        graphcs.isTouching = false;

        const endPos = e.data.global;

        // 判断是否有效
        let validGraphcs = null;
        this.bindPostGraphcsArr.some(item => {
            const box = item.getBounds();
            const isContain = box.contains(endPos.x, endPos.y);
            validGraphcs = isContain ? item : null;
            //  如果起始节点和结尾节点重合，返回false
            if (item.bindPostName === this.activeStartGraphcs.bindPostName) {
                return false;
            }
            return isContain;
        });
        console.log('画线结束时候的有效graphcs：', validGraphcs);

        // 如果是一条有效的线，使用线纹理生成一个线实例，并要通知circuit 需要重新计算电路
        if (validGraphcs) {
            //  首尾接线柱的实体 Name
            const endBindPostName = validGraphcs.bindPostName;
            const startBindPostName = this.activeStartGraphcs.bindPostName;

            console.log('连线开始结束点', startBindPostName, endBindPostName);

            const startEntity = this.activeStartGraphcs.entity;
            const endEntity = validGraphcs.entity;

            this.points2.push(
                container.toLocal(
                    validGraphcs.toGlobal({
                        x: validGraphcs.width / 2,
                        y: validGraphcs.height / 2
                    })
                )
            );

            // 更新开始接线柱的adjList
            const startBindPostData = startEntity.getMutableComponent(BindPostComponent);
            const startAdjList = startBindPostData.adjList;
            const startValue = startAdjList[startBindPostName] || [];

            startValue.push(endBindPostName);
            startAdjList[startBindPostName] = startValue;

            // 更新结束接线柱的adjList
            const endBindPostData = endEntity.getMutableComponent(BindPostComponent);
            const endAdjList = endBindPostData.adjList;
            const endValue = endAdjList[endBindPostName] || [];

            endValue.push(startBindPostName);
            endAdjList[endBindPostName] = endValue;

            // 生成一个线的实例
            const newLine = createLineEntity(window.ECS.world);
            const lineData = newLine.getMutableComponent(LineDataComponent);

            lineData.connectEntityID.push(this.getEetityID(startEntity));
            lineData.connectEntityID.push(this.getEetityID(endEntity));

            lineData.connectBindPost.push(startBindPostName);
            lineData.connectBindPost.push(endBindPostName);

            lineData.points = this.calculateKeyPoints(this.points2);

            store.commit('runCircuitCompute');
        }
        container.removeChild(container.lineGraphcs);
        container.lineGraphcs = null;
    }

    /**
     * @description 得到实体ID，如果是复杂实体，返回其父亲实体ID
     * @param  {any} entity 实体
     * @return  {Number} ID
     * @memberof DrawLineSystem
     */
    getEetityID(entity) {
        if (entity.hasComponent(ChildEntityComponent)) {
            const data = entity.getComponent(ChildEntityComponent);
            return data.parent.id;
        }
        return entity.id;
    }
}
DrawLineSystem.queries = {
    bindPostEntitys: {
        components: [BindPostComponent, RenderDataComponent],
        listen: {
            added: true
        }
    },
    realLineEntitys: {
        components: [LineDataComponent],
        listen: {
            added: true,
            removed: true
        }
    }
};
export default DrawLineSystem;
