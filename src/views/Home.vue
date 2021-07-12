<template>
  <body v-on:click="updateValues" class="quaternary">
    <Appbar />
    <div v-if="sale_bool" class="sale_banner">
      <h1 class="sale_text">
        SALE 50% OFF FIRST ORDER— TIME LEFT:
        {{ sale_days }}:{{ sale_hours }}:{{ sale_minutes }}:{{ sale_seconds }}
      </h1>
    </div>
    <v-container>
      <v-carousel
        cycle
        interval="6000"
        hide-delimiters
        hide-delimiter-background
        show-arrows-on-hover
        class="shadow"
        height="40vh"
        v-if="render_carousel"
      >
        <v-carousel-item v-for="(item, i) in items" :key="i" :src="item.src">
          <h2 class="carousel_text">{{ slideText[i] }}</h2>
        </v-carousel-item>
      </v-carousel>

      <v-btn
        x-large
        raised
        @click="orderRedirect()"
        width="100%"
        height="80"
        color="secondary"
        class="order_button shadow"
        >Order Now</v-btn
      >
    </v-container>
    <div class="quaternary">
      <v-container>
        <v-row>
          <v-col cols="12" md="4">
            <v-hover v-slot:default="{ hover }">
              <v-card
                href="/support"
                :elevation="hover ? 12 : 2"
                class="home-card center"
                width="80%"
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
                width="80%"
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
                width="80%"
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
    <v-container class="quaternary">
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
  </body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";
const axios = require("axios");

export default {
  data() {
    return {
      is_imperial: this.$global.units,
      render_carousel: true,
      sale_bool: false,
      sale_days: 0,
      fast_time: "",
      pricePerCm: "",
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
      slideText: ["• Made In the USA\n• $2 boards under 50x50mm"],
    };
  },
  methods: {
    updateValues() {
      if (this.is_imperial != this.$global.units) {
        this.is_imperial = this.$global.units;
        if (this.is_imperial) {
          this.updateSlideText();
        } else {
          this.updateSlideText();
        }
        this.$forceUpdate();
      }
    },
    updateSlideText() {
      if (this.is_imperial) {
        this.slideText = ["• Made In the USA\n• $2 boards under 2x2in"];
      } else {
        this.slideText = ["• Made In the USA\n• $2 boards under 50x50mm"];
      }
      if (this.turbo_multiplier != -1)
        this.slideText.push(
          "• Same-Day Shipping On Orders Placed Before 12 PM EST\n• Fast shipping"
        );
      else
        this.slideText.push(
          "• " + this.fast_time + " build time\n• Fast shipping"
        );
      if (this.is_imperial) {
        this.slideText.push(
          "• $" +
            this.pricePerCm * 2.54 +
            " / sqin \n• Free Shipping on orders over $10"
        );
      } else {
        this.slideText.push(
          "• $" +
            this.pricePerCm +
            " / sqcm \n• Free Shipping on orders over $10"
        );
      }
    },
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
    orderRedirect() {
      this.$router.push("/order");
    },
  },
  async beforeMount() {
    try {
      const formData = { password: process.env.VUE_APP_ORDER_PASS };

      const response = await axios.get(
        this.$baseUrl + "/api/sitevars/",
        formData
      );
      const sitevars = response.data
        .substring(1, response.data.length - 1)
        .split(', "');

      this.fast_time = sitevars[3].substring(
        sitevars[3].indexOf(": ") + 3,
        sitevars[3].length - 1
      );
      this.pricePerCm = sitevars[6].substring(
        sitevars[6].indexOf(": ") + 3,
        sitevars[6].length - 1
      );
      this.turbo_multiplier = parseFloat(
        sitevars[10].substring(
          sitevars[10].indexOf(": ") + 3,
          sitevars[10].length - 1
        )
      );
      this.updateSlideText();

      this.sale_end = sitevars[4].substring(
        sitevars[4].indexOf(": ") + 3,
        sitevars[4].length - 1
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
  margin: auto;
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
  margin-right: 210px;
  width: 80%;
  /*font-size:3rem;*/
  /* -webkit-text-stroke: 1.5px black;
  -webkit-text-fill-color: white; */
  text-shadow: 4px 4px 2px black;
}
.order_button {
  font-size: 25px;
  border-radius: 0px;
}
.quaternary {
  width: 100%;
  background-image: url("../assets/clean-textile.png");
  background-repeat: repeat;
  background-size: 100;
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
  padding-bottom: 30px;
}
a {
  text-decoration: none;
}
.shadow {
  box-shadow: 0 19px 24px rgba(0, 0, 0, 0.07), 0 15px 12px rgba(0, 0, 0, 0.13);
}
.shipping {
  margin: auto;
  padding: 10px;
  padding-top: 8.5%;
}
.shipping_image {
  display: inline-block;
  vertical-align: middle;
  padding-top: 10px;
  padding-left: 10px;
  width: 50%;
  max-height: 250px;
}
.sale_banner {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d83131;
  /* height: 50px; */
}
.sale_text {
  color: white;
  /* font-size: 2.4vw; */
  font-size: 200%;
}
</style>
