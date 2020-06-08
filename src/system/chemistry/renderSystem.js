// 渲染系统
import * as PIXI from 'pixi.js';

import {System} from 'ecsy';
import {env} from '@/environment';

import RenderComponent from '@/components/chemistry/renderComponent.js';

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
        const cache = PIXI.utils.TextureCache;
        const {added} = this.queries.renderEntitys;

        added.forEach(entity => {
            const data = entity.getMutableComponent(RenderComponent);
            const {atlasUrl, postionJson} = data;

            const atlasReg = /.json$/;
            const atlasRegPng = env.publicPath + atlasUrl.replace(atlasReg, '.png');

            const texture = cache[atlasRegPng];
            // TODO: 请求loader 重新加载图片
            if (!texture) {
                console.error('没有对应的纹理');
                return false;
            }
            const {stage} = window.PIXI.app;
            const newSprite = this.renderPositionData(postionJson);
            newSprite.entity = entity;
            stage.children[0].addChild(newSprite);
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
            if (entity.hasRemovedComponent(RenderComponent)) {
                const data = entity.getRemovedComponent(RenderComponent);
                const {sprite} = data;
                sprite.destroy();
            }
        });
        if (removed.length !== 0) {
            // do somthings
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
        const cache = PIXI.utils.TextureCache;
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
            else if (item.type === 'container') {
                sprite = this.createContainer(item);
            }
            else if (item.type === 'rectGraphics') {
                sprite = this.createRectGraphics(item);
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
        const sprite = new PIXI.Sprite(texture);

        // 将纹理的名字作为精灵的名字
        if (param.img) {
            sprite.name = param.img;
        }

        if (param && param.scale) {
            const sx = param.scale.x;
            const sy = param.scale.y;
            sprite.scale.set(sx, sy);
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
        const label = new PIXI.Text(param.value, {
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

    createContainer(param = {}) {
        const container = new PIXI.Container();
        container.name = param.name || '';
        container.height = +param.height || +param.initialHeight || 0;
        container.width = +param.width || +param.initialWidth || 0;
        container.x = +param.x || 0;
        container.y = +param.y || 0;
        container.angle = param.angle || 0;
        if (param && param.scale) {
            container.scale.set(param.scale.x || 1, param.scale.y || 1);
        }
        if (!param.pivot) {
            param.pivot = {x: 0, y: 0};
        }
        container.pivot = param.pivot;
        container.initialHeight = +param.initialHeight || 0;
        container.initialWidth = +param.initialWidth || 0;
        return container;
    }

    createRectGraphics(param) {
        const graphic = new PIXI.Graphics();
        graphic.name = param.name || '';
        graphic.angle = +param.angle || 0;
        graphic.x = +param.x || 0;
        graphic.y = +param.y || 0;
        // 生成色块
        graphic.beginFill('0x9400D3', 0.5);
        if (param.cornerRadius) {
            graphic.drawRoundedRect(
                +param.x,
                +param.y,
                +param.width,
                +param.height,
                +param.cornerRadius
            );
        }
        else {
            graphic.drawRect(+param.x, +param.y, +param.width, +param.height);
        }
        graphic.endFill();
        return graphic;
    }

}

RenderSystem.queries = {
    renderEntitys: {
        components: [RenderComponent],
        listen: {
            added: true,
            removed: true
        }
    }
};

export default RenderSystem;
