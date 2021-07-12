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
// Vue.prototype.$baseUrl = "https://www.vaflpcb.com";
Vue.prototype.$baseUrl = "http://127.0.0.1:8000";
Vue.prototype.$cart = [];
Vue.prototype.$cart_key = 1;
Vue.prototype.$firstName = [];
Vue.prototype.$lastName = "";
Vue.prototype.$email = "";
Vue.prototype.$address = "";
Vue.prototype.$city = "";
Vue.prototype.$state = "";
Vue.prototype.$country = "";
Vue.prototype.$zip = 0;
Vue.prototype.$login = [];
Vue.prototype.$shippingPrice = 0;
Vue.prototype.$shippingMethod = "";
Vue.prototype.$global = {"units":false};

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
