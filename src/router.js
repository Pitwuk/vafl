import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
    },
    {
      path: "/order",
      name: "order",
      component: () => import("./views/Order.vue"),
    },
    {
      path: "/purchase",
      name: "purchase",
      component: () => import("./views/Purchase.vue"),
    },
    {
      path: "/success",
      name: "success",
      component: () => import("./views/Success.vue"),
    },
    {
      path: "/status",
      name: "status",
      component: () => import("./views/Status.vue"),
    },
    {
      path: "/about",
      name: "about",
      component: () => import("./views/About.vue"),
    },
    {
      path: "/capabilities",
      name: "capabilities",
      component: () => import("./views/Capabilities.vue"),
    },
    {
      path: "/design-rules",
      name: "design-rules",
      component: () => import("./views/Design.vue"),
    },
    {
      path: "/support",
      name: "support",
      component: () => import("./views/Support.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
    {
      path: "/store",
      name: "store",
      component: () => import("./views/Store.vue"),
    },
  ],
});
