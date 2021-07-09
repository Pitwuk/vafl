<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script>
//test
export default {
  name: "App",
};
</script>
<style >
body {
  height: 100%;
  margin: 0;
}
.quaternary {
  width: 100%;
  background-image: url("./assets/clean-textile.png");
  background-repeat: repeat;
  background-size: 100;
}
.accent {
  width: 100%;
  background-image: url("./assets/binding-dark.png");
  background-repeat: repeat;
  background-size: 50;
}
.tertiary {
  width: 100%;
  background-image: url("./assets/binding-dark.png");
  background-repeat: repeat;
  background-size: 50;
}
</style>
