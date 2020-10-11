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
                <v-text-field
                  v-model="login"
                  label="Username"
                  prepend-icon="mdi-account"
                />
                <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-icon="mdi-lock"
                  type="password"
                />
                <v-alert
                  transition="scale-transition"
                  type="error"
                  :value="!!alert"
                  >{{ alert }}</v-alert
                >
              </v-form>
            </v-card-text>

            <v-card-actions class="justify-end pa-4">
              <v-spacer />
              <v-btn text color="primary" @click="access">Login</v-btn>
              <v-btn text to="/">Dismiss</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="admin" fluid>
      <h1>Processing</h1>
      <v-data-table
        dense
        v-model="p_selected"
        show-select
        single-select
        :headers="p_headers"
        :items="orders"
        item-key="orderNum"
        search="Processing"
        class="elevation-1"
      >
        <template v-slot:item.download="{ item }">
          <form
            method="get"
            :action="$baseUrl + '/orders/gerbers/' + item.orderNum + '.zip'"
          >
            <v-btn type="submit">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </form>
        </template>
      </v-data-table>
      <v-btn @click="advanceStage(p_selected[0], 'Manufacturing')"
        >Advance</v-btn
      >
    </v-container>
    <v-container v-if="admin" fluid>
      <h1>Manufacturing</h1>
      <v-data-table
        dense
        v-model="m_selected"
        show-select
        single-select
        :headers="m_headers"
        :items="orders"
        search="Manufacturing"
        item-key="orderNum"
        class="elevation-1"
      >
        <template v-slot:item.download="{ item }">
          <form
            method="get"
            :action="$baseUrl + '/orders/gerbers/' + item.orderNum + '.zip'"
          >
            <v-btn type="submit">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </form>
        </template>
      </v-data-table>
      <v-btn @click="advanceStage(m_selected[0], 'Processing')">Back</v-btn>
      <v-btn @click="advanceStage(m_selected[0], 'In Transit')">Advance</v-btn>
    </v-container>
    <v-container v-if="admin" fluid>
      <h1>In Transit</h1>
      <v-data-table
        dense
        v-model="t_selected"
        show-select
        single-select
        :headers="t_headers"
        :items="orders"
        item-key="orderNum"
        search="In Transit"
        class="elevation-1"
      >
        <template v-slot:item.download="{ item }">
          <form
            method="get"
            :action="$baseUrl + '/orders/gerbers/' + item.orderNum + '.zip'"
          >
            <v-btn type="submit">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </form>
        </template>
      </v-data-table>
      <v-btn @click="advanceStage(t_selected[0], 'Manufacturing')">Back</v-btn>
      <v-btn @click="advanceStage(t_selected[0], 'Delivered')">Advance</v-btn>
    </v-container>
    <v-container v-if="admin" fluid>
      <h1>Delivered</h1>
      <v-data-table
        dense
        v-model="d_selected"
        show-select
        single-select
        :headers="d_headers"
        :items="orders"
        item-key="orderNum"
        search="Delivered"
        class="elevation-1"
      >
        <template v-slot:item.download="{ item }">
          <form
            method="get"
            :action="$baseUrl + '/orders/gerbers/' + item.orderNum + '.zip'"
          >
            <v-btn type="submit">
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </form>
        </template>
      </v-data-table>
      <v-btn @click="advanceStage(d_selected[0], 'In Transit')">Back</v-btn>
      <v-btn @click="advanceStage(d_selected[0], 'DELETE')">Delete Order</v-btn>
      <v-btn @click="advanceStage('CLEAR', 'CLEAR')">Clear Database</v-btn>
      <input type="hidden" name="csrftoken" value="{%csrf_token%}" />
      <v-form>
        <v-container>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="first_time_sale"
                :rules="sitevarRules"
                :counter="8"
                label="First Time User Sale"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="colors"
                :rules="sitevarRules"
                :counter="64"
                label="Soldermask Colors"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="silk_colors"
                :rules="sitevarRules"
                label="Silk Colors"
                :counter="32"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="fast_time"
                :rules="sitevarRules"
                label="Fast Time"
                :counter="16"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="price_per_sqcm"
                :rules="sitevarRules"
                label="Price/sqcm"
                :counter="5"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="promo_codes"
                :rules="sitevarRules"
                label="Promo Codes"
                :counter="256"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <v-btn @click="updateSiteVars()">Update Site Vars</v-btn>
      <v-btn @click="initSiteVars()">Initialize Site Vars</v-btn>
    </v-container>
  </v-main>
</template>


<script>
const axios = require("axios");

export default {
  data() {
    return {
      login: "",
      password: "",
      alert: "",
      admin: false,
      p_selected: [],
      m_selected: [],
      t_selected: [],
      d_selected: [],
      p_headers: [
        {
          text: "DateTime",
          value: "datetime",
        },
        { text: "Speed", value: "speed" },
        { text: "Quantity", value: "quantity" },
        { text: "Color", value: "color" },
        { text: "Request", value: "request" },
        { text: "OrderNum", value: "orderNum" },
        { text: "Stage", value: "stage", sortable: false },
        { text: "Downloads", value: "download", sortable: false },
      ],
      m_headers: [
        {
          text: "DateTime",
          value: "datetime",
        },
        { text: "Speed", value: "speed" },
        { text: "OrderNum", value: "orderNum" },
        { text: "Shipping", value: "shipping", sortable: false },
        { text: "Name", value: "name", sortable: false },
        { text: "E-Mail", value: "email", sortable: false },
        { text: "Address", value: "address", sortable: false },
        { text: "City", value: "city", sortable: false },
        { text: "State", value: "state", sortable: false },
        { text: "Zip Code", value: "zip", sortable: false },
        { text: "Stage", value: "stage", sortable: false },
      ],
      t_headers: [
        {
          text: "DateTime",
          value: "datetime",
        },
        { text: "Speed", value: "speed" },
        { text: "OrderNum", value: "orderNum" },
        { text: "Stage", value: "stage", sortable: false },
        { text: "Shipping", value: "shipping", sortable: false },
      ],
      d_headers: [
        {
          text: "DateTime",
          value: "datetime",
        },
        { text: "ParentOrderNum", value: "parentOrderNum" },
        { text: "OrderNum", value: "orderNum" },
        { text: "Stage", value: "stage", sortable: false },
      ],
      orders: [],
      first_time_sale: "",
      colors: "",
      silk_colors: "",
      fast_time: "",
      price_per_sqcm: "",
      promo_codes: "",
      sitevarRules: [(v) => !!v || "required"],
    };
  },
  methods: {
    access() {
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
      var res = await axios.get(this.$baseUrl + "/api/get-token/");
      var response = await axios.post(
        this.$baseUrl + "/api/admin/",
        { password: process.env.VUE_APP_ORDER_PASS },
        {headers:{'X-CSRFTOKEN': res.data.token}}
      );
      this.orders = [];
      this.responseToDict(response.data);
      this.getSiteVars();
    },
    responseToDict(data) {
      var order_arr = data.split('{"id"');
      for (let i = 1; i < order_arr.length; i++) {
        var orderData = order_arr[i]
          .substring(1, order_arr[i].length - 1)
          .split(', "');

        var boards = [];
        var date = orderData[2].replace(/"/g, "");
        boards.push(date.substring(date.indexOf(": ") + 2));
        boards.push(
          orderData[10]
            .substring(11, orderData[10].length - 2)
            .replace(/"/g, "")
            .replace(/'/g, '"')
            .replace(/},/g, "},***")
            .split(",***")
        );
        var parent = orderData[1].replace(/"/g, "");
        boards.push(parent.substring(parent.indexOf(": ") + 2));
        var shipping = orderData[11].replace(/"/g, "");
        boards.push(shipping.substring(shipping.indexOf(": ") + 2));
        var first = orderData[3].replace(/"/g, "");
        var last = orderData[4].replace(/"/g, "");
        boards.push(
          first.substring(first.indexOf(": ") + 2) +
            " " +
            last.substring(last.indexOf(": ") + 2)
        );
        var email = orderData[5].replace(/"/g, "");
        boards.push(email.substring(email.indexOf(": ") + 2));
        var address = orderData[6].replace(/"/g, "");
        boards.push(address.substring(address.indexOf(": ") + 2));
        var city = orderData[7].replace(/"/g, "");
        boards.push(city.substring(city.indexOf(": ") + 2));
        var state = orderData[8].replace(/"/g, "");
        boards.push(state.substring(state.indexOf(": ") + 2));
        var zip = orderData[9].replace(/"/g, "");
        boards.push(zip.substring(zip.indexOf(": ") + 2));

        for (let j = 0; j < boards[1].length; j++) {
          this.orders.push(JSON.parse(boards[1][j]));
          this.orders[this.orders.length - 1]["datetime"] = boards[0];
          this.orders[this.orders.length - 1]["parentOrderNum"] = boards[2];
          this.orders[this.orders.length - 1]["shipping"] = boards[3];
          this.orders[this.orders.length - 1]["name"] = boards[4];
          this.orders[this.orders.length - 1]["email"] = boards[5];
          this.orders[this.orders.length - 1]["address"] = boards[6];
          this.orders[this.orders.length - 1]["city"] = boards[7];
          this.orders[this.orders.length - 1]["state"] = boards[8];
          this.orders[this.orders.length - 1]["zip"] = boards[9];
        }
      }
    },
    async advanceStage(selected, new_stage) {
      if (new_stage == "CLEAR") {
        const formData = {
          password: process.env.VUE_APP_ORDER_PASS,
          operation: "clr",
        };

        const response = await axios.put(
          this.$baseUrl + "/api/admin/",
          formData
        );
      } else if (new_stage == "DELETE") {
        const formData = {
          password: process.env.VUE_APP_ORDER_PASS,
          operation: "del",
          parentNum: selected.parentOrderNum,
        };

        const response = await axios.put(
          this.$baseUrl + "/api/admin/",
          formData
        );
      } else {
        const formData = {
          password: process.env.VUE_APP_ORDER_PASS,
          operation: "adv",
          parentNum: selected.parentOrderNum,
          orderNum: selected.orderNum,
          stage: new_stage,
        };

        const response = await axios.put(
          this.$baseUrl + "/api/admin/",
          formData
        );
      }
      this.getOrders();
    },
    async getSiteVars() {
      const formData = { password: process.env.VUE_APP_ORDER_PASS };

      const response = await axios.get(
        this.$baseUrl + "/api/sitevars/",
        formData
      );
      const sitevars = response.data
        .substring(1, response.data.length - 1)
        .split(', "');
      this.first_time_sale = sitevars[2].substring(
        sitevars[2].indexOf(": ") + 3,
        sitevars[2].length - 1
      );
      this.colors = sitevars[3].substring(
        sitevars[3].indexOf(": ") + 3,
        sitevars[3].length - 1
      );
      this.silk_colors = sitevars[4].substring(
        sitevars[4].indexOf(": ") + 3,
        sitevars[4].length - 1
      );
      this.fast_time = sitevars[5].substring(
        sitevars[5].indexOf(": ") + 3,
        sitevars[5].length - 1
      );
      this.price_per_sqcm = sitevars[6].substring(
        sitevars[6].indexOf(": ") + 3,
        sitevars[6].length - 1
      );
      this.promo_codes = sitevars[7].substring(
        sitevars[7].indexOf(": ") + 3,
        sitevars[7].length - 1
      );
    },
    async updateSiteVars() {
      const formData = {
        password: process.env.VUE_APP_ORDER_PASS,
        first_time_user_sale: this.first_time_sale,
        colors: this.colors,
        silk_colors: this.silk_colors,
        fast_time: this.fast_time,
        price_per_sqcm: this.price_per_sqcm,
        promo_codes: this.promo_codes,
      };

      const response = await axios.post(
        this.$baseUrl + "/api/sitevars/",
        formData
      );
      this.getSiteVars;
    },
    async initSiteVars() {
      const formData = { password: process.env.VUE_APP_ORDER_PASS };

      const response = await axios.put(
        this.$baseUrl + "/api/sitevars/",
        formData
      );
    },
  },
};
</script>
