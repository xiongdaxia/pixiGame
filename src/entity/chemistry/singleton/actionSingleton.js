/**
 * 动作管理单例
 */
import ActionComponent from '@/components/chemistry/actionComponent';

const createActionSingleton = function (world) {
    const chemistryWorld = world || window.CHEMISTRY.world;
    return chemistryWorld
        .createEntity('ActionSingleton')
        .addComponent(ActionComponent);
};

export default createActionSingleton;
