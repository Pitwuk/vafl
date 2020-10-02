<template>
  <body class="quaternary">
    <Appbar />

    <div align="center">
      <v-icon size="200" color="green"
        >mdi-checkbox-marked-circle-outline</v-icon
      >
      <h1>Order Successfully Placed</h1>
    </div>
    <v-container>
      <h1 class="ordernumber">Order Number: {{ $cart[0] }}</h1>

      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <h2 align="center">Order Summary:</h2>
            <v-divider></v-divider>
            <v-list>
              <v-list-item v-for="item in $cart.slice(1)" :key="item">
                <v-list-item-title v-text="item.name"></v-list-item-title>
                <v-list-item-title
                  v-text="'x ' + item.quantity"
                ></v-list-item-title>
                <v-list-item-title
                  v-text="
                    '$' +
                    (item.name == 'PCB Prototyping Service'
                      ? item.price / item.quantity
                      : item.price
                    ).toFixed(2)
                  "
                ></v-list-item-title>
              </v-list-item>
              <v-list-item v-for="item in $cart.slice(1)" :key="item">
                <v-list-item-title>Shipping:</v-list-item-title>
                <v-list-item-title></v-list-item-title>
                <v-list-item-title
                  v-text="'$' + $shippingPrice.toFixed(2)"
                ></v-list-item-title>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item v-for="item in $cart.slice(1)" :key="item">
                <v-list-item-title>Total:</v-list-item-title>
                <v-list-item-title></v-list-item-title>
                <v-list-item-title
                  v-text="'$' + totalPrice.toFixed(2)"
                ></v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card v-for="item in $cart.slice(1)" :key="item" class="board">
            <h2 align="center">{{ item.name }}:</h2>
            <v-divider></v-divider>
            <v-img
              contain
              :src="$baseUrl + '/files/images/' + item.orderNum + '.png'"
              max-height="200"
            />
            <v-divider></v-divider>
            <p>Quantity: {{ item.quantity }}pcs</p>
            <p>
              Size: {{ item.width.toFixed(2) }} x {{ item.height.toFixed(2) }}mm
            </p>
            <p>Speed: {{ item.speed }}</p>
            <p>Color: {{ item.color }}</p>
            <p>Silkscreen: {{ item.silk }}</p>
            <p>Layers: {{ item.layers }}</p>
            <p v-if="item.request">Custom Request: {{ item.request }}</p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <Bottom />
  </body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";
export default {
  data: () => ({
    totalPrice: 0,
  }),
  beforeMount() {
    for (let i = 1; i < this.$cart.length; i++) {
      this.totalPrice += this.$cart[i].price;
    }
    this.totalPrice += this.$shippingPrice;
  },
  components: { Appbar, Bottom },
};
</script>

<style scoped>
p {
  padding-left: 20px;
}
h1 {
  color: #4caf50;
}
h2 {
  padding: 15px;
}
.ordernumber {
  padding: 20px;
  color: black;
  text-align: center;
}
.board {
  padding: 10px;
}
#total {
  padding-left: 20px;
}
</style>
