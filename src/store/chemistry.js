export default {
    state: {
        editEntity: null,
        containerInfo: []
    },
    mutations: {
        updateEditEntity(state, value) {
            state.editEntity = value;
        },
        // 化学显示信息
        updateShowData(state, value) {
            state.containerInfo = value;
        }
    },
    actions: {},
    modules: {}
};
