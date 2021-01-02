<template>
  <body class="quaternary">
    <Appbar />
    <v-container class="fill-height quaternary" fluid>
      <v-container class="about_container">
        <div>
          <h1>About Us</h1>
          <v-divider></v-divider>
          <p>
            We are a PCB manufacting company based in Michigan. All boards are
            manufactured in house. For additional information check out our
            <a href="/support">Frequently Answered Questions</a> or contact us
            at support@vaflpcb.com.
          </p>
        </div>
      </v-container>
    </v-container>
    <Bottom />
  </body>
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
h1,
p {
  padding: 15px;
}
.about_container {
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
  background-color: white;
  width: 100%;
  padding: 30px;
  align-self: start;
  margin-top: 30px;
}
</style>