import * as PIXI from 'pixi.js';
import store from '@/store';
import {env} from '@/environment';


const {Renderer, Loader, Application, Container, Ticker} = PIXI;

class Pixi {
    // eslint-disable-next-line no-empty-function
    constructor(options = {}, callback = () => {}) {
        const defaults = {
            // 渲染需要的图集数组
            atlasUrl: [],
            // 自适应的dom
            resizeTo: document.getElementById('app'),
            // 将pixi添加进哪个dom
            dom: document.body,
            // 是否添加容器移动
            containerMove: true,
            // 是否添加容器缩放
            containerScale: true,
            // 是否添加编辑框事件
            addEditEvent: false,
        };

        this.options = Object.assign(defaults, options);
        // 加载完图集资源后的回调
        this.callback = callback;
        //  分辨率
        this.ratio = this.getPixelRatio();
        // 应用
        this.app = null;
        // 容器
        this.container = null;
        // pixi渲染的ticker
        this.ticker = null;

        this.init();
    }

    init() {
        this.creatPixiApp();
        this.addContainerEvent();
        this.addWheelEvent();
        this.addEditEvent();
    }

    /**
     * @description 创建pixi应用
     * @return {void}@memberof Pixi
     */
    creatPixiApp() {
        const {resizeTo, dom, atlasUrl} = this.options;
        const app = new Application({
            resolution: this.ratio,
            autoDensity: true,
            antialias: true,
            backgroundColor: 0x435764,
            resizeTo
        });
        this.app = app;
        this.ticker = Ticker.shared;

        app.renderer.view.style.display = 'block';
        //  设置ratio 将Mouse的位置和物理引擎的位置对齐
        dom.setAttribute('data-pixel-ratio', this.ratio);

        dom.appendChild(app.view);

        // 用pivot去代替锚点，使0,0位于正中间
        const {stage} = app;
        stage.pivot = {x: -dom.offsetWidth / 2, y: -dom.offsetHeight / 2};

        // 新建一个container所有元器件，全局移动只需要移动该容器
        const container = new Container();
        this.container = container;
        container.scale.set(0.6, 0.6);
        app.stage.addChild(container);


        const loader = Loader.shared;
        const cache =  PIXI.utils.TextureCache;

        const atlasReg = /.json$/;

        // 过滤调已经加载的图片
        const resource = atlasUrl.filter(item => {
            const atlasRegPng = env.publicPath + item.replace(atlasReg, '.png');
            const texture = cache[atlasRegPng];
            return !texture;
        });
        loader.add(resource).load(this.callback);
    }

    /**
     * @description 获得设备像素比
     * @return [Number]
     * @memberof Pixi
     */
    getPixelRatio() {
        const {context} = new Renderer();
        const backingStore
          = context.backingStorePixelRatio
              || context.webkitBackingStorePixelRatio
              || context.mozBackingStorePixelRatio
              || context.msBackingStorePixelRatio
              || context.oBackingStorePixelRatio
              || context.backingStorePixelRatio
              || 1;
        return (window.devicePixelRatio || 1) / backingStore;
    }

    /**
     * @description 滚轮事件，改变整体容器的大小
     * @param  {any}
     * @return
     * @memberof Pixi
     */
    wheelEvent(event) {
        const {container} = this;
        let scale = container.scale.x;

        if (scale < 0.35 && event.deltaY > 0.35) {
            return false;
        }
        if (scale > 3 && event.deltaY < 0) {
            return false;
        }
        scale = scale - event.deltaY / 1000;

        container.scale.set(scale, scale);
    }

    /**
     * @description 添加滚轮事件
     * @return  null
     * @memberof Pixi
     */
    addWheelEvent() {
        if (!this.options.containerScale) {
            return true;
        }
        const {dom} = this.options;
        dom.addEventListener(
            'mousewheel',
            this.wheelEvent.bind(this),
            false
        );
    }

    /**
     * @description 移除滚轮事件
     * @return {void}@memberof Pixi
     */
    removeWheelEvent() {
        const {dom} = this.options;
        dom.removeEventListener(
            'mousewheel',
            this.wheelEvent.bind(this),
            false
        );
    }

    /**
     * @description 添加整体的容器移动事件
     * @return  null
     * @memberof Pixi
     */
    addContainerEvent() {
        if (this.app.stage.interactive || !this.options.containerMove) {
            return true;
        }
        this.app.stage.hitArea = new PIXI.Rectangle(
            -window.innerWidth / 2,
            -window.innerHeight / 2,
            window.innerWidth,
            window.innerHeight
        );
        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', this.touchStart.bind(this));
        this.app.stage.on('pointermove', this.touchMove.bind(this));
        this.app.stage.on('pointerup', this.touchEnd.bind(this));
        this.app.stage.on('pointerupoutside', this.touchEnd.bind(this));
    }

    /**
     * @description 移除整体的容器移动事件
     * @return  null
     * @memberof Pixi
     */
    removeContainerEvent() {
        if (!this.app.stage.interactive) {
            return true;
        }
        this.app.stage.interactive = false;
        this.app.stage.off('pointerdown', this.touchStart.bind(this));
        this.app.stage.off('pointermove', this.touchMove.bind(this));
        this.app.stage.off('pointerup', this.touchEnd.bind(this));
        this.app.stage.off('pointerupoutside', this.touchEnd.bind(this));
    }

    /**
     * @description 开始触摸舞台
     * @param  {any}
     * @return  null
     * @memberof Pixi
     */
    touchStart(e) {
        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        if (target === this.app.stage) {
            this.isMoving = true;
            const moveContainer = target.children[0];
            store.commit('updateEditPageVisible', false);
            store.commit('updateEditBoxVisible', false);

            moveContainer.originPos = {x: moveContainer.x, y: moveContainer.y};
            this.originPos = target.toLocal(e.data.global);
        }
    }

    /**
     * @description 在舞台上移动
     * @param  {any}
     * @return  null
     * @memberof Pixi
     */
    touchMove(e) {
        const target = e.currentTarget;
        if (!target) {
            return false;
        }
        if (this.isMoving && target === this.app.stage) {
            const endPos = target.toLocal(e.data.global);
            const moveContainer = target.children[0];
            moveContainer.x = moveContainer.originPos.x +  (endPos.x - this.originPos.x);
            moveContainer.y = moveContainer.originPos.y + (endPos.y - this.originPos.y);
        }
    }

    /**
     * @description 在舞台上移走
     * @param  {any}
     * @return  null
     * @memberof Pixi
     */
    touchEnd(e) {
        this.touchMove(e);
        this.isMoving = false;
    }

    /**
     * @description  点击舞台，编辑框消失
     * @return {void}@memberof Pixi
     */
    addEditEvent() {
        if (!this.options.addEditEvent) {
            return true;
        }
        this.app.stage.hitArea = new PIXI.Rectangle(
            -window.innerWidth / 2,
            -window.innerHeight / 2,
            window.innerWidth,
            window.innerHeight
        );
        this.app.stage.interactive = true;
        this.app.stage.on('pointerdown', this.touchStart.bind(this));
    }

    /**
     * @description 重置pixi，清除事件监听，将所有精灵删除
     * @param  {boolean} [removeEvent=false]
     * @return {void}@memberof Pixi
     */
    reset(removeEvent = false) {
        if (removeEvent) {
            this.removeContainerEvent();
            this.removeWheelEvent();
        }
        this.container.children = [];
    }
}

export default Pixi;
