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
    </v-container>
    <v-btn @click="advanceStage('CLEAR', 'CLEAR')">Clear Database</v-btn>
    <input type="hidden" name="csrftoken" value="{%csrf_token%}" />
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
        { text: "Stage", value: "stage", sortable: false },
        { text: "Shipping", value: "shipping", sortable: false },
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
      const formData = { password: process.env.VUE_APP_ORDER_PASS };

      const response = await axios.post(
        this.$baseUrl + "/api/admin/",
        formData
      );
      this.orders = [];
      this.responseToDict(response.data);
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
        boards.push(shipping.substring(parent.indexOf(": ") + 2));

        for (let j = 0; j < boards[1].length; j++) {
          this.orders.push(JSON.parse(boards[1][j]));
          this.orders[this.orders.length - 1]["datetime"] = boards[0];
          this.orders[this.orders.length - 1]["parentOrderNum"] = boards[2];
          this.orders[this.orders.length - 1]["shipping"] = boards[3];
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
  },
};
</script>
