<template>
<body class="primary">
  <div align="center">
    <v-icon size="200" color="green">mdi-checkbox-marked-circle-outline</v-icon>
    <h1>Order Successfully Placed</h1>
  </div>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="secondary">
          <h3 align="center">Order Summary:</h3>
          <p>Boards: ${{boardPrice}}</p>
          <p>Shipping: ${{shippingPrice}}</p>
          <h4>Total: ${{parseFloat(boardPrice)+parseFloat(shippingPrice)}}</h4>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="secondary">
          <h3 align="center">Details:</h3>
          <v-img
            contain
            :src="'http://toasterwaffles.ddns.net/images/'+orderNum+'.png'"
            max-height="500"
          />
          <p>Quantity: {{quantity}}pcs</p>
          <p>Size: {{width}} x {{height}}mm</p>
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
import globals from "../globals.js";
export default {
  data: () => ({
    boardPrice: globals.price,
    shippingPrice: globals.price,
    orderNum: globals.orderNum,
    quantity: globals.quantity,
    width: globals.width,
    height: globals.height,
    color: globals.color,
    layers: globals.layers,
    request: globals.request
  })
};
</script>

<style scoped>
p {
  padding: 10px;
}
</style>
