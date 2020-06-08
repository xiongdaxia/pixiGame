/**
 * @file 容器-沉淀现象  —————————— TODO modify
 */

import {Graphics, Ticker} from 'pixi.js';

import {System} from 'ecsy';
import ReactionVesselComponent from '@/components/chemistry/reactionVesselComponent';
import StructureComponent from '@/components/chemistry/structureComponent';
import RenderComponent from '@/components/chemistry/renderComponent';
import ChemicalPropertyComponent from '@/components/chemistry/chemicalPropertyComponent';

import {CHEMICAL_STATE} from '@/settings/chemistry';

class VesselSedimentSystem extends System {

    init() {
        // console.log('显示容器内现象 init! ', window.Matter);
        // const {
        //     World,
        //     Bodies,
        //     Body,
        //     Engine
        // } = window.MATTER;
        // this.World = World;
        // this.Bodies = Bodies;
        // this.Body = Body;
        // this.Engine = Engine;
        // this.engineCurrent = this.Engine.create();

        // this.sceneObjects = [];
        // this.wallObjects = [];
    }

    execute() {
        // const {results} = this.queries.reactionVessel;
        // results.forEach(entity => {
        //     this.initSediment(entity);
        // });
    }

    /**
     * 判断是否有固体沉淀
     * @param {*} entity
     */
    initSediment(entity) {
        const renderData = entity.getMutableComponent(
            RenderComponent
        );
        const {sprite} = renderData;
        const {angle} = sprite;
        const container = sprite.getChildByName('container');

        const structure = entity.getMutableComponent(
            StructureComponent
        );
        const {contains} = structure;
        Object.values(contains).forEach(item => {
            const chemical = item.getMutableComponent(ChemicalPropertyComponent);
            const {chemicalState} = chemical;
            if (chemicalState === CHEMICAL_STATE.SOLID) {
                if (!container.sediment) {
                    this.makeSediment(angle, container);
                    container.sediment = true;
                }
                this.changeWallsAngle(angle, sprite, container);
            }

        });
    }

    makeSediment(angle, container) {
        this.createWallBox({
            width: container.initialWidth,
            height: container.initialHeight
        }, container);

        for (let i = 0; i < 5; i++) {
            this.createSedimentObject({
                x: 0 + i * 20,
                y: 10,
                radius: 5,
            }, container);
        }

        const ticker = Ticker.shared;
        ticker.add(() => {
            this.sceneObjects.forEach(object => {
                object.sprite.position.x = object.body.position.x;
                object.sprite.position.y = object.body.position.y;
            });
        });

        this.Engine.run(this.engineCurrent);
    }

    createWallBox(param, container) {
        const {width, height} = param;
        // eslint-disable-next-line no-unused-vars
        const leftWall = this.createWall({
            x: -50,
            y: 0,
            width: 50,
            height: +height,
        });
        // eslint-disable-next-line no-unused-vars
        const rightWall = this.createWall({
            x: +width,
            y: 0,
            width: 50,
            height: +height,
        });
        // eslint-disable-next-line no-unused-vars
        const bottomWall = this.createWall({
            x: 0,
            y: +height - 20,
            width: +width,
            height: 20,
        });
        // container.addChild(leftWall, rightWall, bottomWall);
    }

    // 创建矩形墙壁
    createWall(param) {
        // wall bodies
        const wall = this.Bodies.rectangle(
            param.x + param.width / 2,
            param.y + param.height / 2,
            +param.width,
            +param.height,
            {
                isStatic: true
            }
        );
        wall.initialPosX = param.x + param.width / 2;
        wall.initialPosY = param.y + param.height / 2;
        this.wallObjects.push(wall);
        this.World.addBody(this.engineCurrent.world, wall);

        // 色块
        const graphic = new Graphics();
        graphic.beginFill(param.color || '0x9400D3', 1);
        graphic.drawRect(+param.x, +param.y, +param.width, +param.height);
        graphic.endFill();
        return graphic;
    }

    createSedimentObject(param, container) {
        // 渲染沉淀
        const sedimentSprite = this.drawWhiteSediment(param);
        container.addChild(sedimentSprite);

        // 沉淀 Body
        const imageBody = this.Bodies.circle(
            +param.x,
            200,
            +param.radius,
            {restitution: 0.8}
        );
        this.World.addBody(this.engineCurrent.world, imageBody);

        this.sceneObjects.push({
            body: imageBody,
            sprite: sedimentSprite,
        });
    }

    // 渲染沉淀
    drawWhiteSediment(param) {
        const graphic = new Graphics();
        graphic.beginFill('0xFFFFFF', 1);
        graphic.drawCircle(+param.x, +param.y, +param.radius || 4);
        graphic.endFill();
        return graphic;
    }

    // 根据容器旋转角度 改变 墙bodies角度
    changeWallsAngle(angle, vessel, container) {
        const rotate = angle * Math.PI / 180;
        const centerX = vessel.anchor.x * container.initialWidth;
        const centerY = vessel.anchor.y * container.initialHeight;
        const {x: centerPosX, y: centerPosY} = {x: centerX, y: centerY};
        this.wallObjects.forEach(item => {
            const radius = Math.sqrt(Math.pow(Math.abs(item.position.x - centerPosX), 2)
                + Math.pow(Math.abs(item.position.y - centerPosY), 2));
            let newX = item.position.x;
            let newY = item.position.y;
            const originAngle = Math.atan2(item.initialPosY - centerPosY, item.initialPosX - centerPosX)
                * 180 / Math.PI;
            newX = radius * Math.cos((originAngle + angle) * Math.PI / 180);
            newY = radius * Math.sin((originAngle + angle) * Math.PI / 180);
            this.Body.setPosition(item, {x: newX + centerPosX, y: newY + centerPosY});
            this.Body.setAngle(item, rotate);
        });
    }

}

VesselSedimentSystem.queries = {
    reactionVessel: {
        components: [ReactionVesselComponent, StructureComponent],
        listen: {
            changed: [StructureComponent]
        }
    }
};

export default VesselSedimentSystem;
