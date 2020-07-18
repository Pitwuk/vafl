<template>
  <v-app>
    <v-app-bar max-height="70" elevate-on-scroll dark color="primary">
      <v-spacer />
      <h1 class="primary">VAFL</h1>
      <v-spacer />
      <v-toolbar-items>
        <v-btn icon to="/cart">
          <v-icon>mdi-cart</v-icon>
        </v-btn>
        <v-btn icon to="/login">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-carousel cycle interval="6000" hide-delimiters>
      <v-carousel-item v-for="(item,i) in items" :key="i" :src="item.src">
        <p class="display-2">{{ slideText[i] }}</p>
        <div class="button">
          <v-btn x-large raised to="/order" height="100" width="300" color="secondary">Order Now</v-btn>
        </div>
      </v-carousel-item>
    </v-carousel>

    <v-spacer />
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          src: require("../assets/c_1.jpg")
        },
        {
          src: require("../assets/c_2.jpg")
        },
        {
          src: require("../assets/c_3.jpg")
        }
      ],
      slideText: [
        "• 24 hour turnaround time\n• Fast shipping",
        "• Made In the USA\n• Professional quality",
        "• $2 / board (size ≤ 50 x 50mm)\n• Free Shipping on orders over $10"
      ]
    };
  }
};
</script>

<style scoped>
.display-2 {
  white-space: pre-wrap;
  position: absolute;
  left: 60px;
  bottom: 30px;
}
.button {
  position: absolute;
  right: 2%;
  bottom: 2%;
}
</style>
