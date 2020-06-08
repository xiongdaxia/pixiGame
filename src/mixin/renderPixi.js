/**
 * @file pixi渲染
 */


export default {
    data() {
        return {
            createNodeFunc: {
                sprite: this.createSprite,
                rectGraphics: this.createRectGraphics
            }
        };
    },
    methods: {
        initRenderTable({tableDom, tableWidth, tableHeight} = {}) {
            if (!tableDom) {
                tableDom = document.body;
            }
            if (!tableWidth) {
                tableDom = window.innerWidth;
            }
            if (!tableHeight) {
                tableDom = window.innerHeight;
            }

            const PIXI = this.$PIXI;
            const {context} = new PIXI.Renderer();
            const ratio = this.getPixelRatio(context);
            this.ratio = ratio;
            console.log('ratio--', ratio);

            const app = new PIXI.Application({
                resolution: ratio,
                autoDensity: true,
                antialias: true,
                backgroundColor: 0x333333,
                resizeTo: tableDom
            });
            this.app = app;
            this.$PIXI.app = app;
            window.PIXI.app = app;

            app.renderer.view.style.display = 'block';

            this.showChemistryDom.setAttribute('data-pixel-ratio', ratio);
            this.showChemistryDom.appendChild(app.view);

            const {stage} = app;
            this.stage = stage;
            stage.pivot = {x: -this.pixiWidth / 2, y: -this.pixiHeight / 2};

            const container = new PIXI.Container();
            container.scale.set(0.6, 0.6);
            app.stage.addChild(container);

            const loader = PIXI.Loader.shared;
            loader.add(this.atlasUrl).load(this.setup);
        },
        getPixelRatio(context) {
            const backingStore
        = context.backingStorePixelRatio
        || context.webkitBackingStorePixelRatio
        || context.mozBackingStorePixelRatio
        || context.msBackingStorePixelRatio
        || context.oBackingStorePixelRatio
        || context.backingStorePixelRatio
        || 1;
            return (window.devicePixelRatio || 1) / backingStore;
        },
        setup(loader, resources) {
            this.textureList = {};
            const atlasReg = /.json$/;
            this.atlasUrl.forEach(item => {
                if (atlasReg.test(item)) {
                    this.textureList = {
                        ...this.textureList,
                        ...resources[item].textures
                    };
                }
                else {
                    const imageArr = item.split('/');
                    const imageName = imageArr[imageArr.length - 1];
                    this.textureList[imageName] = resources[item].texture;
                }
            });
            this.loadPixiDone();
        },
        renderPositionData(postionJson, parent = null) {
            let node = null;
            postionJson.forEach(item => {
                node
          = this.createNodeFunc[item.type]
          && this.createNodeFunc[item.type](item);
                if (parent) {
                    parent.addChild(node);
                }
                if (item.children && item.children.length) {
                    this.renderPositionData(item.children, node);
                }
            });
            return node;
        },
        createSprite(param = {}) {
            let sprite = null;
            if (!param.spriteFrame || !param.id) {
                console.warn('创建精灵时 缺少 纹理 或 ID信息！');
                return;
            }
            const texture = this.textureList[param.spriteFrame];
            if (!texture) {
                console.error('生产精灵时缓存里没有相应的纹理');
            }
            sprite = new this.$PIXI.Sprite(texture);
            sprite.name = param.name || param.id;
            if (!param.anchor) {
                param.anchor = {
                    x: 0.5,
                    y: 0.5
                };
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
        },
        createRectGraphics(param) {
            const graphic = new this.$PIXI.Graphics();
            // graphic.angle = param.angle || 0;
            graphic.x = +param.x || 0;
            graphic.y = +param.y || 0;
            graphic.alpha = +param.opacity === 0 ? 0 : +param.opacity || 1;
            // 生成色块
            graphic.beginFill('0xF4F3F6', 1);
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
        },
        renderDataToStage(param, parent = null) {
            if (!parent) {
                parent = this.stage;
            }
            const node = this.renderPositionData([param]);
            parent.addChild(node);
            return node;
        }
    }
};
