import Vue from 'vue';
import Vuex from 'vuex';
import chemistry from './chemistry';
import physical from './physical';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {chemistry, physical}
});
