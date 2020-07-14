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

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
