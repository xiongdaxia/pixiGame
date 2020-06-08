import circuitComponent from '../components/physical/circuitData';

export default {
    state: {
        editBoxPosition: {
            x: 0,
            y: 0
        },
        importBoxVisible: false,
        editPageVisible: false,
        editBoxVisible: false,
        editEntity: null,
        circuitEntity: null,
        idSortArr: [],
        rigidBodyArr: [],
        adjList: []
    },
    mutations: {
        addRigidBodyArr(state, value) {
            state.rigidBodyArr.push(value);
        },
        deleteRigidBodyArr(state, value) {
            state.rigidBodyArr = state.rigidBodyArr.filter(item => {
                item.body = value.body;
            });
        },
        updateEditBoxPosition(state, value) {
            state.editBoxPosition.x = value.x || 0;
            state.editBoxPosition.y = value.y || 0;
        },
        updateEditBoxVisible(state, value) {
            state.editBoxVisible = !!value;
        },
        updateEditPageVisible(state, value) {
            state.editPageVisible = !!value;
        },
        updateEditEntity(state, value) {
            state.editEntity = value;
        },
        updateCircuitEntity(state, value) {
            state.circuitEntity = value;
        },
        updateImportBoxVisible(state, value) {
            state.importBoxVisible = value;
        },
        updateIdSortArr(state, value) {
            state.idSortArr.push(value);
        },
        // 开始电路计算
        runCircuitCompute(state) {
            if (state.circuitEntity) {
                const circuitData = state.circuitEntity.getMutableComponent(circuitComponent);
                circuitData.isChange = true;
            }

        },
        updateAdjList(state, value) {
            state.adjList = value;
        },
    },
    actions: {},
    modules: {}
};
