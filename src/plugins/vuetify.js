import Vue from "vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi",
  },
  theme: {
    themes: {
      light: {
        primary: "#4b543b",
        secondary: "#b57f50",
        tertiary: "#8ed081",
        quaternary: "#EDF0D4",
        accent: "#b4d2ba",
        
      },
    },
  },
});
