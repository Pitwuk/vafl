<template>
  <div id="app">
    <Homepage />
  </div>
</template>

<script>
import Homepage from "./components/Homepage.vue";

export default {
  name: "app",
  components: {
    Homepage
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background-color: #d1c1b4;
}
</style>
