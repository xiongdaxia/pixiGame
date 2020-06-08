// 线
import LineDataComponent from '@/components/physical/line';
import MovableComponent from '@/components/physical/movable';

function createLineEntity(world) {
    return world
        .createEntity()
        .addComponent(MovableComponent)
        .addComponent(LineDataComponent);
}
export default createLineEntity;
