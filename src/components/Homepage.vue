<template>
  <div id="home">
    <TopBar />
    <img src="../assets/hp1.png" class="mainbox" />
  </div>
</template>

<script>
import TopBar from "./TopBar.vue";

export default {
  name: "home",
  components: {
    TopBar
  }
};
</script>


<style>
/* #mainbox {
  margin: auto;
  padding: 12px;
  width: 80%;
  height: 10px;
   overflow: hidden; 
  border-radius: 5%;
} */
.mainbox {
  object-fit: cover;
  padding: 12px;
  width: 80%;
  height: fit-content;
  border-radius: 20px;
}
</style>