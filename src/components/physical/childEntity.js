import {createComponentClass} from 'ecsy';

const ChildEntityComponent = createComponentClass(
    {
    // 包含父节点
        parent: {default: null}
    },
    'ChildEntityComponent'
);
export default ChildEntityComponent;
