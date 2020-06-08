//  物理引擎渲染系统，采用matter.js

import {System} from 'ecsy';
import {World, Bodies, Body} from 'matter-js';

import store from '@/store';
import renderDataComponent from '@/components/physical/renderData.js';
import matterDataComponent from '@/components/physical/matter.js';

class MatterSystem extends System {
    init() {
        console.log('物理引擎系统开始执行了～');
    }

    execute() {
        this.addRigidBody();
        this.changeRigidBody();
        this.removeRigidBody();
    }

    /**
     * @description 为绑定刚体的精灵添加刚体
     * @return {void}@memberof MatterSystem
     */
    addRigidBody() {
        const {added} = this.queries.rigidBodyEntitys;
        added.forEach(entity => {
            if (entity.hasComponent(renderDataComponent)) {
                const {sprite} = entity.getComponent(renderDataComponent);
                const bodyData = entity.getMutableComponent(matterDataComponent);

                const {x, y, width, height, angle} = this.transformPos(sprite);

                const {engine} = window.MATTER;

                const imageBody = Bodies.rectangle(x, y, width, height, {
                    restitution: 0.8,
                    angle: angle * Math.PI / 180,
                    ...bodyData.params
                });

                bodyData.rigidBody = imageBody;

                World.addBody(engine.world, imageBody);

                if (bodyData.params.velocity) {
                    Body.setVelocity(imageBody, bodyData.params.velocity);
                }

                // Body.applyForce(imageBody, imageBody.position, {x: 0.01, y: 0.01});

                // 用store存 精灵和刚体（对应关系）
                store.commit('addRigidBodyArr', {
                    body: imageBody,
                    sprite
                });
            }
        });
    }

    /**
     * @description 改变刚体数据的时候，同步刚体数据
     * @return {void}@memberof MatterSystem
     */
    changeRigidBody() {
        const {changed} = this.queries.rigidBodyEntitys;
        changed.forEach(entity => {

            const bodyData = entity.getMutableComponent(matterDataComponent);

            if (bodyData && bodyData.params.velocity) {
                Body.setVelocity(bodyData.rigidBody, bodyData.params.velocity);
            }
        });
    }

    /**
     * @description 删除刚体组建的时候，把刚体信息也删除
     * @return {void}@memberof MatterSystem
     */
    removeRigidBody() {
        const {removed} = this.queries.rigidBodyEntitys;
        removed.forEach(entity => {

            const bodyData = entity.getRemovedComponent(matterDataComponent);
            const {sprite} = entity.getRemovedComponent(renderDataComponent);

            const {engine} = window.MATTER;
            World.addBody(engine.world, bodyData.rigidBody);

            store.commit('deleteRigidBodyArr', {
                body: bodyData.rigidBody,
                sprite
            });
        });
    }

    /**
     * @description 将pixi的坐标和物理引擎对齐
     * @param  {any} sprite
     * @return
     * @memberof MatterSystem
     */
    transformPos(sprite) {
        const scale = 0.6;

        const {width, height, angle, x, y} = sprite;
        const anchor = sprite.anchor || {x: 0.5, y: 0.5};


        const dx =  (anchor.x - 0.5) * width * Math.cos(angle * Math.PI / 180) * scale;
        const dx2 =  (anchor.y - 0.5) * height * Math.sin(angle * Math.PI / 180) * scale;

        const dy = (anchor.x - 0.5) * width * Math.sin(angle * Math.PI / 180) * scale;
        const dy2 = (anchor.y - 0.5) * height * Math.cos(angle * Math.PI / 180) * scale;
        return {
            x: window.innerWidth  / 2 + x * scale - dx + dx2,
            y: window.innerHeight  / 2 + y * scale - dy - dy2,
            width: width * scale,
            height: height * scale,
            angle
        };
    }
}
MatterSystem.queries = {
    // 刚体实体
    rigidBodyEntitys: {
        components: [matterDataComponent],
        listen: {
            added: true,
            removed: true,
            changed: [matterDataComponent]
        }
    },
};

export default MatterSystem;

