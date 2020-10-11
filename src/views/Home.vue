<template>
  <v-app>
    <Appbar />
    <div v-if="sale_bool" class="sale_banner">
      <h1 class="sale_text">
        SALE 50% OFF — TIME LEFT:
        {{ sale_days }}:{{ sale_hours }}:{{ sale_minutes }}:{{ sale_seconds }}
      </h1>
    </div>
    <v-carousel
      cycle
      interval="6000"
      hide-delimiters
      class="shadow"
      height="600"
    >
      <v-carousel-item v-for="(item, i) in items" :key="i" :src="item.src">
        <h2 class="carousel_text">{{ slideText[i] }}</h2>
      </v-carousel-item>
      <div class="button">
        <v-btn
          x-large
          raised
          to="/order"
          class="order_button"
          height="100"
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
                  src="../assets/timer.svg"
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
                  src="../assets/microscope.svg"
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
                  src="../assets/michigan.svg"
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
            <img src="../assets/letter.svg" class="shipping_image" />
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
          <a href="/design-rules"
            ><h2 class="start_subheader">Design Rules</h2></a
          >
        </v-col>
        <v-col cols="12" md="4">
          <a href="/export"
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
      sale_bool: false,
      sale_days: 0,
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
        "• Made In the USA\n• Professional quality",
        "• 24 hour turnaround time\n• Fast shipping",
        "• $0.10 / sqcm \n• Free Shipping on orders over $10",
      ],
    };
  },
  methods: {
    formatNum: (num) => (num < 10 ? "0" + num : num),
    saleCountDown() {
      if (this.total > 0) {
        setInterval(() => {
          this.total = Date.parse(this.sale_end) - Date.parse(new Date());
          this.sale_seconds = Math.floor((this.total / 1000) % 60);
          this.sale_minutes = Math.floor((this.total / 1000 / 60) % 60);
          this.sale_hours = Math.floor((this.total / (1000 * 60 * 60)) % 24);
          this.sale_days = Math.floor(this.total / (1000 * 60 * 60 * 24));
          this.sale_bool = false;
          this.sale_bool = true;
        }, 1000);
      } else {
        this.sale_bool = false;
      }
    },
  },
  async beforeMount() {
    try {
      const axios = require("axios");
      const formData = { password: process.env.VUE_APP_ORDER_PASS };

      const response = await axios.get(
        this.$baseUrl + "/api/sitevars/",
        formData
      );
      const sitevars = response.data
        .substring(1, response.data.length - 1)
        .split(', "');

      this.sale_end = sitevars[2].substring(
        sitevars[2].indexOf(": ") + 3,
        sitevars[2].length - 1
      );
      this.currtime = new Date();
      this.total = Date.parse(this.sale_end) - Date.parse(this.currtime);
      this.saleCountDown();
    } catch {
      console.log("couldnt get site vars");
    }
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
.carousel_text {
  white-space: pre-wrap;
  position: absolute;
  left: 60px;
  bottom: 30px;
  margin-right: 20vw;
  font-size: 300%;
  /* -webkit-text-stroke: 1.5px black;
  -webkit-text-fill-color: white; */
  text-shadow: 4px 4px 2px black;
}
.button {
  position: absolute;
  right: 2%;
  bottom: 2%;
}
.order_button {
  width: 20vw;
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
.sale_banner {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d83131;
  height: 50px;
}
.sale_text {
  color: white;
  /* font-size: 2.4vw; */
  font-size: 200%;
}
</style>
