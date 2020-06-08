import {World} from 'ecsy';
import {Ticker} from 'pixi.js';

class ECS {
    constructor(options = {}) {
        // 参数
        this.options = options;

        // ECS的世界
        this.world = null;
        // ECS循环的tick
        this.ticker = null;
        this.init();
    }

    /**
     * @description 按照参数初始化ECS
     * @return {void}@memberof ECS
     */
    init() {
        this.creatWorld();
        this.runExecute();
        this.start();
    }

    /**
     * @description 创建world
     * @return {void}@memberof ECS
     */
    creatWorld() {
        const world = new World();
        this.world = world;
    }

    /**
     * @description 运行ECS世界中的系统
     * @return {void}@memberof ECS
     */
    runExecute() {
        const ticker = new Ticker();
        this.ticker = ticker;

        ticker.add(delta => {
            this.world.execute(delta, delta);
        });
    }

    /**
     * @description 开始ECS的循环
     * @return {void}@memberof ECS
     */
    start() {
        this.ticker.start();
    }

    /**
     * @description 停止ECS的循环
     * @return {void}@memberof ECS
     */
    stop() {
        this.ticker.stop();
    }


    /**
     * @description 将ECS重置到最初的样子
     * @return {void}@memberof ECS
     */
    reset() {
        if (!this.world) {
            return false;
        }
        this.world.stop();
        const {entityManager} = this.world;
        // eslint-disable-next-line no-underscore-dangle
        entityManager._entities = [];
        this.world.play();
    }
}

export default ECS;

