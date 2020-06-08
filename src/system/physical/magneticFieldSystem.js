//  磁场系统
import {System} from 'ecsy';
import {Events, Composite, Vector} from 'matter-js';

import MagneticFieldComponent from '@/components/physical/magneticField';

class MagneticFieldSystem extends System {

    init() {
        console.log('磁场系统开始执行了');
    }

    execute() {
        this.addMagneticFieldForce();
        this.deleteMagneticFieldForce();
    }

    /**
     * @description 往物理引擎力添加磁场力
     * @return {void}@memberof MagneticFieldSystem
     */
    addMagneticFieldForce() {
        const {added} = this.queries.magneticFieldEntity;
        added.forEach(entity => {


            Events.on(window.MATTER.engine, 'beforeUpdate', this.bodiesApplyMagneticField.bind(this, entity));

        });
    }

    /**
     * @description 删除物理引擎力添加的磁场力
     * @return {void}@memberof MagneticFieldSystem
     */
    deleteMagneticFieldForce() {
        const {removed} = this.queries.magneticFieldEntity;
        removed.forEach(entity => {
            Events.off(window.MATTER.engine, 'beforeUpdate', this.bodiesApplyMagneticField.bind(this, entity));
        });
    }

    /**
     * @description 添加带电粒子在磁场中的运动受力
     * @param  {any} bodies
     * @param  {any} B
     * @return
     * @memberof MagneticFieldSystem
     */
    bodiesApplyMagneticField(entity) {
        const bodies =  Composite.allBodies(window.MATTER.engine.world);
        const data = entity.getComponent(MagneticFieldComponent);
        if (!data) {
            return false;
        }
        const {B} = data;
        const scale = B.scale || 0;

        if (B.z === 0 || scale === 0) {
            return false;
        }
        bodies.forEach(item => {
            if (item.isStatic || item.isSleeping) {
                return false;
            }
            if (!item.q) {
                return false;
            }

            const isContains = this.contains(B.rounds, item.position);
            if (!isContains) {
                return;
            }
            item.force.y = 0;
            item.force.x = 0;
            item.force.y += item.q * B.z * scale * item.velocity.x;
            item.force.x += -item.q * B.z * scale * item.velocity.y;
        });
    }

    /**
     * @description 判断点是否在圆里
     * @param  {any} rounds
     * @param  {any} pos
     * @return
     * @memberof MagneticFieldSystem
     */
    contains(rounds, pos) {
        return Vector.magnitude(Vector.sub(rounds, pos)) <= rounds.r;
    }
}

MagneticFieldSystem.queries = {
    magneticFieldEntity: {
        components: [MagneticFieldComponent],
        listen: {
            added: true,
            removed: true
        }
    }
};

export default MagneticFieldSystem;
