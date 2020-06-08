import * as Matter from "matter-js"

export default {
  install(Vue) {
    Vue.prototype.$Matter = Matter;
  }
};