<template>
  <body class="secondary">
    <Appbar />
    <v-form v-model="valid">
      <v-container>
        <v-row>
          <v-col cols="8">
            <v-card class="tertiary">
              <v-card-title>
                <h2 class="display-1">Order PCB</h2>
              </v-card-title>

              <v-card-text
                >Please upload your Gerber files and select your
                options.</v-card-text
              >

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
                      v-model="width"
                      :rules="widthRules"
                      label="Width (mm)"
                      required
                      @change="updatePrice"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="height"
                      :rules="heightRules"
                      label="Height (mm)"
                      required
                      @change="updatePrice"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-text>
                <span class="subheading">Quantity</span>

                <v-text-field
                  v-model="quantity"
                  :rules="quantRules"
                  @change="updatePrice"
                  >{{ quantity }}</v-text-field
                >
              </v-card-text>

              <v-card-text>
                <span class="subheading">Speed</span>

                <v-chip-group
                  v-model="speed"
                  active-class="accent"
                  mandatory
                  @change="updatePrice"
                >
                  <v-tooltip top v-for="speed in speeds" :key="speed">
                    <template v-slot:activator="{ on, attrs }">
                      <v-chip v-bind="attrs" v-on="on" :value="speed">{{
                        speed
                      }}</v-chip>
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
                  v-model="color"
                  active-class="accent"
                  mandatory
                  @change="updatePrice"
                >
                  <v-tooltip
                    top
                    :disabled="color == 'Any' || speed == 'Turbo'"
                    v-for="color in colors"
                    :key="color"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-chip v-bind="attrs" v-on="on" :value="color">{{
                        color
                      }}</v-chip>
                    </template>
                    <span v-if="speed == 'Economy'">+$2</span>
                    <span v-if="speed == 'Fast'">+$4</span>
                  </v-tooltip>
                </v-chip-group>
              </v-card-text>

              <v-card-text>
                <span class="subheading">Layers</span>

                <v-chip-group v-model="layers" active-class="accent" mandatory>
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
                  v-model="request"
                  :rules="requestRules"
                  :counter="512"
                  >{{ quantity }}</v-text-field
                >
              </v-card-text>
            </v-card>
          </v-col>

          <v-col>
            <v-card class="tertiary">
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
                  @click="valid ? purchaseRedirect() : null"
                  >Purchase</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import globals from "../globals.js";

var pricePerCm = 0.1;
var sale = 1; //(.9 = 10% off)

export default {
  data: () => ({
    valid: false,
    price: 0,
    price2: 0,
    salePrice: 0,
    imageUrl: "",
    gerber: "",
    quantity: "1",
    quantRules: [
      (value) => !!value || "Required",
      (value) =>
        (!isNaN(value) && !value.includes(".")) || "Must be an integer value",
    ],
    width: "0",
    height: "0",
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
    layers: "2",
    layerOpt: ["1", "2"],
    speed: "Economy",
    speeds: ["Economy", "Fast", "Turbo"],
    color: "Any",
    colors: ["White", "Blue", "Red", "Any"],
    request: "",
    requestRules: [
      (value) => value.length <= 512 || "Can not exceed 512 characters",
    ],
    orderNum: "",
    loading: false,
    failed: false,
  }),
  methods: {
    updatePrice() {
      //swaps size
      if (this.width > 0 && this.height > 0 && this.width > this.height) {
        var temp = this.width;
        this.width = this.height;
        this.height = temp;
      }
      if (this.width > 50 || this.height > 50)
        this.price =
          parseInt(this.quantity) *
          parseFloat(this.width / 10) *
          parseFloat(this.height / 10) *
          pricePerCm;
      else this.price = 2 * this.quantity;
      if (this.speed == "Fast") this.price *= 2;
      else if (this.speed == "Turbo") {
        var panels = this.quantity / Math.floor(279.4 / this.height);
        panels /= Math.floor(215.9 / this.width);
        panels = Math.floor(panels) + 1;
        this.price = 250 * panels;
      }
      if (this.color != "Any") {
        if (this.speed == "Economy") this.price += 2;
        else if (this.speed == "Fast") this.price += 4;
      }
      if (sale != 1) {
        this.salePrice = this.price * sale;
        this.price2 = this.salePrice;
      } else this.price2 = this.price;
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
        this.orderNum =
          Math.random()
            .toString(36)
            .substring(2, 10) +
          Math.random()
            .toString(36)
            .substring(2, 10);

        //form data
        var formData = new FormData();
        formData.append("orderNum", this.orderNum);
        formData.append("gerber", f);

        //http file post
        const axios = require("axios");

        const response = await axios.post(
          "https://api.vaflpcb.com/api/files/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.width = response.data.width;
        this.height = response.data.height;
        this.updatePrice();

        this.imageUrl = "https://api.vaflpcb.com/images/" + this.orderNum;
        this.loading = false;
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.failed = true;
      }
    },
    purchaseRedirect() {
      if (!this.failed && this.imageUrl) {
        globals.width = this.width;
        globals.height = this.height;
        globals.quantity = this.quantity;
        globals.speed = this.speed;
        globals.color = this.color;
        globals.layers = this.layers;
        globals.price = this.price2;
        globals.orderNum = this.orderNum;
        globals.request = this.request;

        this.$router.push("/purchase");
      }
    },
  },
  components: { Appbar },
};
</script>
