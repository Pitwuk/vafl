<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="8">
          <v-card>
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
              color="green"
              v-if="loading"
            ></v-progress-linear>
            <v-card-text class="red--text" v-if="failed"
              >Invalid File</v-card-text
            >
            <v-img
              id="gerber-front"
              contain
              :src="`${imageUrl}/pcb.png`"
              max-height="500"
            />
            <v-divider></v-divider>
            <v-card-text>
              <span class="subheading">Size</span>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="width"
                    :rules="sizeRules"
                    label="Width (mm)"
                    required
                    @change="updatePrice"
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="height"
                    :rules="sizeRules"
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
                active-class="deep-purple--text text--accent-4"
                mandatory
                @change="updatePrice"
              >
                <v-chip v-for="speed in speeds" :key="speed" :value="speed">{{
                  speed
                }}</v-chip>
              </v-chip-group>
            </v-card-text>

            <v-card-text>
              <span class="subheading">Color</span>

              <v-chip-group
                v-model="color"
                active-class="deep-purple--text text--accent-4"
                mandatory
                @change="updatePrice"
              >
                <v-chip v-for="color in colors" :key="color" :value="color">{{
                  color
                }}</v-chip>
              </v-chip-group>
            </v-card-text>

            <v-card-text>
              <span class="subheading">Layers</span>

              <v-chip-group
                v-model="layers"
                active-class="deep-purple--text text--accent-4"
                mandatory
                @change="updatePrice"
              >
                <v-chip
                  v-for="layers in layerOpt"
                  :key="layers"
                  :value="layers"
                  >{{ layers }}</v-chip
                >
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col>
          <v-card>
            <v-card-title>
              <h2 class="display-1">Price</h2>
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <span
                class="title"
                v-text="'$' + price.toFixed(2).toString()"
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
</template>

<script>
import globals from "../globals.js";
var pricePerCm = 0.3;

export default {
  data: () => ({
    valid: false,
    price: 0,
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
    sizeRules: [
      (value) => !!value || "Required",
      (value) => !isNaN(value) || "Must be a number",
      (value) => value > 0 || "Must be greater than 0",
    ],
    layers: "2",
    layerOpt: ["1", "2"],
    speed: "Economy",
    speeds: ["Economy", "Fast", "Turbo"],
    color: "Any",
    colors: ["White", "Blue", "Red", "Any"],
    orderNum: "",
    loading: false,
    failed: false,
  }),
  methods: {
    updatePrice() {
      if (this.speed == "Fast")
        this.price =
          parseInt(this.quantity) *
          parseFloat(this.width / 10) *
          parseFloat(this.height / 10) *
          pricePerCm;
      else if (this.speed == "Economy")
        this.price =
          (parseInt(this.quantity) *
            parseFloat(this.width / 10) *
            parseFloat(this.height / 10) *
            pricePerCm) /
          2;
      else this.price = 250;
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
          "http://toasterwaffles.ddns.net/api/files/",
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

        this.imageUrl =
          "http://toasterwaffles.ddns.net/gerbers/" + this.orderNum;
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
        globals.colors = this.colors;
        globals.layers = this.layers;
        globals.price = this.price;
        globals.orderNum = this.orderNum;

        this.$router.push("/purchase");
      }
    },
  },
};
</script>
