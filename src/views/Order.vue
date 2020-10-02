<template>
  <body class="quaternary">
    <Appbar />
    <v-form v-model="valid">
      <v-container class="container">
        <v-row>
          <v-col cols="8">
            <v-card class="card">
              <v-card-title>
                <h2 class="display-1">Order PCB</h2>
              </v-card-title>

              <v-card-text>
                Please upload your Gerber files and select your options.
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions>
                <v-btn
                  block
                  class="white--text"
                  color="primary"
                  v-if="!imageUrl"
                  @click="onPickFile"
                  >Upload Files</v-btn
                >

                <input
                  type="file"
                  style="display: none"
                  name="document"
                  ref="fileInput"
                  accept=".zip"
                  required
                  @change="onFilePicked"
                />
              </v-card-actions>
              <v-progress-linear
                indeterminate
                color="accent"
                v-if="loading"
              ></v-progress-linear>
              <v-card-text class="red--text" v-if="failed"
                >Invalid File</v-card-text
              >
              <v-img
                id="gerber-front"
                contain
                :src="`${imageUrl}.png`"
                max-height="500"
              />
              <v-divider></v-divider>
              <v-card-text>
                <span class="subheading">Size</span>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="order.width"
                      :rules="widthRules"
                      label="Width (mm)"
                      required
                      readonly
                      @change="updatePrice"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="order.height"
                      :rules="heightRules"
                      label="Height (mm)"
                      required
                      readonly
                      @change="updatePrice"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-text>
                <span class="subheading">Quantity</span>

                <v-text-field
                  v-model="order.quantity"
                  :rules="quantRules"
                  @change="updatePrice"
                  >{{ order.quantity }}</v-text-field
                >
              </v-card-text>

              <v-card-text>
                <span class="subheading">Speed</span>

                <v-chip-group
                  v-model="order.speed"
                  active-class="secondary"
                  mandatory
                  @change="updatePrice"
                >
                  <v-tooltip top v-for="speed in speeds" :key="speed">
                    <template v-slot:activator="{ on, attrs }">
                      <v-chip v-bind="attrs" v-on="on" :value="speed">
                        {{ speed }}
                      </v-chip>
                    </template>
                    <span v-if="speed == 'Economy'"
                      >Ships in &#60; 10 days</span
                    >
                    <span v-if="speed == 'Fast'">Ships in &#60; 24 hours</span>
                    <span v-if="speed == 'Turbo'">Ships in &#60; 3 hours</span>
                  </v-tooltip>
                </v-chip-group>
              </v-card-text>

              <v-card-text>
                <span class="subheading">Color</span>

                <v-chip-group
                  v-model="order.color"
                  active-class="secondary"
                  mandatory
                  @change="updatePrice"
                >
                  <v-tooltip
                    top
                    :disabled="color == 'Any' || order.speed == 'Turbo'"
                    v-for="color in colors"
                    :key="color"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-chip v-bind="attrs" v-on="on" :value="color">
                        {{ color }}
                      </v-chip>
                    </template>
                    <span v-if="order.speed == 'Economy'">+$2</span>
                    <span v-if="order.speed == 'Fast'">+$4</span>
                  </v-tooltip>
                </v-chip-group>
              </v-card-text>

              <v-card-text>
                <span class="subheading">Silkscreen</span>

                <v-chip-group
                  v-model="order.silk"
                  active-class="secondary"
                  mandatory
                  @change="updatePrice"
                >
                  <v-tooltip
                    top
                    :disabled="silk == 'None' || order.speed == 'Turbo'"
                    v-for="silk in silkOpt"
                    :key="silk"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-chip
                        :disabled="silk == 'White' || silk == 'Black'"
                        v-bind="attrs"
                        v-on="on"
                        :value="silk"
                      >
                        {{ silk }}
                      </v-chip>
                    </template>
                    <span>+$0.50</span>
                  </v-tooltip>
                </v-chip-group>
              </v-card-text>

              <v-card-text>
                <span class="subheading">Layers</span>

                <v-chip-group
                  v-model="order.layers"
                  active-class="secondary"
                  mandatory
                >
                  <v-chip
                    v-for="layers in layerOpt"
                    :key="layers"
                    :value="layers"
                    >{{ layers }}</v-chip
                  >
                </v-chip-group>
              </v-card-text>
              <v-card-text>
                <span class="subheading">Custom Requests</span>
                <v-text-field
                  v-model="order.request"
                  :rules="requestRules"
                  :counter="512"
                  >{{ order.request }}</v-text-field
                >
              </v-card-text>
            </v-card>
          </v-col>

          <v-col>
            <v-card class="card">
              <v-card-title>
                <h2 class="display-1">Price</h2>
              </v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <span
                  class="title"
                  v-text="'$' + price.toFixed(2).toString()"
                  :style="
                    salePrice != 0 ? 'text-decoration: line-through' : null
                  "
                ></span>
                <span
                  class="title"
                  v-text="
                    ' ' + Math.round((1 - salePrice / price) * 100) + '% off'
                  "
                  v-if="salePrice"
                ></span>
                <br />

                <span
                  class="title"
                  style="color: red"
                  v-text="'$' + salePrice.toFixed(2).toString()"
                  v-if="salePrice"
                ></span>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  block
                  class="white--text"
                  color="primary"
                  @click="valid ? (overlay = !overlay) : null"
                  >Purchase</v-btn
                >
                <v-overlay opacity=".5" :value="overlay">
                  <v-card class="ma-3 pa-3">
                    <v-btn icon @click="overlay = false">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-card-title>
                      <h2 class="display-1">Continue Shopping</h2>
                    </v-card-title>

                    <v-card-text
                      >Would you like to continue shopping or
                      checkout?</v-card-text
                    >

                    <v-divider></v-divider>

                    <v-btn color="primary" @click="storeRedirect()"
                      >Continue Shopping</v-btn
                    >
                    <v-btn color="primary" @click="purchaseRedirect()"
                      >Checkout Now</v-btn
                    >
                  </v-card>
                </v-overlay>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
    <Bottom />
  </body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";

var pricePerCm = 0.1;
var sale = 1; //(.9 = 10% off)

export default {
  data: () => ({
    valid: false,
    overlay: false,
    loading: false,
    failed: false,
    price: 0,
    salePrice: 0,
    imageUrl: "",
    gerber: "",
    order: {
      name: "PCB Prototyping Service",
      orderNum: "",
      width: "0",
      height: "0",
      quantity: "1",
      speed: "Economy",
      color: "Any",
      silk: "None",
      layers: "2",
      request: "",
      price: 0,
      stage: "Processing",
    },
    quantRules: [
      (value) => !!value || "Required",
      (value) =>
        (!isNaN(value) && !value.includes(".")) || "Must be an integer value",
    ],
    widthRules: [
      (value) => !!value || "Required",
      (value) => !isNaN(value) || "Must be a number",
      (value) => value > 0 || "Must be greater than 0",
      (value) => value <= 215 || "Maximum width is 215 mm",
    ],
    heightRules: [
      (value) => !!value || "Required",
      (value) => !isNaN(value) || "Must be a number",
      (value) => value > 0 || "Must be greater than 0",
      (value) => value <= 279 || "Maximum height is 279 mm",
    ],
    requestRules: [
      (value) => value.length <= 512 || "Can not exceed 512 characters",
    ],
    layerOpt: ["1", "2"],
    speeds: ["Economy", "Fast", "Turbo"],
    colors: ["White", "Blue", "Red", "Any"],
    silkOpt: ["White", "Black", "None"],
  }),
  methods: {
    updatePrice() {
      //swaps size
      if (
        this.order.width > 0 &&
        this.order.height > 0 &&
        this.order.width > this.order.height
      ) {
        var temp = this.order.width;
        this.order.width = this.order.height;
        this.order.height = temp;
      }
      // if (this.width > 50 || this.height > 50)
      this.price =
        parseInt(this.order.quantity) *
        parseFloat(this.order.width / 10) *
        parseFloat(this.order.height / 10) *
        pricePerCm;
      // else this.price = 2 * this.quantity;
      if (this.order.speed == "Fast") this.price *= 2;
      else if (this.order.speed == "Turbo") {
        var panels =
          this.order.quantity / Math.floor(279.4 / this.order.height);
        panels /= Math.floor(215.9 / this.order.width);
        panels = Math.floor(panels) + 1;
        this.price = 250 * panels;
      }
      if (this.order.color != "Any") {
        if (this.order.speed == "Economy") this.price += 2;
        else if (this.order.speed == "Fast") this.price += 4;
      }
      if (sale != 1) {
        this.salePrice = this.price * sale;
        this.order.price = this.salePrice;
      } else this.order.price = this.price;
    },
    onPickFile() {
      this.loading = true;
      this.$refs.fileInput.click();
    },
    async onFilePicked(e) {
      this.failed = false;
      try {
        var files = e.target.files;
        var f = files[0];
        var filename = f.name;

        if (filename.lastIndexOf(".") <= 0) {
          return alert("Please add a valid file");
        }
        //generate order number
        this.order.orderNum =
          Math.random().toString(36).substring(2, 10) +
          Math.random().toString(36).substring(2, 10);

        //form data
        var formData = new FormData();
        formData.append("orderNum", this.order.orderNum);
        formData.append("gerber", f);

        //http file post
        const axios = require("axios");

        const response = await axios.post(
          this.$baseUrl + "/api/files/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.order.width = response.data.width;
        this.order.height = response.data.height;
        this.updatePrice();

        this.imageUrl = this.$baseUrl + "/files/images/" + this.order.orderNum;
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.failed = true;
      }
    },
    purchaseRedirect() {
      if (!this.failed && this.imageUrl) {
        this.addToCart();
        this.$router.push("/purchase");
      }
    },
    storeRedirect() {
      if (!this.failed && this.imageUrl) {
        this.addToCart();
        // this.$router.push("/store");
        this.$router.push("/");
      }
    },
    addToCart() {
      if (this.$cart.length == 0)
        this.$cart.push(
          Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10)
        );
      this.$cart.push(this.order);
      console.log(this.$cart);
    },
  },
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.container {
  padding-bottom: 10%;
}
</style>
