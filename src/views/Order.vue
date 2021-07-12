<template>
  <body v-on:click="updateValues" class="quaternary">
    <!-- <v-overlay opacity=".9" value="1">
      <v-card class="ma-4 pa-3">
        <p class="display-1 closed-text">
          We are currently closed for the holidays. Orders will reopen January
          4th.
        </p>
      </v-card>
    </v-overlay> -->
    <Appbar />
    <v-form v-model="valid">
      <v-container class="order_container">
        <v-row>
          <v-col cols="12" md="8">
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
                  v-if="!drawing"
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
                      v-model="display_width"
                      :rules="widthRules"
                      :label="`${is_imperial ? 'Width (in)' : 'Width (mm)'}`"
                      required
                      :readonly="!!drawing"
                      @change="updatePrice"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="display_height"
                      :rules="heightRules"
                      :label="`${is_imperial ? 'Height (in)' : 'Height (mm)'}`"
                      required
                      :readonly="!!drawing"
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
                    <span v-if="speed == 'Turbo' && hour < 12"
                      >Ships Today</span
                    >
                    <span v-if="speed == 'Turbo' && hour >= 12"
                      >Ships Tomorrow</span
                    >
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
                <span class="subheading">Surface Finish</span>
                <br />
                <v-chip color="secondary">{{ finish }}</v-chip>
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

          <v-col cols="12" md="4">
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
                  :disabled="!drawing || !valid || failed"
                  @click="valid && !failed ? (overlay = true) : null"
                  >Purchase</v-btn
                >
              </v-card-actions>
              <span
                class="body-2"
                style="padding: 5px"
                v-if="total > 0 && $login.length < 5"
                >Sign up for 50% off your order.</span
              >
            </v-card>
          </v-col>
        </v-row>
        <v-overlay
          opacity=".5"
          :value="overlay && create_account_prompt && total > 0"
        >
          <v-card class="ma-3 pa-3">
            <v-btn icon @click="overlay = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-card-title>
              <h2 class="display-1">Create Account</h2>
            </v-card-title>

            <v-card-text
              >Would you like to create an account for 50% off your
              order?</v-card-text
            >

            <v-divider></v-divider>
            <v-card-actions class="justify-center pa-2">
              <v-btn color="primary" @click="accountRedirect()"
                >Create Account</v-btn
              >
              <v-btn color="primary" @click="create_account_prompt = false"
                >Continue as Guest</v-btn
              ></v-card-actions
            >
          </v-card>
        </v-overlay>
        <v-overlay opacity=".5" :value="overlay && !create_account_prompt">
          <v-card class="ma-3 pa-3">
            <v-btn icon @click="overlay = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-card-title>
              <h2 class="display-1">Continue Shopping</h2>
            </v-card-title>

            <v-card-text
              >Would you like to continue shopping or checkout?</v-card-text
            >

            <v-card-text>Free Shipping on orders over $10</v-card-text>

            <v-divider></v-divider>
            <v-card-actions class="justify-center pa-2">
              <v-btn color="primary" @click="storeRedirect()"
                >Continue Shopping</v-btn
              >
              <v-btn color="primary" @click="purchaseRedirect()"
                >Checkout Now</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-overlay>
        <v-overlay
          opacity=".5"
          :value="
            drc_overlay &&
            (drill_diameter_not_tenth_mm ||
              drill_diameter_too_small ||
              trace_width_error)
          "
        >
          <v-card class="ma-3 pa-3">
            <v-btn icon @click="drc_overlay = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-card-title>
              <h2 class="display-1">Design Rule Check Error</h2>
            </v-card-title>

            <v-card-text
              >The following violations were detected in the drc
              check:</v-card-text
            >
            <ul>
              <li v-if="drill_diameter_not_tenth_mm">
                Drill diameter is not an even 0.1mm.
                <ul>
                  <li>All holes will be drilled to the nearest 0.1mm.</li>
                </ul>
              </li>
              <li v-if="drill_diameter_too_small">
                Drill diameter smaller than 0.3mm.
                <ul>
                  <li>
                    Our minimum drill diameter is 0.3mm. Any holes below that
                    size will be drilled to 0.3mm.
                  </li>
                </ul>
              </li>
              <li v-if="trace_width_error">
                Trace width below our minimum.
                <ul>
                  <li>
                    We do not guaranteee success for traces below 0.127mm.
                  </li>
                </ul>
              </li>
            </ul>

            <v-divider></v-divider>
            <v-card-actions class="justify-center pa-2">
              <v-btn color="primary" @click="drc_overlay = false"
                >Acknowlege</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-overlay>
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
const fs = require("fs");

var pricePerCm = 0.1;

export default {
  data() {
    return {
      is_imperial: this.$global.units,
      display_width: "0",
      display_height: "0",
      valid: false,
      overlay: false,
      drc_overlay: true,
      create_account_prompt: false,
      loading: false,
      failed: false,
      hour: 0,
      fast_enabled: true,
      turbo_enabled: true,
      price: 0,
      salePrice: 0,
      sale: 1,
      total: -1,
      num_orders: -1,
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
      speeds: ["Economy"],
      fast_multiplier: -1,
      turbo_multiplier: -1,
      colors: ["White", "Blue", "Red", "Any"],
      disabled_colors: [],
      silkOpt: ["White", "Black", "None"],
      disabled_silk: [],
      fast_time: "",
      drawing: false,
      finish: "Immersion Tin",
      drill_diameter_not_tenth_mm: false,
      drill_diameter_too_small: false,
      trace_width_error: false,
    };
  },
  methods: {
    updateValues() {
      if (this.is_imperial != this.$global.units) {
        this.is_imperial = this.$global.units;
        if (this.is_imperial) {
          this.display_width = (parseFloat(this.display_width) / 25.4).toFixed(
            6
          );
          this.display_height = (
            parseFloat(this.display_height) / 25.4
          ).toFixed(6);
        } else {
          this.display_width = (parseFloat(this.display_width) * 25.4).toFixed(
            4
          );
          this.display_height = (
            parseFloat(this.display_height) * 25.4
          ).toFixed(4);
        }
      }
    },
    updatePrice() {
      if (this.display_width != "0" && this.display_height != "0") {
        //swaps size
        if (parseFloat(this.display_width) > parseFloat(this.display_height)) {
          var temp = this.display_width;
          this.display_width = this.display_height;
          this.display_height = temp;
        }
        if (this.is_imperial) {
          this.order.width = parseFloat(this.display_width) * 25.4;
          this.order.height = parseFloat(this.display_height) * 25.4;
        } else {
          this.order.width = parseFloat(this.display_width);
          this.order.height = parseFloat(this.display_height);
        }
      }

      if (this.order.width > 0 && this.order.height > 0) {
        console.log(this.order.width);
        if (this.order.width > 50 || this.order.height > 50) {
          this.price =
            parseInt(this.order.quantity) *
            parseFloat(this.order.width / 10) *
            parseFloat(this.order.height / 10) *
            pricePerCm;
        } else if (
          parseFloat(this.order.width / 10) *
            parseFloat(this.order.height / 10) *
            pricePerCm <
          2.0
        ) {
          this.price =
            2.0 +
            (parseInt(this.order.quantity) - 1) *
              parseFloat(this.order.width / 10) *
              parseFloat(this.order.height / 10) *
              pricePerCm;
        } else {
          this.price = 2.0 * parseInt(this.order.quantity);
        }
        if (this.order.speed == "Fast") this.price *= this.fast_multiplier;
        else if (this.order.speed == "Turbo")
          this.price *= this.turbo_multiplier;
        if (this.order.color != "Any") {
          if (this.order.speed == "Economy") this.price += 2;
          else if (this.order.speed == "Fast") this.price += 4;
        }
        if (this.sale != 1 && this.num_orders == 0) {
          this.salePrice = this.price * this.sale;
          this.order.price = this.salePrice;
        } else this.order.price = this.price;
      }
    },
    onPickFile() {
      this.$refs.fileInput.click();
    },
    async onFilePicked(e) {
      this.loading = true;
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

        const img_response = await axios.post(
          this.$baseUrl + "/api/upload_image/",
          { orderNum: this.order.orderNum, img: svg_file.svg() },
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
    accountRedirect() {
      if (!this.failed && this.width) {
        this.addToCart();
        // this.$router.push("/store");
        this.$router.push("/login");
      }
    },
    addToCart() {
      if (this.$cart.length == 0)
        this.$cart.push(
          Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10)
        );
      this.$cart.push(this.order);
    },

    //gerber-renderer
    render() {
      this.drc = true;

      if (this.drc) {
        // setup drc error bools
        this.drill_diameter_not_tenth_mm = false;
        this.drill_diameter_too_small = false;
        this.annular_ring_error = false; //TODO
        this.pad_to_pad_clearance_error = false; //TODO
        this.trace_clearance_error = false; //TODO
        this.trace_width_error = false;
        // setup capabilities
        this.min_trace_width = 0.127;
        this.min_trace_clearance = 0.127;
        this.min_annular_ring = 0.13;
        this.min_pad_to_pad = 0.2;
        this.min_drill_diameter = 0.3;
        // setup drc arrays
        this.traces = [];
        this.pads = [];
        this.drc_scale = 1;
      }

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
      // print drc results
      if (this.drc) {
        console.log("\nDesign Rules Check Results:");
        console.log(
          "Drill diameter not tenth of mm:" + this.drill_diameter_not_tenth_mm
        );
        console.log(
          "Drill diameter below minimum:" + this.drill_diameter_too_small
        );
        // console.log("Annular ring too small:" + this.annular_ring_error);
        // console.log(
        //   "Pad to pad clearance too small:" + this.pad_to_pad_clearance_error
        // );
        // console.log(
        //   "Trace to trace clearance too small:" + this.trace_clearance_error
        // );
        console.log("Trace width too small:" + this.trace_width_error);
      }
    },

    draw_svg(layer, filename) {
      this.copper_bool = false;
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

      // if (this.verbose) console.log("Milling Outline");
      // this.init_file(this.files["outline"]);
      // this.draw_macros(this.files["outline"], "green");
      this.copper_bool = true;
      if (this.verbose) console.log("Etching Copper");
      this.init_file(layer + "_copper");
      this.clear_color = "#C22F20";
      this.draw_macros(this.files[layer + "_copper"], "#f23913");
      this.copper_bool = false;

      if (this.files[layer + "_silk"] && this.silk_bool) {
        if (this.verbose) console.log("Curing Silk Screen");
        this.init_file(layer + "_silk");
        this.draw_macros(this.files[layer + "_silk"], "white");
      }

      if (this.verbose) console.log("Applying Solder Mask");
      this.init_file(layer + "_mask");
      this.draw_macros(this.files[layer + "_mask"], "#AFA9A5");

      // draw drill holes
      if (this.verbose) console.log("Drilling Holes");
      this.drill_holes();

      // save svg
      // fs.writeFileSync(this.output_folder + filename, this.drawing.svg());
    },

    draw_macros(file, color) {
      this.last_x = -1;
      this.last_y = -1;
      if (
        this.aperture_locs.length > 0 &&
        file.indexOf("X") < this.aperture_locs[0][1] &&
        file.indexOf("X") != -1
      ) {
        this.draw_section(
          file.substring(0, this.aperture_locs[0][1]),
          false,
          color
        );
      }
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
      var radius, shape;
      if (a_id) {
        radius = parseFloat(this.apertures[a_id][1]);
        shape = this.apertures[a_id][0];
      }
      var g_loc = 0;
      var x_loc = 0;
      x = this.last_x;
      y = this.last_y;
      this.fill_polarity = 1; //dark
      // indexOf all coords && draw path
      var path = "";
      g_loc = g_code.indexOf("G");

      //get fill polarity
      if (g_code.indexOf("LPC*%") < g_loc && g_code.indexOf("LPC*%") != -1)
        this.fill_polarity = 0;

      // case where no g code is present for first move
      x_loc = g_code.indexOf("X");
      if (x_loc < g_loc || g_loc == -1) {
        g_code = "G01*" + g_code.substring(x_loc);
        g_loc = 0;
      }

      while (g_loc != -1) {
        var code = g_code.substring(g_loc, g_loc + 3);
        var next_code = g_code.indexOf("G", g_loc + 1);
        if (code == "G37") code = "G01";
        if (code == "G36") {
          next_code = g_code.indexOf("G37", g_loc);
          this.polygon_fill(g_code.substring(g_loc, next_code), color);
          g_loc = next_code;
        } else {
          x_loc = g_code.indexOf("X", g_loc + 1);
          while (
            (x_loc < next_code && x_loc != -1) ||
            (next_code == -1 && x_loc != -1)
          ) {
            var y_loc = g_code.indexOf("Y", x_loc);
            if (code == "G01") {
              var d_code = g_code.substring(
                g_code.indexOf("D", x_loc),
                g_code.indexOf("D", x_loc) + 3
              );
              if (d_code == "D01" && path == "" && x != -1)
                path += "M" + x + "," + y;
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
              } else if (d_code == "D01") {
                path += "L" + x + "," + y;
                if (this.drc && this.copper_bool && this.last_x != -1) {
                  this.drc_check(
                    "trace",
                    radius,
                    [this.last_x, this.last_y],
                    [x, y]
                  );
                }
              }
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
                }
                // else console.log(shape);
              }
            } else if (code == "G02" || code == "G03") {
              var sweep_flag = "1";
              if (code == "G02") sweep_flag = "0";
              path += this.draw_arc(
                g_code.substring(x_loc - 3, g_code.indexOf("*", x_loc)),
                sweep_flag,
                [x, y]
              );
            }
            // else console.log(code);
            x_loc = g_code.indexOf("X", x_loc + 1);
          }

          if (
            g_code.indexOf("LPC*%", g_loc) < next_code &&
            g_code.indexOf("LPC*%", g_loc) != -1
          )
            this.fill_polarity = 0;
          if (
            g_code.indexOf("LPD*%", g_loc) < next_code &&
            g_code.indexOf("LPD*%", g_loc) > g_code.indexOf("LPC*%", g_loc) &&
            g_code.indexOf("LPD*%", g_loc) != -1
          )
            this.fill_polarity = 1;
          g_loc = next_code;
        }
      }
      this.last_x = x;
      this.last_y = y;

      if (path)
        this.drawing
          .path(path)
          .stroke({ color: color, width: radius * 2 })
          .fill("none");
    },
    drc_check(p_type, radius, start_pos, end_pos) {
      radius /= this.scale / this.drc_scale;
      // start_pos[0] = float(start_pos[0]) / self.scale/self.drc_scale
      // start_pos[1] = float(start_pos[1]) / self.scale/self.drc_scale
      // end_pos[0] = float(end_pos[0]) / self.scale/self.drc_scale
      // end_pos[1] = float(end_pos[1]) / self.scale/self.drc_scale
      if (p_type == "trace") {
        // width check
        if (radius * 2 < this.min_trace_width) this.trace_width_error = true;
      }
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
      var y =
        (Math.abs(parseFloat(g_code.substring(y_loc + 1, d_loc))) /
          this.y_decimals -
          this.min_y) *
        this.scale;
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
      }

      var center = [parseFloat(start_pos[0]) + i, parseFloat(start_pos[1]) + j];

      var start_angle = this.find_angle(start_pos, center);
      var end_angle = this.find_angle([x, y], center);
      var angle = end_angle - start_angle;
      if (sweep_flag == "0") angle = start_angle - end_angle;

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
        if (code == "G36") code = "G01";
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
      if (this.fill_polarity == 1)
        this.drawing.path(path).stroke("none").fill(color);
      else this.drawing.path(path).stroke("none").fill(this.clear_color);
    },

    drill_holes() {
      this.get_drill_decimals();
      this.get_drill_tools();
      var file = this.files["drill"].substring(this.drill_header_end);
      this.get_drill_locs(file);

      this.drill_tools.forEach((tool) => {
        var diameter = tool["diameter"];

        // draw all holes for current tool
        var section = file.substring(tool["start"], tool["end"]);

        var curr_x = section.indexOf("X");
        var curr_y = section.indexOf("Y", curr_x);

        // indexOf and draw circles at hole coords
        while (curr_x != -1) {
          var y_len = 1;
          if (
            section.substring(curr_y + 1, curr_y + 1 + y_len) == "+" ||
            section.substring(curr_y + 1, curr_y + 1 + y_len) == "-"
          )
            curr_y++;
          while (
            !isNaN(section.substring(curr_y + 1, curr_y + 1 + y_len)) &&
            y_len < 12
          ) {
            y_len += 1;
          }
          var hole_x =
            Math.abs(parseFloat(section.substring(curr_x + 1, curr_y))) /
            (section.substring(curr_x + 1, curr_y).indexOf(".") == -1
              ? this.drill_decimals
              : 1);
          var hole_y =
            Math.abs(
              parseFloat(section.substring(curr_y + 1, curr_y + 1 + y_len))
            ) /
            (section.substring(curr_y + 1, curr_y + 1 + y_len).indexOf(".") ==
            -1
              ? this.drill_decimals
              : 1);
          this.drawing
            .circle(diameter * this.drill_scale)
            .center(
              hole_x * this.drill_scale - this.min_x * this.scale,
              hole_y * this.drill_scale - this.min_y * this.scale
            )
            .fill("black");
          curr_x = section.indexOf("X", curr_y);
          curr_y = section.indexOf("Y", curr_x);
        }
      });
    },

    get_drill_decimals() {
      var file = this.files["drill"];
      this.drill_scale = this.scale;
      var index = file.indexOf("METRIC");
      if (index != -1) {
        var initial = file.indexOf(".", index) + 1;
        var i = initial;
        if (i < file.indexOf("T", index) && i < file.indexOf(";", index)) {
          while (file[i] == "0") i++;
          this.drill_decimals = Math.pow(10, i - initial);
        } else {
          this.drill_decimals = 1000;
        }
        if (this.unit == "in") this.drill_scale = this.scale / 25.4;
      } else if (file.indexOf("INCH") != -1) {
        index = file.indexOf("INCH");
        initial = file.indexOf(".", index) + 1;
        i = initial;
        if (i < file.indexOf("T", index) && i < file.indexOf(";", index)) {
          while (file[i] == "0") i++;
          this.drill_decimals = Math.pow(10, i - initial);
        } else {
          this.drill_decimals = 10000;
        }
        if (this.unit == "mm") this.drill_scale = this.scale * 25.4;
      } else this.drill_decimals = 1000;
    },

    get_drill_tools() {
      var metric_drill_bool = true;
      this.drill_tools = [];
      var file = this.files["drill"];
      var tool_start = file.indexOf("METRIC") + 7;
      if (tool_start == 6) {
        tool_start = file.indexOf("INCH") + 5;
        metric_drill_bool = false;
      }
      this.drill_header_end = file.indexOf("%", tool_start);
      file = file.substring(tool_start, this.drill_header_end);
      file = this.remove_comments(file);

      var index = -2;
      var next_index = -2;
      while (next_index != file.length) {
        var curr_tool = {};

        if (next_index != -2) index = next_index;
        else {
          index = file.indexOf("T", index + 2);
          if (file.charAt(index + 1) == "Z")
            index = file.indexOf("T", index + 2);
        }

        if (index == -1) break;

        //set tool id and next tool id
        var c_index = file.indexOf("C", index);
        curr_tool["name"] = file.substring(index, c_index);

        next_index = file.indexOf("T", c_index);
        if (next_index == -1) {
          next_index = file.length;
          curr_tool["next"] = "";
        } else {
          curr_tool["next"] = file.substring(
            next_index,
            file.indexOf("C", next_index)
          );
        }

        //get diameter
        curr_tool["diameter"] = file.substring(c_index + 1, next_index);

        //drc checks
        var diam = curr_tool["diameter"];
        if (this.drc && !this.drill_diameter_not_tenth_mm) {
          if (!metric_drill_bool) diam *= 25.4;
          if (Math.floor(diam * 10) != diam * 10)
            this.drill_diameter_not_tenth_mm = true;
        }

        if (this.drc && !this.drill_diameter_too_small) {
          diam = curr_tool["diameter"];
          if (!metric_drill_bool) diam *= 25.4;
          if (diam < this.min_drill_diameter)
            this.drill_diameter_too_small = true;
        }

        this.drill_tools.push(curr_tool);
      }
    },
    get_drill_locs(file) {
      this.drill_tools.forEach((tool) => {
        tool["start"] = file.indexOf(tool["name"]);
        tool["end"] = file.indexOf("T", tool["start"] + 1);
        if (tool["end"] == -1) tool["end"] = file.indexOf("M", tool["start"]);
      });
    },

    remove_comments(file) {
      var start_index = file.indexOf(";");

      while (start_index != -1) {
        var end_index = file.indexOf("\n", start_index);
        if (
          file.indexOf("\r", start_index) < end_index &&
          file.indexOf("\r", start_index) != -1
        )
          end_index = file.indexOf("\r", start_index);
        if (end_index == -1) end_index = file.length;
        file = file.substring(0, start_index) + file.substring(end_index);
        start_index = file.indexOf(";");
      }
      return file.split("\n").join("").split("\r").join("");
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
      if (this.is_imperial) {
        this.display_width = this.order.width / 25.4;
        this.display_height = this.order.height / 25.4;
      } else {
        this.display_width = this.order.width;
        this.display_height = this.order.height;
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

    store_apertures(filename) {
      var file = this.files[filename];
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
      this.files[filename] = file.substring(
        file.indexOf("%", file.indexOf("ADD" + a_id)) + 1
      );
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

    set_decimal_places(file) {
      var index = file.indexOf("FSLAX");
      this.x_decimals = file.substring(index + 6, index + 7);
      this.y_decimals = file.substring(index + 9, index + 10);
      this.x_decimals = Math.pow(10, this.x_decimals);
      this.y_decimals = Math.pow(10, this.y_decimals);
    },

    init_file(filename) {
      this.set_decimal_places(this.files[filename]);
      this.store_apertures(filename);
      this.find_aperture_locations(this.files[filename]);
    },
  },
  async beforeMount() {
    if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
      var res = await axios.get(this.$baseUrl + "/api/get-token/");
      axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
    }

    const formData = { password: process.env.VUE_APP_ORDER_PASS };

    const response = await axios.get(
      this.$baseUrl + "/api/sitevars/",
      formData
    );
    const sitevars = response.data
      .substring(1, response.data.length - 1)
      .split(', "');
    this.sale_end = sitevars[4].substring(
      sitevars[4].indexOf(": ") + 3,
      sitevars[4].length - 1
    );
    this.currtime = new Date();
    this.total = Date.parse(this.sale_end) - Date.parse(this.currtime);
    if (this.total > 0) {
      this.sale = 0.5;
      this.create_account_prompt = true;
    }
    this.colors = sitevars[1]
      .substring(sitevars[1].indexOf(": ") + 3, sitevars[1].length - 1)
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

    this.silkOpt = sitevars[8]
      .substring(sitevars[8].indexOf(": ") + 3, sitevars[8].length - 1)
      .split(",");
    for (let i = 0; i < this.silkOpt.length; i++) {
      if (this.silkOpt[i][this.silkOpt[i].length - 1] == "-") {
        this.silkOpt[i] = this.silkOpt[i].substring(0, [
          this.silkOpt[i].length - 1,
        ]);
        this.disabled_silk.push(this.silkOpt[i]);
      }
    }
    this.silkOpt.push("None");

    this.fast_time = sitevars[3].substring(
      sitevars[3].indexOf(": ") + 3,
      sitevars[3].length - 1
    );
    pricePerCm = sitevars[6].substring(
      sitevars[6].indexOf(": ") + 3,
      sitevars[6].length - 1
    );
    this.promo_codes = sitevars[7].substring(
      sitevars[7].indexOf(": ") + 3,
      sitevars[7].length - 1
    );
    this.fast_multiplier = parseFloat(
      sitevars[2].substring(
        sitevars[2].indexOf(": ") + 3,
        sitevars[2].length - 1
      )
    );
    this.turbo_multiplier = parseFloat(
      sitevars[10].substring(
        sitevars[10].indexOf(": ") + 3,
        sitevars[10].length - 1
      )
    );
    if (this.fast_multiplier != -1) this.speeds.push("Fast");
    if (this.turbo_multiplier != -1) this.speeds.push("Turbo");

    if (this.$login.length > 8) {
      this.num_orders = this.$login[8];
      this.create_account_prompt = false;
    } else {
      this.num_orders = -1;
    }

    // get time
    var date = new Date();
    this.hour = date.getHours() + date.getTimezoneOffset() / 60 - 5;
  },
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.order_container {
  padding-bottom: 10%;
}
.closed-text {
  color: white;
  padding: 20px;
  padding-bottom: 10px;
}
</style>
