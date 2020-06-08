// 电路管理单例实体

//  电池
import circuitComponent from '@/components/physical/circuitData';

function createCircuitEntity(world) {
    return world.createEntity().addComponent(circuitComponent);
}
export default createCircuitEntity;
