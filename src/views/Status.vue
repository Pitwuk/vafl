<template>
  <body v-on:click="updateValues" class="quaternary">
    <Appbar />
    <v-container v-if="!loaded" class="fill-height quaternary" fluid>
      <v-row align="start" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark elevation="0">
              <v-toolbar-title>Status</v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-form v-model="valid">
                <v-text-field
                  v-model="orderNum"
                  label="Order Number"
                  :rules="orderRules"
                  prepend-icon="mdi-numeric"
                />
                <p id="error" v-if="failed">
                  Order does not exist
                  <br />Please contact us at support@vaflpcb.com if you think
                  this is an error
                </p>
              </v-form>
            </v-card-text>

            <v-card-actions class="justify-end pa-4">
              <v-spacer />
              <v-btn text color="primary" @click="checkStatus()">Submit</v-btn>
              <v-btn text to="/">Dismiss</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="loaded" class="fill-height" fluid>
      <v-container>
        <v-row v-for="item in board_arr" :key="item">
          <v-col cols="12" md="6">
            <v-card>
              <v-timeline>
                <v-timeline-item
                  :color="
                    item.stage == 'Delivered' ||
                    item.stage == 'In Transit' ||
                    item.stage == 'Manufacturing' ||
                    item.stage == 'Processing'
                      ? 'green'
                      : 'grey'
                  "
                  >Processing</v-timeline-item
                >
                <v-timeline-item
                  :color="
                    item.stage == 'Delivered' ||
                    item.stage == 'In Transit' ||
                    item.stage == 'Manufacturing'
                      ? 'green'
                      : 'grey'
                  "
                  class="text-right"
                  >Manufacturing</v-timeline-item
                >
                <v-timeline-item
                  :color="
                    item.stage == 'Delivered' || item.stage == 'In Transit'
                      ? 'green'
                      : 'grey'
                  "
                  >In Transit</v-timeline-item
                >
                <v-timeline-item
                  :color="item.stage == 'Delivered' ? 'green' : 'grey'"
                  class="text-right"
                  >Delivered</v-timeline-item
                >
              </v-timeline>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card class="board">
              <h2 align="center">{{ item.name }}:</h2>
              <v-divider></v-divider>
              <img
                :src="$baseUrl + '/orders/images/' + item.orderNum + '.svg'"
              />
              <v-divider></v-divider>
              <p>Quantity: {{ item.quantity }}pcs</p>
              <p>
                Size:
                {{
                  is_imperial
                    ? (item.width / 25.4).toFixed(4)
                    : item.width.toFixed(2)
                }}
                x
                {{
                  is_imperial
                    ? (item.height / 25.4).toFixed(4)
                    : item.height.toFixed(2)
                }}{{ is_imperial ? "in" : "mm" }}
              </p>
              <p>Speed: {{ item.speed }}</p>
              <p>Color: {{ item.color }}</p>
              <p>Silkscreen: {{ item.silk }}</p>
              <p>Layers: {{ item.layers }}</p>
              <p v-if="item.request">Custom Request: {{ item.request }}</p>
              <form
                method="get"
                :action="$baseUrl + '/orders/gerbers/' + item.orderNum + '.zip'"
              >
                <v-btn color="primary" type="submit">Download Files</v-btn>
              </form>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
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
      failed: false,
      valid: false,
      loaded: false,
      board_arr: [],
      orderRules: [
        (value) => !!value || "Required",
        (value) => value.length == 16 || "Must be 16 characters",
      ],
    };
  },
  methods: {
    updateValues() {
      if (this.is_imperial != this.$global.units) {
        this.is_imperial = this.$global.units;
        this.$forceUpdate();
      }
    },
    async checkStatus() {
      this.failed = false;
      try {
        if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
          var res = await axios.get(this.$baseUrl + "/api/get-token/");
          axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
        }
        //form data
        const formData = {
          orderNum: this.orderNum,
        };

        const response = await axios.put(
          this.$baseUrl + "/api/orders/",
          formData
        );

        var orderData = response.data
          .substring(1, response.data.length - 1)
          .split('", "');

        console.log(orderData);

        var boards = orderData[10]
          .substring(11, orderData[10].length - 1)
          .replace(/"/g, "")
          .replace(/'/g, '"')
          .replace(/},/g, "},***")
          .split(",***");
        for (let i = 0; i < boards.length; i++) {
          this.board_arr.push(JSON.parse(boards[i]));
        }
        this.loaded = true;
        console.log(this.board_arr);
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.failed = true;
      }
    },
  },
  beforeMount() {
    var sPageURL = window.location.search.substring(1);
    var index = sPageURL.indexOf("o");
    if (index != -1) {
      this.orderNum = sPageURL.substring(index + 2);
      console.log(this.orderNum);
      this.checkStatus();
    }
  },
  components: { Appbar, Bottom },
};
</script>

<style scoped>
p {
  padding-left: 10px;
}
#total {
  padding-left: 10px;
}
#error {
  color: red;
}
.board {
  padding: 10px;
}
img {
  width: auto;
  height: auto;
}
</style>
