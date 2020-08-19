<template>
  <v-app-bar max-height="70" elevate-on-scroll dark color="primary">
    <v-img src="../assets/logo.png" contain max-height="50" @click="home()" id="bar" />
    <v-toolbar-items>
      <v-btn icon to="/cart">
        <v-icon>mdi-cart</v-icon>
      </v-btn>
      <v-btn icon to="/login">
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {
  methods: {
    home() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
#bar {
  cursor: pointer;
  margin-top: auto;
  margin-bottom: auto;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>