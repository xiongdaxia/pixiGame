import Vue from "vue";
import VueRouter from "vue-router";
// 首页
import Home from "@/views/Home.vue";
// 物理
import Electric from "@/views/physical/electric.vue";
import Motion from "@/views/physical/motion.vue";
import Field from "@/views/physical/field.vue";
// 化学
import Chemistry from "@/views/chemistry/index.vue";


// 物理

// 化学

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/physical/electric",
    name: "Electric",
    component: Electric
  },
  {
    path: "/physical/motion",
    name: "Motion",
    component: Motion
  },
  {
    path: "/physical/field",
    name: "Field",
    component: Field
  },
  {
    path: "/chemistry",
    name: "Chemistry",
    component: Chemistry
  }
];

const router = new VueRouter({
  routes
});

export default router;
