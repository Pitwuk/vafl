<template>
  <body class="quaternary">
    <Appbar />
    <v-form v-model="valid">
      <v-container class="container">
        <v-row>
          <v-col cols="8">
            <v-card class="card" id="order_card">
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
                  v-if="!width"
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
                >Invalid File. Please ensure your files are formatted correctly
                by reading our
                <a href="/export">Eporting Guide.</a></v-card-text
              ><span id="top_img"><br /></span><span id="bottom_img"></span>
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
                    <span v-if="speed == 'Fast'"
                      >Ships in &#60; {{ fast_time }}</span
                    >
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
                      <v-chip
                        :disabled="disabled_colors.includes(color)"
                        v-bind="attrs"
                        v-on="on"
                        :value="color"
                      >
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
                        :disabled="disabled_silk.includes(silk)"
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
                    ' ' +
                    Math.round((1 - parseFloat(salePrice) / price) * 100) +
                    '% off'
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
import { SVG } from "@svgdotjs/svg.js";
// import { Board } from "../plugins/Gerber.js";
const axios = require("axios");

var pricePerCm = 0.1;

export default {
  data: () => ({
    valid: false,
    overlay: false,
    loading: false,
    failed: false,
    price: 0,
    salePrice: 0,
    sale: 1,
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
    speeds: ["Economy", "Fast"],
    colors: ["White", "Blue", "Red", "Any"],
    disabled_colors: [],
    silkOpt: ["White", "Black", "None"],
    disabled_silk: [],
    fast_time: "",
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
          pricePerCm +
        0.3;
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
      if (this.sale != 1) {
        this.salePrice = this.price * this.sale;
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

        var response = await axios.post(
          this.$baseUrl + "/api/api/files/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.files = response.data;
        this.verbose = false;
        this.max_height = 500;
        this.max_width = document
          .getElementById("order_card")
          .getBoundingClientRect().width;
        this.render();

        this.updatePrice();

        // this.imageUrl = this.$baseUrl + "/files/images/" + this.order.orderNum;
        this.loading = false;

        var svg_file = this.top_svg ? this.top_svg : this.drawing;

        formData = { orderNum: this.order.orderNum, img: svg_file.svg() };
        const img_response = await axios.post(
          this.$baseUrl + "/api/upload_image/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.failed = true;
      }
    },
    purchaseRedirect() {
      if (!this.failed && this.width) {
        this.addToCart();
        this.$router.push("/purchase");
      }
    },
    storeRedirect() {
      if (!this.failed && this.width) {
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
    //gerber-renderer
    render() {
      if (
        this.files["drill"] &&
        this.files["outline"] &&
        this.files["top_copper"] &&
        this.files["top_mask"]
      ) {
        if (this.verbose) console.log("Rendring Top");
        this.draw_svg("top", "top.svg");
      } else {
        console.log("No Top Files");
      }
      // render bottom
      if (
        this.files["drill"] &&
        this.files["outline"] &&
        this.files["bottom_copper"] &&
        this.files["bottom_mask"]
      ) {
        if (this.verbose) console.log("Rendring Top");
        this.draw_svg("bottom", "bottom.svg");
      } else {
        console.log("No Top Files");
      }
    },
    draw_svg(layer, filename) {
      // this.drawing.rect(100, 100).attr({ fill: "#f06" });
      if (!this.width) {
        this.set_dimensions();

        this.scale = this.max_height / this.height;
        if (this.max_width / this.width < this.scale)
          this.scale = this.max_width / this.width;
      }
      if (this.drawing) this.top_svg = this.drawing;
      this.drawing = SVG()
        .addTo("#" + layer + "_img")
        .size("100%", this.height * this.scale)
        .attr({
          viewbox:
            " 0 0 " + this.width * this.scale + " " + this.height * this.scale,
          preserveAspectRatio: "xMidYMid meet",
        });

      // draw background rectangle
      this.drawing
        .rect(this.width * this.scale, this.height * this.scale)
        .fill("#C22F20");
      // .fill("#f0e6aa");

      if (this.verbose) console.log("Milling Outline");
      this.init_file(this.files["outline"]);
      this.draw_macros(this.files["outline"], "#C22F20");

      if (this.verbose) console.log("Etching Copper");
      this.init_file(this.files[layer + "_copper"]);
      this.draw_macros(this.files[layer + "_copper"], "#FF2C16");

      if (this.files[layer + "_silk"] && this.silk_bool) {
        if (this.verbose) console.log("Curing Silk Screen");
        this.init_file(this.files[layer + "_silk"]);
        this.draw_macros(this.files[layer + "_silk"], "white");
      }

      if (this.verbose) console.log("Applying Solder Mask");
      this.init_file(this.files[layer + "_mask"]);
      this.draw_macros(this.files[layer + "_mask"], "#AFA9A5");

      // draw drill holes
      if (this.verbose) console.log("Drilling Holes");
      this.drill_holes();

      // save svg
      // fs.writeFileSync(this.output_folder + filename, this.drawing.svg());
    },
    set_dimensions() {
      const file = this.files["outline"];
      this.set_decimal_places(file);
      this.width = 0;
      this.height = 0;
      this.min_x = 9999999;
      this.min_y = 9999999;
      var pointer = file.indexOf("D10");
      pointer = file.indexOf("X", pointer);
      while (pointer != -1) {
        var y = file.indexOf("Y", pointer + 1);
        var temp = Math.abs(file.substring(pointer + 1, y)) / this.x_decimals;
        if (temp > this.width) this.width = temp;
        if (temp < this.min_x) this.min_x = temp;

        pointer = file.indexOf("D", y + 1);
        if (file.substring(y + 1, pointer).indexOf("I") != -1)
          pointer = file.indexOf("I", y + 1, pointer);
        if (file.substring(y + 1, pointer).indexOf("J") != -1)
          pointer = file.indexOf("J", y + 1, pointer);
        temp = file.substring(y + 1, pointer);
        temp = Math.abs(temp) / this.y_decimals;
        if (temp > this.height) this.height = temp;
        if (temp < this.min_y) this.min_y = temp;
        pointer = file.indexOf("X", pointer);
      }
      this.width -= this.min_x;
      this.height -= this.min_y;
      this.unit = "mm";
      if (file.indexOf("MOIN") != -1) {
        this.unit = "in";
        this.order.width = this.width * 25.4;
        this.order.height = this.height * 25.4;
      } else {
        this.order.width = this.width;
        this.order.height = this.height;
      }
      if (this.verbose)
        console.log(
          "Board Dimensions: " +
            this.width.toFixed(2) +
            " x " +
            this.height.toFixed(2) +
            " " +
            this.unit
        );
    },
    set_decimal_places(file) {
      var index = file.indexOf("FSLAX");
      this.x_decimals = file.substring(index + 6, index + 7);
      this.y_decimals = file.substring(index + 9, index + 10);
      this.x_decimals = Math.pow(10, this.x_decimals);
      this.y_decimals = Math.pow(10, this.y_decimals);
    },
    init_file(file) {
      this.set_decimal_places(file);
      this.store_apertures(file);
      this.find_aperture_locations(file);
    },
    store_apertures(file) {
      // [[id,type, radius, additional rect dimention]]
      this.apertures = {};
      var index = file.indexOf("ADD");
      while (index != -1) {
        var profile = [];
        var id_end = file.indexOf(",", index) - 1;
        var a_id = file.substring(index + 3, id_end);
        // store macro type
        profile.push(file[id_end]);
        // single dimension
        if (
          file.substring(index, file.indexOf("*", index)).indexOf("X") == -1
        ) {
          profile.push(
            (parseFloat(
              file.substring(
                file.indexOf(",", index) + 1,
                file.indexOf("*", index)
              )
            ) /
              2) *
              this.scale
          );
          // two dimensions
        } else if (
          file
            .substring(file.indexOf("X", index) + 1, file.indexOf("*", index))
            .indexOf("X") == -1
        ) {
          profile.push(
            parseFloat(
              file.substring(
                file.indexOf(",", index) + 1,
                file.indexOf("X", index)
              )
            ) * this.scale
          );
          profile.push(
            parseFloat(
              file.substring(
                file.indexOf("X", index) + 1,
                file.indexOf("*", index)
              )
            ) * this.scale
          );
          // three dimensions
        } else {
          console.log("uhhhh");
          profile.push(
            parseFloat(
              file.substring(
                file.indexOf(",", index) + 1,
                file.indexOf("X", index)
              )
            ) * this.scale
          );
          profile.push(
            parseFloat(
              file.substring(
                file.indexOf("X", index) + 1,
                file.indexOf("X", index)
              )
            ) * this.scale
          );
          profile.push(
            parseFloat(
              file.substring(
                file.indexOf("X", index) + 1,
                file.indexOf("*", index)
              )
            ) * this.scale
          );
        }
        this.apertures[a_id] = profile;
        index = file.indexOf("ADD", index + 1);
      }
    },
    find_aperture_locations(file) {
      this.aperture_locs = [];
      for (var key in this.apertures) {
        var locs = this.get_all_indices(file, "D" + key + "*");
        locs.forEach((i) => this.aperture_locs.push([key, i]));
      }
      this.aperture_locs.sort((a, b) => a[1] - b[1]);
      this.find_macro_endings(file);
    },

    find_macro_endings(file) {
      var end_pos = 0;
      for (var i = 0; i < this.aperture_locs.length; i++) {
        var start_pos = this.aperture_locs[i][1];
        if (i == this.aperture_locs.length - 1) end_pos = file.length;
        else end_pos = this.aperture_locs[i + 1][1];
        this.aperture_locs[i].push(end_pos);
      }
    },

    get_all_indices(str, val) {
      var startIndex = 0,
        index,
        indices = [];
      while ((index = str.indexOf(val, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + 1;
      }
      return indices;
    },
    draw_macros(file, color) {
      this.aperture_locs.forEach((macro) => {
        if (file == this.files["outline"])
          this.polygon_fill(file.substring(macro[1], macro[2]), color);
        else
          this.draw_section(
            file.substring(macro[1], macro[2]),
            macro[0],
            color
          );
      });
    },

    draw_section(g_code, a_id, color) {
      const radius = parseFloat(this.apertures[a_id][1]);
      const shape = this.apertures[a_id][0];
      var g_loc = 0;
      var x_loc = 0;
      // indexOf all coords && draw path
      var path = "";
      g_loc = g_code.indexOf("G");

      // case where no g code is present for first move
      x_loc = g_code.indexOf("X");
      if (x_loc < g_loc || g_loc == -1) {
        g_code = "G01*" + g_code.substring(x_loc);
        g_loc = 0;
      }

      while (g_loc != -1) {
        var code = g_code.substring(g_loc, g_loc + 3);
        var next_code = "";
        if (code == "G36") {
          next_code = g_code.indexOf("G37", g_loc);
          this.polygon_fill(g_code.substring(g_loc, next_code), color);
          g_loc = g_code.indexOf("G", next_code + 1);
        } else {
          next_code = g_code.indexOf("G", g_loc + 1);
          x_loc = g_code.indexOf("X", g_loc + 1);
          while (
            (x_loc < next_code && x_loc != -1) ||
            (next_code == -1 && x_loc != -1)
          ) {
            var y_loc = g_code.indexOf("Y", x_loc);
            if (code == "G01") {
              var x =
                (Math.abs(parseFloat(g_code.substring(x_loc + 1, y_loc))) /
                  this.x_decimals -
                  this.min_x) *
                this.scale;
              var y =
                (Math.abs(
                  parseFloat(
                    g_code.substring(y_loc + 1, g_code.indexOf("D", y_loc))
                  )
                ) /
                  this.y_decimals -
                  this.min_y) *
                this.scale;
              var d_code = g_code.substring(
                g_code.indexOf("D", x_loc),
                g_code.indexOf("D", x_loc) + 3
              );
              if (d_code == "D02" || path == "") {
                path += "M" + x + "," + y;
                if (
                  g_code.indexOf(
                    "D01",
                    y_loc,
                    g_code.indexOf("D02", g_code.indexOf("D", x_loc) + 3)
                  ) != -1 &&
                  shape == "C"
                )
                  this.drawing
                    .circle(radius * 2)
                    .center(x, y)
                    .fill(color);
              } else if (d_code == "D01") path += "L" + x + "," + y;
              if (d_code == "D01" || d_code == "D03") {
                if (shape == "C")
                  this.drawing
                    .circle(radius * 2)
                    .center(x, y)
                    .fill(color);
                else if (shape == "O")
                  this.drawing
                    .ellipse(
                      parseFloat(this.apertures[a_id][1]),
                      parseFloat(this.apertures[a_id][2])
                    )
                    .center(x, y)
                    .fill(color);
                else if (shape == "R") {
                  var width = parseFloat(this.apertures[a_id][1]);
                  var height = parseFloat(this.apertures[a_id][2]);
                  this.drawing
                    .rect(width, height)
                    .move(parseFloat(x) - width / 2, parseFloat(y) - height / 2)
                    .fill(color);
                } else console.log(shape);
              }
            } else if (code == "G02" || code == "G03") {
              var sweep_flag = "1";
              if (code == "G02") sweep_flag = "0";
              path += this.draw_arc(
                g_code.substring(x_loc - 3, g_code.indexOf("*", x_loc)),
                sweep_flag,
                [x, y]
              );
            } else console.log(code);
            x_loc = g_code.indexOf("X", x_loc + 1);
          }
          g_loc = next_code;
        }
      }

      this.drawing
        .path(path)
        .stroke({ color: color, width: radius * 2 })
        .fill("none");
    },

    draw_arc(g_code, sweep_flag, start_pos, multiquadrant_bool = true) {
      var y_loc = g_code.indexOf("Y");
      var i_loc = g_code.indexOf("I");
      var d_loc = g_code.indexOf("D");
      var x =
        (Math.abs(parseFloat(g_code.substring(4, y_loc))) / this.x_decimals -
          this.min_x) *
        this.scale;
      var i = 0;
      var j = 0;

      if (g_code.indexOf("J") != -1) {
        j =
          (parseFloat(g_code.substring(g_code.indexOf("J") + 1, d_loc)) /
            this.y_decimals) *
          this.scale;
        d_loc = g_code.indexOf("J");
      }
      var y;
      if (i_loc != -1) {
        y =
          (Math.abs(parseFloat(g_code.substring(y_loc + 1, i_loc))) /
            this.y_decimals -
            this.min_y) *
          this.scale;
        i =
          (parseFloat(g_code.substring(g_code.indexOf("I") + 1, d_loc)) /
            this.x_decimals) *
          this.scale;
      } else
        y =
          (Math.abs(parseFloat(g_code.substring(y_loc + 1, d_loc))) /
            this.y_decimals -
            this.min_y) *
          this.scale;

      var center = [parseFloat(start_pos[0]) + i, parseFloat(start_pos[1]) + j];

      var start_angle = this.find_angle(start_pos, center);
      var end_angle = this.find_angle([x, y], center);
      var angle;
      if (sweep_flag == "0") angle = start_angle - end_angle;
      else angle = end_angle - start_angle;

      if (!multiquadrant_bool && angle > 0.5) {
        if (sweep_flag == "0") angle = end_angle - start_angle;
        else angle = start_angle - end_angle;
      }
      var large_arc_flag = 0;
      if (angle >= 1) large_arc_flag = 1;

      var radius = Math.sqrt(i ** 2 + j ** 2);

      return (
        "A " +
        radius +
        " " +
        radius +
        " 0 " +
        large_arc_flag +
        " " +
        sweep_flag +
        " " +
        x +
        " " +
        y
      );
    },

    find_angle(pos, center) {
      var y = parseFloat(pos[1]) - parseFloat(center[1]);
      var x = parseFloat(pos[0]) - parseFloat(center[0]);
      var angle = Math.atan2(y, x);
      angle /= Math.PI;
      if (angle < 0) angle += 2;
      return angle;
    },

    polygon_fill(g_code, color) {
      var g_loc = 0;
      var x_loc = 0;
      // indexOf all coords and draw path
      var path = "";

      g_loc = g_code.indexOf("G");
      // case where no g code is present for first move
      x_loc = g_code.indexOf("X");
      if (x_loc < g_loc || g_loc == -1) {
        g_code = "G01*" + g_code.substring(x_loc);
        g_loc = 0;
      }
      while (g_loc != -1) {
        var code = g_code.substring(g_loc, g_loc + 3);
        var next_code = g_code.indexOf("G", g_loc + 1);
        x_loc = g_code.indexOf("X", g_loc + 1);
        while (
          (x_loc < next_code && x_loc != -1) ||
          (next_code == -1 && x_loc != -1)
        ) {
          var y_loc = g_code.indexOf("Y", x_loc);
          if (code == "G01") {
            var x =
              (Math.abs(parseFloat(g_code.substring(x_loc + 1, y_loc))) /
                this.x_decimals -
                this.min_x) *
              this.scale;
            var y =
              (Math.abs(
                parseFloat(
                  g_code.substring(y_loc + 1, g_code.indexOf("D", y_loc))
                )
              ) /
                this.y_decimals -
                this.min_y) *
              this.scale;
            if (
              g_code.substring(
                g_code.indexOf("D", x_loc),
                g_code.indexOf("D", x_loc) + 3
              ) == "D02" ||
              path == ""
            )
              path += "M" + x + "," + y;
            else if (
              g_code.substring(
                g_code.indexOf("D", x_loc),
                g_code.indexOf("D", x_loc) + 3
              ) == "D01"
            );
            path += "L" + x + "," + y;
          } else if (code == "G02" || code == "G03") {
            var sweep_flag = "1";
            if (code == "G02") sweep_flag = "0";
            path += this.draw_arc(
              g_code.substring(x_loc - 3, g_code.indexOf("*", x_loc)),
              sweep_flag,
              [x, y]
            );
          }
          x_loc = g_code.indexOf("X", x_loc + 1);
        }
        g_loc = next_code;
      }
      path += " Z";
      this.drawing.path(path).stroke("none").fill(color);
    },

    drill_holes() {
      var tool_num = 1;
      var leading_zero = true;
      var diameter = 0;
      while (diameter != -1 && tool_num != -1) {
        // get diameter index of current tool
        diameter = this.files["drill"].indexOf("T0" + tool_num + "C");
        if (
          diameter == -1 &&
          this.files["drill"].indexOf("T" + tool_num + "C") == -1
        )
          break;
        else {
          if (diameter == -1) {
            leading_zero = false;
            diameter = this.files["drill"].indexOf("T" + tool_num + "C");
          }
          // draw all holes for current tool
          var curr_holes =
            this.files["drill"].indexOf(
              "T" + (leading_zero ? "0" : "") + tool_num,
              diameter + 4
            ) + 3;
          // get diameter of current tool
          var d_len = 0;
          var increment = leading_zero ? 4 : 3;

          while (
            !isNaN(
              this.files["drill"].substring(
                diameter + increment,
                diameter + increment + d_len
              )
            )
          ) {
            d_len += 1;
          }

          diameter = parseFloat(
            this.files["drill"].substring(
              diameter + increment,
              diameter + increment + d_len
            )
          );

          var next_tool = this.files["drill"].indexOf(
            "T" + (leading_zero ? "0" : "") + (tool_num + 1),
            curr_holes
          );
          var curr_x = this.files["drill"].indexOf("X", curr_holes);
          var curr_y = this.files["drill"].indexOf("Y", curr_x);

          // indexOf and draw circles at hole coords
          while (curr_x < next_tool || (next_tool == -1 && curr_x != -1)) {
            var y_len = 1;
            if (
              this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len) ==
                "+" ||
              this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len) ==
                "-"
            )
              curr_y++;
            while (
              !isNaN(
                this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len)
              )
            )
              y_len += 1;
            var hole_x =
              Math.abs(
                parseFloat(this.files["drill"].substring(curr_x + 1, curr_y)) -
                  this.min_x
              ) /
              (this.files["drill"].substring(curr_x + 1, curr_y).indexOf(".") ==
              -1
                ? this.x_decimals
                : 1);
            var hole_y =
              Math.abs(
                parseFloat(
                  this.files["drill"].substring(curr_y + 1, curr_y + 1 + y_len)
                ) - this.min_y
              ) /
              (this.files["drill"]
                .substring(curr_y + 1, curr_y + 1 + y_len)
                .indexOf(".") == -1
                ? this.y_decimals
                : 1);

            this.drawing
              .circle(diameter * this.scale)
              .center(hole_x * this.scale, hole_y * this.scale)
              .fill("black");
            curr_x = this.files["drill"].indexOf("X", curr_y);
            curr_y = this.files["drill"].indexOf("Y", curr_x);
          }
          tool_num += 1;
        }
      }
    },
  },
  async beforeMount() {
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
    if (this.total > 0) {
      this.sale = 0.5;
    }
    this.colors = sitevars[3]
      .substring(sitevars[3].indexOf(": ") + 3, sitevars[3].length - 1)
      .split(",");
    for (let i = 0; i < this.colors.length; i++) {
      if (this.colors[i][this.colors[i].length - 1] == "-") {
        this.colors[i] = this.colors[i].substring(0, [
          this.colors[i].length - 1,
        ]);
        this.disabled_colors.push(this.colors[i]);
      }
    }
    this.colors.push("Any");

    this.silkOpt = sitevars[4]
      .substring(sitevars[4].indexOf(": ") + 3, sitevars[4].length - 1)
      .split(",");
    console.log(this.silkOpt);
    for (let i = 0; i < this.silkOpt.length; i++) {
      if (this.silkOpt[i][this.silkOpt[i].length - 1] == "-") {
        this.silkOpt[i] = this.silkOpt[i].substring(0, [
          this.silkOpt[i].length - 1,
        ]);
        this.disabled_silk.push(this.silkOpt[i]);
      }
    }
    this.silkOpt.push("None");

    this.fast_time = sitevars[5].substring(
      sitevars[5].indexOf(": ") + 3,
      sitevars[5].length - 1
    );
    pricePerCm = sitevars[6].substring(
      sitevars[6].indexOf(": ") + 3,
      sitevars[6].length - 1
    );
    this.promo_codes = sitevars[7].substring(
      sitevars[7].indexOf(": ") + 3,
      sitevars[7].length - 1
    );
  },
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.container {
  padding-bottom: 10%;
}
</style>
