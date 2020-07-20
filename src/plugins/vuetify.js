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
        primary: "#281e10",
        secondary: "#dac1a8",
        tertiary: "#faebd7",
        accent: colors.deepOrange,
      },
    },
  },
});
