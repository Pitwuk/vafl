<template >
  <v-app-bar height="60" elevation="12" dark color="primary">
    <v-switch
      v-model="unit_switch"
      :label="`${unit_switch ? 'Imperial' : 'Metric'}`"
      inset
      class="switch"
    ></v-switch>
    <v-img
      src="../assets/whiteLogo.png"
      contain
      max-height="55"
      max-width="200"
      @click="home()"
      id="bar"
    />
    <v-toolbar-items class="toolbar_end">
      <v-menu rounded="b-l" offset-y :close-on-content-click="false">
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
            <v-btn
              class="checkout_button"
              color="primary"
              to="/purchase"
              v-if="$cart.length != 0"
              >Checkout</v-btn
            ></v-list-item
          >
        </v-list>
      </v-menu>
      <p v-if="$login.length != 0" class="name">
        {{ $login[0] }}
      </p>
      <v-menu rounded="b-l" offset-y :close-on-content-click="false">
        <template v-slot:activator="{ attrs, on }">
          <v-btn v-bind="attrs" v-on="on" icon>
            <v-icon>mdi-account</v-icon>
          </v-btn>
        </template>

        <v-list :key="login_key" max-height="700">
          <v-list-item v-if="$login.length == 0" to="/login">
            <v-list-item-title v-text="'Sign in'"></v-list-item-title>
          </v-list-item>
          <v-list-item v-if="$login.length != 0" to="/login">
            <v-list-item-title v-text="'Manage Account'"></v-list-item-title>
          </v-list-item>
          <v-list-item v-if="$login.length != 0" @click="logOut()">
            <v-list-item-title v-text="'Sign out'"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
// import Cart from "../components/Cart.vue";

export default {
  data() {
    return {
      login_key: 0,
      unit_switch: false,
    };
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
    logOut() {
      console.log(this.$login);
      this.$login.length = 0;
      this.login_key++;
      console.log(this.$login);
    },
  },
};
</script>

<style scoped>
#bar {
  cursor: pointer;
  margin: auto;
  padding-top: 10px;
  padding-bottom: 10px;
}
.checkout_button {
  position: absolute;
  right: 10px;
}
.toolbar_end {
  position: absolute;
  right: 10px;
}
.name {
  margin: auto;
  padding: 5px;
}
.switch {
  position: absolute;
  left: 30px;
  top: 15px;
}
</style>