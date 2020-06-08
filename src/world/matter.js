
import {World, Engine, Common, Render, Bodies, Runner, Mouse, MouseConstraint} from 'matter-js';
import {Ticker} from 'pixi.js';
import store from '@/store';

class Matter {
    constructor(options = {}) {
        const defaults = {
            //  是否开启重力
            hasGravity: true,
            // 是否开启debugger工具
            debug: true,
            // 往哪个容器下添加debugerr canvas
            dom: document.body,
            // 物理引擎生效的宽度
            width: window.innerWidth,
            // 物理引擎生效的高度
            height: window.innerHeight,
            // 引擎是否自动开始
            autoStart: false,
            // 是否添加鼠标控制
            mouseControl: false,
            // 是否添加墙边界
            wall: true
        };

        this.options = Common.extend(defaults, options);
        // 该物理引擎
        this.engine = null;
        // debugger的canvas DOM
        this.debuggerCanvas = null;
        // 物理引擎的循环
        this.runner = null;
        //  同步数据的循环
        this.ticker = null;

        this.init();
    }

    /**
     * @description 初始化物理引擎，按参数添加需要的部分
     * @return {void}@memberof Matter
     */
    init() {
        // 同步物理引擎数据到PIXI
        this.syncData();
        //  新建引擎
        this.creatEngine();
        //  添加边界
        this.addWalls();
        //  dubugger边界
        this.openDebug();
        //  添加鼠标控制
        this.addMouseControl();
    }

    /**
     * @description 创建物理引擎的循环
     * @return {void}@memberof Matter
     */
    creatEngine() {
        this.engine = Engine.create();
        this.runner = Runner.create();

        const {hasGravity, autoStart} = this.options;

        if (!hasGravity) {
            this.engine.world.gravity.y = 0;
        }

        if (autoStart) {
            this.start();
        }

    }

    /**
     * @description 开始引擎运动和数据同步
     * @return {void}@memberof Matter
     */
    start() {
        Runner.run(this.runner, this.engine);
        this.ticker.start();
    }

    /**
     * @description 停止引擎运动和数据同步
     * @return {void}@memberof Matter
     */
    stop() {
        Runner.stop(this.runner);
        this.ticker.stop();
    }

    /**
     * @description 为物理引擎的世界添加边界
     * @return
     * @memberof Matter
     */
    addWalls() {
        if (!this.options.wall) {
            return true;
        }
        const {width, height} =  this.options;
        // add walls
        World.add(this.engine.world, [
            // top
            Bodies.rectangle(width / 2, 0, width, 10, {isStatic: true}),
            // bottom
            Bodies.rectangle(width / 2, height, width, 10, {isStatic: true}),
            // right
            Bodies.rectangle(width, height / 2, 10, height, {isStatic: true}),
            // left
            Bodies.rectangle(0, height / 2, 10, height, {isStatic: true})
        ]);
    }

    /**
     * @description 打开debugger模式⚠️可能挡住pixi事件
     * @return
     * @memberof Matter
     */
    openDebug() {
        if (!this.options.debug) {
            return true;
        }
        // debugger需要
        const {engine} = this;
        const {width, height} = this.options;

        const render = Render.create({
            element: this.options.dom,
            engine,
            options: {
                width,
                height,
                showVelocity: true,
                wireframeBackground: 'rgba(255,255,255,0)'
            }
        });
        this.debuggerCanvas = render.canvas;

        render.canvas.style.position = 'absolute';
        render.canvas.style.top = 0;

        Render.lookAt(render, {
            min: {x: 0, y: 0},
            max: {x: width, y: height}
        });

        Render.run(render);
    }

    /**
     * @description 添加物理引擎的鼠标控制
     * @return
     * @memberof Matter
     */
    addMouseControl() {
        if (!this.options.mouseControl) {
            return true;
        }

        // 添加鼠标控制
        const mouse = Mouse.create(this.debuggerCanvas);
        const mouseConstraint = MouseConstraint.create(this.engine, {
            mouse
        });

        World.add(this.engine.world, mouseConstraint);

    }

    /**
     * @description 物理引擎和PIXI数据同步
     * @return {void}@memberof Matter
     */
    syncData() {
        const ticker = new Ticker();
        this.ticker = ticker;

        ticker.add(delta => {
            store.state.physical.rigidBodyArr.forEach(item => {
                const pos = item.sprite.parent.toLocal(item.body.position);
                item.sprite.position = this.transformPos(item.sprite, pos);
                item.sprite.rotation = item.body.angle;
            });
        });

    }

    /**
     * @description pixi和物理引擎坐标转化
     * @param  {any} sprite
     * @param  {any} pos
     * @return
     * @memberof Matter
     */
    transformPos(sprite, pos) {
        const p = {x: 0, y: 0};

        const {width, height, angle} = sprite;
        const anchor = sprite.anchor || {x: 0.5, y: 0.5};

        const dx =  (anchor.x - 0.5) * width * Math.cos(angle * Math.PI / 180);
        const dx2 =  (anchor.y - 0.5) * height * Math.sin(angle * Math.PI / 180);

        const dy = (anchor.x - 0.5) * width * Math.sin(angle * Math.PI / 180);
        const dy2 = (anchor.y - 0.5) * height * Math.cos(angle * Math.PI / 180);
        p.x = pos.x + dx - dx2;
        p.y = pos.y + dy + dy2;
        return p;
    }

    /**
     * @description 重置整个物理引擎，回到最初的样子
     * @return {void}@memberof Matter
     */
    reset() {
        Engine.clear(this.engine);
    }


}
export default Matter;
