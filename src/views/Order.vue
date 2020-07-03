<template>
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
            <v-btn block class="white--text" color="primary" @click="onPickFile"
              >Upload Files</v-btn
            >
            <input
              type="file"
              style="display: none"
              ref="fileInput"
              accept="image/*"
              @change="onFilePicked"
            />
          </v-card-actions>
          <v-img
            contain
            :src="imageUrl"
            :height="imageUrl != '' ? '50' : '0'"
          />

          <v-divider></v-divider>
          <v-card-text>
            <span class="subheading">Size</span>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="width"
                  :rules="sizeRules"
                  label="Width (cm)"
                  required
                  @change="updatePrice"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="height"
                  :rules="sizeRules"
                  label="Height (cm)"
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
            <v-btn block class="white--text" color="primary">Add to Cart</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
var pricePerCm = 0.3;
export default {
  data: () => ({
    price: 0,
    imageUrl: "",
    gerber: null,
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
      (value) =>
        (!isNaN(value) && !value.includes(".")) || "Must be an integer value",
    ],
    layers: "2",
    layerOpt: ["1", "2"],
    speed: "Fast",
    speeds: ["Economy", "Fast", "Turbo"],
    color: "Any",
    colors: ["White", "Blue", "Red", "Any"],
  }),
  methods: {
    updatePrice() {
      if (this.speed == "Fast")
        this.price =
          parseInt(this.quantity) *
          parseFloat(this.width) *
          parseFloat(this.height) *
          pricePerCm;
      else if (this.speed == "Economy")
        this.price =
          (parseInt(this.quantity) *
            parseFloat(this.width) *
            parseFloat(this.height) *
            pricePerCm) /
          2;
      else this.price = 250;
    },
    onPickFile() {
      this.$refs.fileInput.click();
    },
    onFilePicked(e) {
      const files = e.target.files;
      let filename = files[0].name;
      if (filename.lastIndexOf(".") <= 0) {
        return alert("Please add a valid file");
      }
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => {
        this.imageUrl = fileReader.result;
      });
      fileReader.readAsDataURL(files[0]);
      this.gerber = files[0];
    },
  },
};
</script>
