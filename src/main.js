import Vue from 'vue';
import plugins from './plugins';
import App from './App';
import router from './router';
import store from './store';


Vue.config.productionTip = false;

// 使用自定义插件
plugins.forEach(plugin => {
    Vue.use(plugin);
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
