<template>
<body class="accent">
  <Appbar />
  <v-container v-if="!quantity">
    <v-row align="center" justify="center">
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
                <br />Please contact us at vaflpcb@gmail.com if you think this is an error
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
  <v-container v-if="quantity">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-card class="accent">
            <v-timeline>
              <v-timeline-item :color="(stage>=1?'green': 'grey')">Processing</v-timeline-item>
              <v-timeline-item :color="(stage>=2?'green': 'grey')" class="text-right">Manufacturing</v-timeline-item>
              <v-timeline-item :color="(stage>=3?'green': 'grey')">In Transit</v-timeline-item>
              <v-timeline-item :color="(stage>=4?'green': 'grey')" class="text-right">Delivered</v-timeline-item>
            </v-timeline>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="accent">
            <h3 align="center">Order Details:</h3>
            <v-img
              contain
              :src="BASE_URL+'/files/images/'+orderNum+'.png'"
              max-height="500"
            />
            <p>Quantity: {{quantity}}pcs</p>
            <p>Speed: {{speed}}</p>
            <p>Color: {{color}}</p>
            <p>Layers: {{layers}}</p>
            <p v-if="request">Custom Request: {{request}}</p>
            <form
              method="get"
              :action="BASE_URL+'/files/gerbers/'+orderNum+'.zip'"
            >
              <v-btn type="submit">Download Files</v-btn>
            </form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import globals from "../globals.js";
const BASE_URL = 'http://127.0.0.1:8000'

//test order num: a3a7l3rpeljixdm1
export default {
  data: () => ({
    failed: false,
    valid: false,
    stage: 0,
    orderNum: "",
    quantity: 0,
    speed: "",
    color: "",
    layers: 0,
    request: "",
    orderRules: [
      (value) => !!value || "Required",
      (value) => value.length == 16 || "Must be 16 characters",
    ],
  }),
  methods: {
    async checkStatus() {
      this.failed = false;
      try {
        //form data
        const formData = {
          orderNum: this.orderNum,
        };

        //http file post
        const axios = require("axios");

        const response = await axios.put(
          BASE_URL+"/api/orders/",
          formData
        );

        var orderData = response.data
          .substring(1, response.data.length - 1)
          .split('", "');
        console.log(orderData);
        this.quantity = orderData[8];
        this.speed = orderData[9];
        this.color = orderData[10];
        this.layers = orderData[11];
        if (orderData[14] == 'Placed"') this.stage = 1;
        else if (orderData[14] == 'Manufacturing"') this.stage = 2;
        else if (orderData[14] == 'Shipped"') this.stage = 3;
        else if (orderData[14] == 'Delivered"') this.stage = 4;
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.failed = true;
      }
    },
  },
  components: { Appbar },
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
</style>
