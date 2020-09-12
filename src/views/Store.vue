<template>
  <v-app>
    <Appbar :key="$cart_key" />
    <v-container fluid v-if="items">
      <v-row>
        <v-col cols="12">
          <v-row style="height: 300px;">
            <v-hover
              v-for="item in items"
              :key="item"
              class="ma-3 pa-0"
              outlined
              tile
              v-slot:default="{ hover }"
            >
              <v-card class="mx-auto" color="tertiary lighten-4" max-width="600">
                <v-img
                  :aspect-ratio="16/9"
                  src="https://cdn.vuetifyjs.com/images/cards/kitchen.png"
                >
                  <v-expand-transition>
                    <div
                      v-if="hover"
                      class="d-flex transition-fast-in-fast-out primary darken-2 v-card--reveal display-3 white--text"
                      style="height: 100%;"
                    >
                      <div class="price">{{item.price.toFixed(2)}}</div>
                    </div>
                  </v-expand-transition>
                </v-img>
                <v-card-text class="pt-6" style="position: relative;">
                  <v-btn
                    absolute
                    class="white--text secondary"
                    fab
                    large
                    right
                    top
                    @click="addToCart(item)"
                  >
                    <v-icon>mdi-cart</v-icon>
                  </v-btn>
                  <h3 class="display-1 font-weight-light secondary--text mb-2">{{item.name}}</h3>
                  <div class="font-weight-light title mb-2">{{item.description}}</div>
                </v-card-text>
              </v-card>
            </v-hover>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <Bottom />
  </v-app>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";
export default {
  data: () => ({
    items: [
      {
        orderNum: "0000000000000000",
        name: '4x6" Perfboard',
        description: "2301 holes for all your prototyping needs",
        price: 6.0,
        quantity: 1,
      },
      {
        orderNum: "0000000000000001",
        name: '1x2" Perfboard',
        description: "171 holes for all your prototyping needs",
        price: 0.7,
        quantity: 1,
      },
    ],
  }),
  methods: {
    addToCart(item) {
      if (this.$cart.length == 0)
        this.$cart.push(
          Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10)
        );
      var found = false;
      var order = {
        name: item.name,
        orderNum: item.orderNum,
        quantity: item.quantity,
        price: item.price,
      };
      for (let i = 1; i < this.$cart.length; i++) {
        if (this.$cart[i].name == item.name) {
          found = true;
          this.$cart[i].quantity += 1;
          break;
        }
      }
      if (!found) {
        this.$cart.push(order);
      }
      this.$cart_key += 1;
      console.log(this.$cart);
      this.$router.push("/");
    },
  },
  components: { Appbar, Bottom },
};
</script>

<style>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.8;
  position: absolute;
  width: 100%;
}
.price {
  opacity: 1;
}
</style>