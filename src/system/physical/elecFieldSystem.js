//  电场系统
import {System} from 'ecsy';
import {Events, Composite, Bounds} from 'matter-js';

import ElecFieldComponent from '@/components/physical/elecField';

class elecFieldSystem extends System {

    init() {
        console.log('电场系统开始执行了');
    }

    execute() {
        this.addElecFieldForce();
        this.deleteElecFieldForce();
    }

    /**
     * @description 往物理引擎力添加电场力
     * @return {void}@memberof elecFieldSystem
     */
    addElecFieldForce() {
        const {added} = this.queries.elecFieldEntity;
        added.forEach(entity => {


            Events.on(window.MATTER.engine, 'beforeUpdate', this.bodiesApplyElecField.bind(this, entity));

        });
    }

    /**
     * @description  删除物理引擎中的电场力
     * @return {void}@memberof elecFieldSystem
     */
    deleteElecFieldForce() {
        const {removed} = this.queries.elecFieldEntity;
        removed.forEach(entity => {
            Events.off(window.MATTER.engine, 'beforeUpdate', this.bodiesApplyElecField.bind(this, entity));
        });
    }

    /**
     * @description 添加带电刚体受到的电场力
     * @param  {any} entity
     * @return
     * @memberof elecFieldSystem
     */
    bodiesApplyElecField(entity) {
        const data = entity.getComponent(ElecFieldComponent);
        if (!data) {
            return false;
        }
        const {E} = data;
        const bodies =  Composite.allBodies(window.MATTER.engine.world);
        const scale = E.scale || 0;

        if ((E.x === 0 && E.y === 0) || scale === 0) {
            return false;
        }
        bodies.forEach(item => {
            if (item.isStatic || item.isSleeping) {
                return false;
            }
            if (!item.q) {
                return false;
            }

            const isContains = Bounds.contains(E.bounds, item.position);

            if (!isContains) {
                return;
            }

            item.force.y += item.q * E.y * scale;
            item.force.x += item.q * E.x * scale;
        });
    }
}

elecFieldSystem.queries = {
    elecFieldEntity: {
        components: [ElecFieldComponent],
        listen: {
            added: true,
            removed: true
        }
    }
};

export default elecFieldSystem;
