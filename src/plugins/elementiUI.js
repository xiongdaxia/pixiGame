import { Notification, Icon } from "element-ui";
export default {
    install(Vue) {
        // Vue.use(Button)
        // Vue.use(Form)
        // Vue.use(FormItem)
        // Vue.use(Input)
        Vue.component(Icon)
        Vue.component(Notification)
        Vue.prototype.$notify = Notification;
    }
};