<template>
<body class="secondary">
  <Appbar />
  <div align="center">
    <v-icon size="200" color="green">mdi-checkbox-marked-circle-outline</v-icon>
    <h1>Order Successfully Placed</h1>
  </div>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="tertiary">
          <h3 align="center">Order Summary:</h3>
          <p>Boards: ${{boardPrice.toFixed(2)}}</p>
          <p>Shipping: ${{shippingPrice}}</p>
          <h4 id="total">Total: ${{(parseFloat(boardPrice)+parseFloat(shippingPrice)).toFixed(2)}}</h4>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="tertiary">
          <h3 align="center">Details:</h3>
          <v-img
            contain
            :src="'http://toasterwaffles.ddns.net/images/'+orderNum+'.png'"
            max-height="500"
          />
          <p>Quantity: {{quantity}}pcs</p>
          <p>Size: {{width}} x {{height}}mm</p>
          <p>Speed: {{speed}}</p>
          <p>Color: {{color}}</p>
          <p>Layers: {{layers}}</p>
          <p v-if="request">Custom Request: {{request}}</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import globals from "../globals.js";
export default {
  data: () => ({
    boardPrice: globals.price,
    shippingPrice: globals.shippingPrice,
    orderNum: globals.orderNum,
    quantity: globals.quantity,
    width: globals.width,
    height: globals.height,
    speed: globals.speed,
    color: globals.color,
    layers: globals.layers,
    request: globals.request
  }),
  components: { Appbar }
};
</script>

<style scoped>
p {
  padding-left: 20px;
}
h1 {
  color: #4caf50;
}
#total {
  padding-left: 20px;
}
</style>
