<template >
  <v-app-bar max-height="70" elevation="12" dark color="primary">
    <v-img
      src="../assets/whiteLogo.png"
      contain
      max-height="50"
      @click="home()"
      id="bar"
    />
    <v-toolbar-items>
      <v-menu rounded="b-xl" offset-y :close-on-content-click="false">
        <template v-slot:activator="{ attrs, on }">
          <v-btn v-bind="attrs" v-on="on" icon>
            <v-icon>mdi-cart</v-icon>
          </v-btn>
        </template>

        <v-list :key="$cart_key" max-height="700">
          <v-list-item v-for="item in $cart.slice(1)" :key="item">
            <v-list-item-title v-text="item.name"></v-list-item-title>
            <v-list-item-title
              v-text="
                '$' +
                (item.name == 'PCB Prototyping Service'
                  ? item.price / item.quantity
                  : item.price
                ).toFixed(2)
              "
            ></v-list-item-title>
            <v-list-item-title
              v-text="'x ' + item.quantity"
            ></v-list-item-title>
            <v-btn icon @click="removeItem($cart.indexOf(item))">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-list-item>
          <v-list-item>
            <v-btn class="checkout_button" color="primary" to="/purchase"
              >Checkout</v-btn
            ></v-list-item
          >
        </v-list>
      </v-menu>

      <v-btn icon to="/login">
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
// import Cart from "../components/Cart.vue";

export default {
  data() {
    return {};
  },
  methods: {
    home() {
      this.$router.push("/");
    },
    removeItem(index) {
      this.$cart[index].quantity = 0;
      this.$cart.splice(index, 1);
      this.$cart_key += 1;
    },
  },
  // components: { Cart },
};
</script>

<style scoped>
#bar {
  cursor: pointer;
  margin-top: auto;
  margin-bottom: auto;
  padding-top: 10px;
  padding-bottom: 10px;
}
.checkout_button {
  position: absolute;
  right: 10px;
}
</style>