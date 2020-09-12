<template>
  <v-app>
    <Appbar />
    <v-carousel cycle interval="6000" hide-delimiters elevation="12">
      <v-carousel-item v-for="(item,i) in items" :key="i" :src="item.src">
        <p class="display-2">{{ slideText[i] }}</p>
      </v-carousel-item>
      <div class="button">
        <v-btn x-large raised to="/order" height="100" width="300" color="secondary">Order Now</v-btn>
      </div>
    </v-carousel>
    <div class="quaternary">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <v-hover v-slot:default="{ hover }">
              <v-card href="/support" :elevation="hover ? 12 : 2" class="home-card">
                <v-img src="../assets/fast.png" class="home-card-image" contain />
                <a class="home-card-text">
                  <h3>Lightning Fast Manufacturing</h3>
                  <p>Get your boards manufactured in under 24 hours.</p>
                </a>
              </v-card>
            </v-hover>
          </v-col>
          <v-col cols="12" md="4">
            <v-hover v-slot:default="{ hover }">
              <v-card href="/capabilities" :elevation="hover ? 12 : 2" class="home-card">
                <v-img src="../assets/microscope.png" class="home-card-image" contain />
                <a class="home-card-text">
                  <h3>Professional Precision</h3>
                  <p>Tighter manufacturing tollerances than competing prototyping services.</p>
                </a>
              </v-card>
            </v-hover>
          </v-col>
          <v-col cols="12" md="4">
            <v-hover v-slot:default="{ hover }">
              <v-card href="/about" :elevation="hover ? 12 : 2" class="home-card">
                <v-img src="../assets/michigan.png" class="home-card-image" contain />
                <a class="home-card-text">
                  <h3>Midwestern Made</h3>
                  <p>Get faster and cheaper shipping, without sacrificing quality, by ordering from us here in Michigan.</p>
                </a>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <Bottom />
  </v-app>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";

export default {
  data() {
    return {
      items: [
        {
          src: require("../assets/c_1.jpg"),
        },
        {
          src: require("../assets/c_2.jpg"),
        },
        {
          src: require("../assets/c_3.jpg"),
        },
      ],
      slideText: [
        "• 24 hour turnaround time\n• Fast shipping",
        "• Made In the USA\n• Professional quality",
        "• $2 / board (size ≤ 50 x 50mm)\n• Free Shipping on orders over $10",
      ],
    };
  },
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.home-card {
  height: 400px;
  padding: 10px;
}
.home-card-text {
  text-align: center;
  display: block;
}
.home-card-text span {
  margin: auto;
  position: absolute;
  bottom: 0;
}
.home-card-image {
  height: 250px;
}
.display-2 {
  white-space: pre-wrap;
  position: absolute;
  left: 60px;
  bottom: 30px;
}
.button {
  position: absolute;
  right: 2%;
  bottom: 2%;
}
.quaternary {
  width: 100%;
}
</style>
