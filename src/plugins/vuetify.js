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
        primary: "#102B3F",
        secondary: "#6F1D1B",
        tertiary: "#7293A0",
        quaternary: "#FFFCF2",
        accent: "#7293A0",
      },
    },
  },
});
