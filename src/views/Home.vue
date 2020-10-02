<template>
  <v-app>
    <Appbar />
    <v-carousel cycle interval="6000" hide-delimiters class="shadow">
      <v-carousel-item v-for="(item, i) in items" :key="i" :src="item.src">
        <p class="display-2">{{ slideText[i] }}</p>
      </v-carousel-item>
      <div class="button">
        <v-btn
          x-large
          raised
          to="/order"
          height="100"
          width="300"
          color="secondary"
          >Order Now</v-btn
        >
      </div>
    </v-carousel>
    <div class="quaternary">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <v-hover v-slot:default="{ hover }">
              <v-card
                href="/support"
                :elevation="hover ? 12 : 2"
                class="home-card"
              >
                <v-img
                  src="../assets/fast.png"
                  class="home-card-image"
                  contain
                />
                <a class="home-card-text">
                  <h3>Lightning Fast Manufacturing</h3>
                  <p>Get your boards manufactured in under 24 hours.</p>
                </a>
              </v-card>
            </v-hover>
          </v-col>
          <v-col cols="12" md="4">
            <v-hover v-slot:default="{ hover }">
              <v-card
                href="/capabilities"
                :elevation="hover ? 12 : 2"
                class="home-card"
              >
                <v-img
                  src="../assets/microscope.png"
                  class="home-card-image"
                  contain
                />
                <a class="home-card-text">
                  <h3>Professional Precision</h3>
                  <p>
                    Tighter manufacturing tollerances than competing prototyping
                    services.
                  </p>
                </a>
              </v-card>
            </v-hover>
          </v-col>
          <v-col cols="12" md="4">
            <v-hover v-slot:default="{ hover }">
              <v-card
                href="/about"
                :elevation="hover ? 12 : 2"
                class="home-card"
              >
                <v-img
                  src="../assets/michigan.png"
                  class="home-card-image"
                  contain
                />
                <a class="home-card-text">
                  <h3>Midwestern Made</h3>
                  <p>
                    Get faster and cheaper shipping, without sacrificing
                    quality, by ordering from us here in Michigan.
                  </p>
                </a>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <div class="tertiary shadow">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <img src="../assets/letter.png" class="shipping_image" />
          </v-col>
          <v-col cols="12" md="8">
            <h1 class="shipping">Free shipping on orders over $10</h1>
          </v-col>
        </v-row>
      </v-container>
    </div>
    <h1 class="start_header">Getting Started</h1>
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <a href="/capabilities"
            ><h2 class="start_subheader">Design Rules</h2></a
          >
        </v-col>
        <v-col cols="12" md="4">
          <a href="/capabilities"
            ><h2 class="start_subheader">Exporting Gerbers</h2></a
          >
        </v-col>
        <v-col cols="12" md="4">
          <a href="/ordersupport"
            ><h2 class="start_subheader">How to Order</h2></a
          >
        </v-col>
      </v-row>
    </v-container>

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
.start_header {
  padding-top: 30px;
  padding-bottom: 30px;
  margin: auto;
}
.start_subheader {
  text-align: center;
  display: list-item;
  list-style-type: disc;
  list-style-position: inside;
  color: #b57f50;
  padding-bottom: 30px;
}
a {
  text-decoration: none;
}
.shadow {
  box-shadow: 0 19px 24px rgba(0, 0, 0, 0.07), 0 15px 12px rgba(0, 0, 0, 0.13);
}
.shipping {
  padding: 10px;
  vertical-align: middle;
  line-height: 500%;
}
.shipping_image {
  display: inline-block;
  vertical-align: middle;
  padding: 10px;
  width: 50%;
  max-height: 250px;
}
</style>
