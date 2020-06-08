import * as PIXI from "pixi.js";
// import * as PIXI2 from 'pixi.js-legacy';

export default {
  install(Vue) {
    PIXI.utils.skipHello();
    Vue.prototype.$PIXI = PIXI;
  }
};
