<template>
  <div class="secondary">
    <Appbar />
    <div>
      <v-container class="container">
        <div>
          <h1>About Us</h1>
          <v-divider></v-divider>
          <p>
            We are a PCB manufacting company based in Michigan. All boards are
            manufactured in house. For additional information check out our
            <a href="/support">Frequently Answered Questions</a> or contact us
            at vaflpcb@gmail.com.
          </p>
        </div>
      </v-container>
    </div>
    <Bottom />
  </div>
</template>


<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";

export default {
  data: () => ({}),
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.center {
  margin: auto;
}
h1,
p {
  padding: 15px;
}
.container {
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
  background-color: white;
  height: 200px;
  width: 100%;
  padding: 30px;
  margin-top: 30px;
  margin-bottom: 300px;
}
</style>