<template>
  <v-main>
    <v-container v-if="!admin" class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark elevation="0">
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-form>
                <v-text-field v-model="login" label="Username" prepend-icon="mdi-account" />
                <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-icon="mdi-lock"
                  type="password"
                />
                <v-alert transition="scale-transition" type="error" :value="!!alert">{{ alert }}</v-alert>
              </v-form>
            </v-card-text>

            <v-card-actions class="justify-end pa-4">
              <v-spacer />
              <v-btn text color="primary" @click="acessar">Login</v-btn>
              <v-btn text to="/">Dismiss</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="admin" class="fill-height" fluid>
      <v-data-table
        dense
        :headers="headers"
        :items="orders"
        item-key="datetime"
        class="elevation-1"
      >
        <template v-slot:item.download="{ item }">
          <form
            method="get"
            :action="'http://toasterwaffles.ddns.net/files/gerbers/'+item.orderNum+'.zip'"
          >
            <v-btn type="submit">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </form>
        </template>
      </v-data-table>
    </v-container>
  </v-main>
</template>

<script>
export default {
  data() {
    return {
      login: "",
      password: "",
      alert: "",
      admin: false,
      headers: [
        {
          text: "DateTime",
          value: "datetime",
        },
        { text: "Speed", value: "speed" },
        { text: "Quantity", value: "quantity" },
        { text: "Color", value: "color" },
        { text: "Request", value: "request" },
        { text: "OrderNum", value: "orderNum" },
        { text: "Downloads", value: "download", sortable: false },
      ],
      orders: [],
    };
  },
  methods: {
    acessar() {
      if (
        this.login === "gregorious" &&
        this.password === process.env.VUE_APP_ADMIN_PASS
      ) {
        this.admin = true;
        this.getOrders();
      } else {
        this.alert = "Username or password is incorrect";
      }
    },
    async getOrders() {
      const axios = require("axios");

      const formData = { password: process.env.VUE_APP_ORDER_PASS };
      console.log(formData);

      const response = await axios.post(
        "http://toasterwaffles.ddns.net/api/admin/",
        formData
      );

      this.responseToDict(response.data);
      console.log(this.orders);
    },
    responseToDict(arr) {
      arr = arr.split("][");
      console.log(arr);
      for (let i = 0; i < arr.length; i++) {
        var temp_arr = arr[i].split(",");
        this.orders.push({
          orderNum: temp_arr[1].substring(2, 18),
          first_name: temp_arr[2],
          last_name: temp_arr[3],
          email: temp_arr[4],
          address: temp_arr[5],
          city: temp_arr[6],
          state: temp_arr[7],
          zipCode: temp_arr[8],
          quantity: temp_arr[9],
          speed: temp_arr[10].replace(/"/g, ""),
          color: temp_arr[11].replace(/"/g, ""),
          layers: temp_arr[12].replace(/"/g, ""),
          request: temp_arr[13].replace(/"/g, ""),
          status: temp_arr[14],
          datetime: temp_arr[15],
        });
      }
    },
  },
};
</script>
