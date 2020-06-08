import * as ECS from "ecsy"

export default {
  install(Vue) {
    Vue.prototype.$ECS = ECS;
  }
};
