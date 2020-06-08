// 渲染系统
import {System} from 'ecsy';
import {Text, Sprite, Graphics, utils} from 'pixi.js';

import {env} from '@/environment';
import store from '@/store/index';

import RenderDataComponent from '@/components/physical/renderData.js';
import ComplexEntityComponent from '@/components/physical/complexEntity';
import BindPostComponent from '@/components/physical/bindPost';

class RenderSystem extends System {

    init() {
        console.log('渲染系统开始执行了');
    }

    execute() {
        this.addSprite();
        //
        this.deleteSprite();
    }

    /**
     * @description 当渲染数据第一次添加的时候，新建精灵
     * @return {void}@memberof RenderSystem
     */
    addSprite() {
        const {added} = this.queries.renderEntitys;

        added.forEach(entity => {
            const data = entity.getMutableComponent(RenderDataComponent);
            const {atlasUrl, postionJson} = data;

            const atlasReg = /.json$/;
            const atlasRegPng = env.publicPath + atlasUrl.replace(atlasReg, '.png');

            const texture = utils.TextureCache[atlasRegPng];

            // TODO: 请求loader 重新加载图片
            if (!texture) {
                console.error('没有对应的纹理');
                return false;
            }
            const {stage} = window.PIXI.app;
            const newSprite = this.renderPositionData(postionJson);
            newSprite.entity = entity;
            // 如果被渲染的是复杂实体，将其子部分也放进去
            if (entity.hasComponent(ComplexEntityComponent)) {
                const complexData = entity.getComponent(ComplexEntityComponent);
                const entityList = complexData.contains;
                entityList.forEach(item => {
                    const temp = item.getComponent(RenderDataComponent);
                    newSprite.addChild(temp.sprite);
                });
            }
            stage.children[0].addChild(newSprite);
            // stage.addChild(newSprite);
            data.sprite = newSprite;
        });
    }

    /**
     * @description 当渲染数据被删除的时候，删除精灵以及接线信息
     * @return {void}@memberof RenderSystem
     */
    deleteSprite() {
        const {removed} = this.queries.renderEntitys;
        removed.forEach(entity => {
            //  清除渲染纹理
            if (entity.hasRemovedComponent(RenderDataComponent)) {
                const data = entity.getRemovedComponent(RenderDataComponent);
                const {sprite} = data;
                sprite.destroy();
            }
            // 清除接线柱相关信息
            if (entity.hasRemovedComponent(BindPostComponent)) {
                // 被删除的实体ID
                const selfID = entity.id;
                const {results} = this.queries.bindPostEntities;
                results.forEach(item => {
                    const data2 = item.getMutableComponent(BindPostComponent);
                    const {adjList} = data2;
                    Object.keys(adjList).forEach(item => {
                        const index0 = adjList[item].indexOf(`${selfID}_0`);
                        const index1 = adjList[item].indexOf(`${selfID}_1`);

                        if (index0 !== -1) {
                            data2.adjList[item].splice(index0, 1);
                        }
                        if (index1 !== -1) {
                            data2.adjList[item].splice(index1, 1);
                        }
                    });
                });
            }
        });
        if (removed.length !== 0) {
            store.commit('runCircuitCompute');
        }
    }

    /**
     * @description  将渲染数据用PIXI生成精灵
     * @param  {any} postionJson 渲染json
     * @param  {any} [parent=null] 有parent则将精灵放入父节点下
     * @return  {Sprite} 返回生成的精灵
     * @memberof RenderSystem
     */
    renderPositionData(postionJson, parent = null) {
        let sprite = null;
        // TODO: 提取到公共,避免重复读取
        const cache = utils.TextureCache;
        postionJson.forEach(item => {

            if (item.type === 'sprite') {
                const texture = cache[item.img] || null;
                if (!texture && item.img !== '') {
                    console.log(cache, item.img, item);
                    console.error('生产精灵时缓存里没有相应的纹理');
                }
                sprite = this.creatSprite(texture, item);
            }
            else if (item.type === 'label') {
                sprite = this.creatLabel(item);
            }
            else if (item.type === 'graphics') {
                sprite = this.creatGraphics(item);
            }

            if (parent) {
                parent.addChild(sprite);
            }
            if (item.children && item.children.length) {
                this.renderPositionData(item.children, sprite);
            }
        });
        return sprite;
    }

    /**
     * @description 将纹理生成精灵
     * @param  {any} texture 纹理
     * @param  {any} [param={}] 精灵的初始化数据
     * @return  {Sprite} 精灵
     * @memberof RenderSystem
     */
    creatSprite(texture, param = {}) {
        if (!param.anchor) {
            param.anchor = {
                x: 0.5,
                y: 0.5
            };
        }
        const sprite = new Sprite(texture);

        // 将纹理的名字作为精灵的名字
        if (param.img) {
            sprite.name = param.img;
        }

        if (param && param.scale) {
            const sx = param.scale.x;
            const sy = param.scale.y;
            sprite.scale.set(sx, sy);
        }
        if (param && param.width) {
            sprite.width = param.width;
        }
        sprite.alpha = param.alpha || 1;
        sprite.anchor = param.anchor;
        sprite.x = param.x || 0;
        sprite.y = param.y || 0;
        sprite.angle = param.angle || 0;

        return sprite;
    }

    /**
     * @description  生成Label
     * @param  {any} [param={}] label的初始化数据
     * @return  {Label} 返回生成的label
     * @memberof RenderSystem
     */
    creatLabel(param = {}) {
        if (!param.anchor) {
            param.anchor = {
                x: 0.5,
                y: 0.5
            };
        }
        // TODO:  默认字体大小
        const label = new Text(param.value, {
            fontFamily: 'Arial',
            fontSize: 30,
            fill: 0xff1010,
            align: 'center'
        });

        // 将纹理的名字作为精灵的名字
        if (param.value) {
            label.name = param.value;
        }

        if (param && param.scale) {
            const sx = param.scale.x;
            const sy = param.scale.y;
            label.scale.set(sx, sy);
        }
        label.alpha = param.alpha || 1;
        label.anchor = param.anchor;
        label.x = param.x || 0;
        label.y = param.y || 0;
        label.angle = param.angle || 0;

        return label;
    }

    /**
     * @description 生成图形
     * @param  {any} [param={}] 图形的初始化数据
     * @return  生成的图形
     * @memberof RenderSystem
     */
    creatGraphics(param = {}) {
        const graphics = new Graphics();
        const {x, y, r, w, h} = param;
        graphics.beginFill(param.fillColor, 0.5);
        if (param.shape === 'circle') {
            graphics.drawCircle(0, 0, r);
        }
        else if (param.shape === 'rect') {
            graphics.pivot = {x: w / 2, y: h / 2};
            graphics.drawRect(0, 0, w, h);
        }
        graphics.x = x;
        graphics.y = y;

        return graphics;
    }
}

RenderSystem.queries = {
    renderEntitys: {
        components: [RenderDataComponent],
        listen: {
            added: true,
            removed: true
        }
    },
    bindPostEntities: {components: [BindPostComponent]},
};

export default RenderSystem;
