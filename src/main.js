import Vue from "vue";
import VueLocalStorage from "vue-ls";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import cookie from "cookie";

require("dotenv").config();

Vue.config.productionTip = false;

Vue.use(VueLocalStorage);
Vue.use(cookie);

//global vars
Vue.prototype.$baseUrl = "https://www.vaflpcb.com";
Vue.prototype.$cart = [];
Vue.prototype.$cart_key = 1;
Vue.prototype.$firstName = "";
Vue.prototype.$lastName = "";
Vue.prototype.$email = "";
Vue.prototype.$address = "";
Vue.prototype.$city = "";
Vue.prototype.$state = "";
Vue.prototype.$zip = 0;
Vue.prototype.$shippingPrice = 0;
Vue.prototype.$shippingMethod = "";

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

// Vue.http.interceptors.push((request, next) => {
//   request.headers.set(
//     "X-XSRF-TOKEN",
//     cookie.parse(document.cookie)["XSRF-TOKEN"]
//   );
//   Vue.prototype.$csrftoken = cookie.parse(document.cookie)["XSRF-TOKEN"];
//   next();
// });
