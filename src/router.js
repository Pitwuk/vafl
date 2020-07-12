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
      path: "/about",
      name: "about",
      component: () => import("./views/About.vue"),
    },
    {
      path: "/cart",
      name: "cart",
      component: () => import("./views/Cart.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("./views/Login.vue"),
    },
  ],
});
