import Vue from "vue";

const Event = new Vue();
Object.defineProperties(Vue.prototype, {
  $bus: {
    get() {
      return Event;
    }
  }
});
const EventBus = Event.$bus;

export default EventBus;