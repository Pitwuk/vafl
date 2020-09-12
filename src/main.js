import Vue from "vue";
import VueLocalStorage from "vue-ls";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import axios from "axios";

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

require("dotenv").config();

Vue.config.productionTip = false;

Vue.use(VueLocalStorage);

//global vars
Vue.prototype.$cart = []
Vue.prototype.$cart_key = 1
Vue.prototype.$firstName = "";
Vue.prototype.$lastName = "";
Vue.prototype.$email = "";
Vue.prototype.$address = "";
Vue.prototype.$city = "";
Vue.prototype.$state = "";
Vue.prototype.$zip = 0;
Vue.prototype.$shippingPrice = 0;

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
