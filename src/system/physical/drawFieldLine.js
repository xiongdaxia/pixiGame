// 画电场线、磁场线
import {System} from 'ecsy';
import {Graphics} from 'pixi.js';


import ElecFieldComponent from '@/components/physical/elecField';
import ElecFieldLine from '@/components/physical/elecFieldLine';

import MagneticFieldComponent from '@/components/physical/magneticField';
import MagneticFieldLine from '@/components/physical/magneticFieldLine';

import RenderDataComponent from '@/components/physical/renderData.js';

const WIDTH = 40;


class DrawFieldLineSystem extends System {

    init() {
        console.log('画电场线、磁场线的系统开始执行了');
    }

    execute() {
        this.drawElecFieldLine();
        this.drawMagneticFieldLine();
    }

    /**
     * @description 画电场线
     * @return {void}@memberof DrawFieldLineSystem
     */
    drawElecFieldLine() {
        const {added, changed} = this.queries.elecFieldEntity;
        //  第一次添加
        added.forEach(entity => {
            const {sprite} = entity.getComponent(RenderDataComponent);
            const {E} = entity.getComponent(ElecFieldComponent);
            sprite.children = [];
            this.drawElecLine(sprite, E);
        });
        // 改变值时
        changed.forEach(entity => {
            const data = entity.getComponent(RenderDataComponent);
            if (!data) {
                return false;
            }
            const {sprite} = data;

            const {E} = entity.getComponent(ElecFieldComponent);
            sprite.children = [];
            this.drawElecLine(sprite, E);
        });
    }

    /**
     * @description 画磁场线
     * @return {void}@memberof DrawFieldLineSystem
     */
    drawMagneticFieldLine() {
        const {added, changed} = this.queries.magneticFieldEntity;
        //  第一次添加
        added.forEach(entity => {
            const {sprite} = entity.getComponent(RenderDataComponent);
            const {B} = entity.getComponent(MagneticFieldComponent);
            sprite.children = [];
            this.drawMagneticLine(sprite, B);
        });
        // 改变值时
        changed.forEach(entity => {
            const data = entity.getComponent(RenderDataComponent);
            if (!data) {
                return false;
            }
            const {sprite} = data;
            const {B} = entity.getComponent(MagneticFieldComponent);
            sprite.children = [];
            this.drawMagneticLine(sprite, B);
        });
    }

    drawElecLine(sprite, obj2) {
        const {x, y} = obj2;
        const {width, height} = sprite;

        const n = Math.floor(width / WIDTH);

        const graphics = new Graphics();
        graphics.pivot = {x: 0, y: 0};
        graphics.x = width / 2;
        graphics.y = height / 2;

        graphics.lineStyle(2, 0xffff00, 1);

        for (let i = 0; i < n + 1; i++) {
            graphics.moveTo(-width / 2 + WIDTH * i, -height / 2);
            graphics.lineTo(-width / 2 + WIDTH * i, height / 2);
            graphics.lineTo(-width / 2 + WIDTH * i - 10, height / 2 - 10);
            graphics.moveTo(-width / 2 + WIDTH * i, height / 2);
            graphics.lineTo(-width / 2 + WIDTH * i + 10, height / 2 - 10);
        }
        graphics.angle = -Math.atan2(x, y) * 180 / Math.PI;
        if (x === 0 && y < 0) {
            graphics.angle = 180;
        }

        sprite.addChild(graphics);
    }

    drawMagneticLine(sprite, B) {
        const cloneSprite = sprite.clone();
        const {z} = B;
        const {width, height} = sprite;

        const n = Math.floor(width / WIDTH);

        const graphics = new Graphics();
        graphics.pivot = {x: 0, y: 0};
        graphics.x = width / 2;
        graphics.y = height / 2;

        graphics.lineStyle(2, 0xff00ff, 1);
        const d = 16;

        for (let i = 0; i < n + 1; i++) {
            for (let j = 0; j < n + 1; j++) {
                if (z < 0) {
                    graphics.moveTo(-width + WIDTH * i, -height + WIDTH
                  * j);
                    graphics.lineTo(-width + WIDTH * i + d, -height + WIDTH
                  * j + d);

                    graphics.moveTo(-width + WIDTH * i, -height + WIDTH
                  * j + d);
                    graphics.lineTo(-width + WIDTH * i + d, -height + WIDTH
                  * j);
                }
                else {
                    graphics.drawCircle(-width + WIDTH * i, -height + WIDTH
                    * j, 2);
                }


            }
        }

        sprite.addChild(graphics);
        sprite.addChild(cloneSprite);
        sprite.mask = cloneSprite;
    }
}

DrawFieldLineSystem.queries = {
    // 电场实体
    elecFieldEntity: {
        components: [ElecFieldLine, ElecFieldComponent, RenderDataComponent],
        listen: {
            added: true,
            changed: [ElecFieldComponent]
        }
    },
    // 磁场实体
    magneticFieldEntity: {
        components: [MagneticFieldLine, MagneticFieldComponent, RenderDataComponent],
        listen: {
            added: true,
            changed: [MagneticFieldComponent]

        }
    }

};

export default DrawFieldLineSystem;
