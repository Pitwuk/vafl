<template>
  <v-main>
    <Appbar />
    <v-container
      v-if="!admin && !registration && !manage"
      class="fill-height"
      fluid
    >
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
              <v-btn text color="primary" @click="registration = true"
                >Create Account</v-btn
              >
              <v-spacer />
              <v-btn color="primary" @click="access">Login</v-btn>
              <v-btn text to="/">Dismiss</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="registration" class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="12" md="10">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark elevation="0">
              <v-toolbar-title>Create Account</v-toolbar-title>
            </v-toolbar>

            <v-form v-model="valid">
              <v-container class="registration_form">
                <h2 class="registration_form_header">Shipping Information</h2>
                <hr />
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="firstname"
                      :rules="nameRules"
                      :counter="32"
                      label="First name"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="lastname"
                      :rules="nameRules"
                      :counter="32"
                      label="Last name"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="12">
                    <v-text-field
                      v-model="email"
                      :rules="emailRules"
                      label="E-mail"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="address"
                      :rules="addressRules"
                      label="Address"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="city"
                      :rules="cityRules"
                      label="City"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      v-model="state"
                      :items="states"
                      :rules="stateRules"
                      label="State"
                      append-icon="mdi-city"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="zip"
                      :rules="zipRules"
                      label="Zip Code"
                      :counter="5"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <br />
                <h2 class="registration_form_header">Login Information</h2>
                <hr />
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="login"
                      :rules="usernameRules"
                      :counter="32"
                      label="Username"
                      required
                    ></v-text-field>
                    <v-alert
                      transition="scale-transition"
                      type="error"
                      :value="exists"
                      >Username is taken or Email is already in use</v-alert
                    >
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPass ? 'text' : 'password'"
                      @click:append="showPass = !showPass"
                      v-model="password"
                      :rules="passRules"
                      label="Password"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                      :type="showPass ? 'text' : 'password'"
                      @click:append="showPass = !showPass"
                      v-model="password2"
                      :rules="passConRules"
                      label="Confirm Password"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-card-actions class="justify-end pa-4">
                  <v-btn :disabled="!valid" class="primary" @click="register()"
                    >Register</v-btn
                  >
                  <v-btn text @click="registration = false">Dismiss</v-btn>
                </v-card-actions>
              </v-container>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-container v-if="manage" class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="12" md="10">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark elevation="0">
              <v-toolbar-title>Manage Account</v-toolbar-title>
            </v-toolbar>

            <v-form v-model="valid">
              <v-container class="registration_form">
                <v-alert
                  transition="scale-transition"
                  type="success"
                  v-if="success"
                  >Success</v-alert
                >
                <h2 class="registration_form_header">Account Information</h2>
                <hr />
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      filled
                      readonly
                      v-model="login"
                      :rules="usernameRules"
                      label="Username"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      :filled="!edit"
                      :readonly="!edit"
                      v-model="firstname"
                      :rules="nameRules"
                      :counter="edit ? 32 : null"
                      label="First name"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      :filled="!edit"
                      :readonly="!edit"
                      v-model="lastname"
                      :rules="nameRules"
                      :counter="edit ? 32 : null"
                      label="Last name"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="12">
                    <v-text-field
                      :filled="!edit"
                      :readonly="!edit"
                      v-model="email"
                      :rules="emailRules"
                      label="E-mail"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      :filled="!edit"
                      :readonly="!edit"
                      v-model="address"
                      :rules="addressRules"
                      label="Address"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      :filled="!edit"
                      :readonly="!edit"
                      v-model="city"
                      :rules="cityRules"
                      label="City"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      :filled="!edit"
                      :readonly="!edit"
                      v-model="state"
                      :items="states"
                      :rules="stateRules"
                      label="State"
                      append-icon="mdi-city"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      :filled="!edit"
                      :readonly="!edit"
                      v-model="zip"
                      :rules="zipRules"
                      label="Zip Code"
                      :counter="edit ? 5 : null"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-card-actions class="justify-start pa-4">
                  <v-btn v-if="edit" color="red" @click="delete_overlay = true"
                    >Delete Account</v-btn
                  >
                </v-card-actions>
                <v-card-actions class="justify-end pa-4">
                  <v-btn
                    v-if="!edit"
                    class="primary"
                    @click="
                      edit = true;
                      success = false;
                    "
                    >Edit</v-btn
                  >
                  <v-btn v-if="edit" class="primary" @click="saveChanges()"
                    >Save Changes</v-btn
                  >
                  <v-btn
                    text
                    @click="
                      if (edit) edit = false;
                      else $router.push('/');
                      success = false;
                    "
                    >Dismiss</v-btn
                  >
                </v-card-actions>
                <v-overlay opacity=".5" :value="delete_overlay">
                  <v-card class="ma-3 pa-3">
                    <v-btn icon @click="delete_overlay = false">
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-card-title>
                      <h2 class="display-1">Delete Account</h2>
                    </v-card-title>
                    <v-card-text
                      >Are you sure you would like to delete your
                      acccount?</v-card-text
                    >
                    <v-divider></v-divider>
                    <v-card-actions class="justify-center pa-2">
                      <v-btn color="red" @click="deleteAccount()">Delete</v-btn>
                      <v-btn text @click="delete_overlay = false"
                        >Dismiss</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-overlay>
              </v-container>
            </v-form>
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
                v-model="fast_multiplier"
                :rules="sitevarRules"
                label="Fast Multiplier"
                :counter="5"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="turbo_multiplier"
                :rules="sitevarRules"
                label="Turbo Multiplier"
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
    <Bottom />
  </v-main>
</template>


<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";
const axios = require("axios");

export default {
  data() {
    return {
      login: "",
      password: "",
      alert: "",
      exists: false,
      admin: false,
      registration: false,
      manage: false,
      edit: false,
      delete_overlay: false,
      success: false,
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
        { text: "Country", value: "country", sortable: false },
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
      fast_multiplier: "",
      turbo_multiplier: "",
      sitevarRules: [(v) => !!v || "required"],
      valid: false,
      firstname: "",
      lastname: "",
      nameRules: [
        (v) => !!v || "Name is required",
        (v) => v.length <= 32 || "Name must be less than 32 characters",
      ],
      email: "",
      emailRules: [
        (v) => !!v || "E-mail is required",
        (v) => /.+@.+/.test(v) || "E-mail must be valid",
        (v) => /.+\..+/.test(v) || "E-mail must be valid",
        (v) => v.length <= 64 || "E-mail must be less than 64 characters",
      ],
      address: "",
      addressRules: [
        (v) => !!v || "Address is required",
        (v) => v.length <= 128 || "Address must be less than 128 characters",
      ],
      city: "",
      cityRules: [
        (v) => !!v || "City is required",
        (v) => v.length <= 32 || "City must be less than 32 characters",
      ],
      state: "",
      stateAbrev: {
        Arizona: "AZ",
        Alabama: "AL",
        Alaska: "AK",
        Arkansas: "AR",
        California: "CA",
        Colorado: "CO",
        Connecticut: "CT",
        Delaware: "DE",
        Florida: "FL",
        Georgia: "GA",
        Hawaii: "HI",
        Idaho: "ID",
        Illinois: "IL",
        Indiana: "IN",
        Iowa: "IA",
        Kansas: "KS",
        Kentucky: "KY",
        Louisiana: "LA",
        Maine: "ME",
        Maryland: "MD",
        Massachusetts: "MA",
        Michigan: "MI",
        Minnesota: "MN",
        Mississippi: "MS",
        Missouri: "MO",
        Montana: "MT",
        Nebraska: "NE",
        Nevada: "NV",
        "New Hampshire": "NH",
        "New Jersey": "NJ",
        "New Mexico": "NM",
        "New York": "NY",
        "North Carolina": "NC",
        "North Dakota": "ND",
        Ohio: "OH",
        Oklahoma: "OK",
        Oregon: "OR",
        Pennsylvania: "PA",
        "Rhode Island": "RI",
        "South Carolina": "SC",
        "South Dakota": "SD",
        Tennessee: "TN",
        Texas: "TX",
        Utah: "UT",
        Vermont: "VT",
        Virginia: "VA",
        Washington: "WA",
        "West Virginia": "WV",
        Wisconsin: "WI",
        Wyoming: "WY",
      },
      states: [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District of Columbia",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virgin Island",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming",
      ],
      stateRules: [(v) => !!v || "State is required"],
      country: "",
      zip: "",
      zipRules: [
        (v) => !!v || "Zip Code is required",
        (v) => (!isNaN(v) && !v.includes(".")) || "Must be an integer value",
        (v) => v.length == 5 || "Zip Code must be 5 digits",
      ],
      usernameRules: [
        (v) => !!v || "Username is required",
        (v) => v.length <= 32 || "Username must be less than 32 characters",
      ],
      passRules: [
        (v) => !!v || "Password is required",
        (v) => v.length <= 32 || "Password must be less than 32 characters",
      ],
      password2: "",
      passConRules: [
        (v) => !!v || "Password is required",
        (v) => v.length <= 32 || "Password must be less than 32 characters",
        (v) => v == this.password || "Passwords must match",
      ],
      showPass: false,
    };
  },
  methods: {
    async access() {
      if (
        this.login === "gregorious" &&
        this.password === process.env.VUE_APP_ADMIN_PASS
      ) {
        console.log("admin success");
        this.admin = true;
        this.getOrders();
      } else {
        this.alert = "";
        try {
          if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
            var res = await axios.get(this.$baseUrl + "/api/get-token/");
            axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
          }
          var response = await axios.post(this.$baseUrl + "/api/account/", {
            action: "get",
            username: this.login,
            password: this.password,
          });
          const userData = response.data
            .substring(1, response.data.length - 1)
            .split(', "');

          this.firstname = userData[1].substring(
            userData[1].indexOf(": ") + 3,
            userData[1].length - 1
          );
          this.lastname = userData[2].substring(
            userData[2].indexOf(": ") + 3,
            userData[2].length - 1
          );
          this.email = userData[3].substring(
            userData[3].indexOf(": ") + 3,
            userData[3].length - 1
          );
          this.address = userData[4].substring(
            userData[4].indexOf(": ") + 3,
            userData[4].length - 1
          );
          this.city = userData[5].substring(
            userData[5].indexOf(": ") + 3,
            userData[5].length - 1
          );
          this.state = userData[6].substring(
            userData[6].indexOf(": ") + 3,
            userData[6].length - 1
          );
          this.zip = userData[7].substring(
            userData[7].indexOf(": ") + 3,
            userData[7].length - 1
          );
          this.login = userData[8].substring(
            userData[8].indexOf(": ") + 3,
            userData[8].length - 1
          );
          this.num_orders = userData[10].substring(
            userData[10].indexOf(": ") + 3,
            userData[10].length - 1
          );
          this.$login.length = 0;

          this.$login.push(this.login);
          this.$login.push(this.firstname);
          this.$login.push(this.lastname);
          this.$login.push(this.email);
          this.$login.push(this.address);
          this.$login.push(this.city);
          this.$login.push(this.state);
          this.$login.push(this.zip);
          this.$login.push(this.num_orders);

          this.$router.push("/");
        } catch {
          this.alert = "Username or password is incorrect";
        }
      }
    },
    async register() {
      if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
        var res = await axios.get(this.$baseUrl + "/api/get-token/");
        axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
      }
      try {
        this.exists = false;

        var response = await axios.post(this.$baseUrl + "/api/account/", {
          action: "new",
          username: this.login,
          password: this.password,
          first: this.firstname,
          last: this.lastname,
          email: this.email,
          address: this.address,
          city: this.city,
          state: this.state,
          zip: this.zip,
        });
        if (response.status == 200) {
          this.registration = false;
          this.manage = true;
          this.$login.length = 0;

          this.$login.push(this.login);
          this.$login.push(this.firstname);
          this.$login.push(this.lastname);
          this.$login.push(this.email);
          this.$login.push(this.address);
          this.$login.push(this.city);
          this.$login.push(this.state);
          this.$login.push(this.zip);
          this.$login.push(this.num_orders);
          this.successAlert();
        } else {
          this.exists = true;
        }
      } catch {
        this.exists = true;
      }
    },
    async saveChanges() {
      if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
        var res = await axios.get(this.$baseUrl + "/api/get-token/");
        axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
      }
      try {
        this.edit = false;
        this.exists = false;
        var response = await axios.post(this.$baseUrl + "/api/account/", {
          action: "mod",
          username: this.login,
          password: this.password,
          first: this.firstname,
          last: this.lastname,
          email: this.email,
          address: this.address,
          city: this.city,
          state: this.state,
          zip: this.zip,
        });
        if (response.status == 200) {
          this.successAlert();
        } else {
          this.exists = true;
        }
      } catch {
        this.exists = true;
      }
    },
    async deleteAccount() {
      if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
        var res = await axios.get(this.$baseUrl + "/api/get-token/");
        axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
      }

      this.edit = false;
      this.exists = false;
      var response = await axios.post(this.$baseUrl + "/api/account/", {
        action: "del",
        username: this.login,
      });
      if (response.status == 200) {
        this.delete_overlay = false;
        this.$login.length = 0;
        this.success = true;
        setTimeout(() => {
          this.success = false;
          this.$router.push("/");
        }, 2000);
      }
    },
    async getOrders() {
      if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
        var res = await axios.get(this.$baseUrl + "/api/get-token/");
        axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
      }

      var response = await axios.post(this.$baseUrl + "/api/admin/", {
        password: process.env.VUE_APP_ORDER_PASS,
      });
      this.orders = [];
      this.responseToDict(response.data);
      this.getSiteVars();
      // console.log(this.orders)
    },
    responseToDict(data) {
      var order_arr = data.split('{"id"');
      for (let i = 1; i < order_arr.length; i++) {
        var orderData = order_arr[i]
          .substring(1, order_arr[i].length - 1)
          .split(', "');

        var boards = [];
        console.log(orderData)
        var date = orderData[2].replace(/"/g, "");
        boards.push(date.substring(date.indexOf(": ") + 2));
        boards.push(
          orderData[11]
            .substring(11, orderData[11].length - 2)
            .replace(/"/g, "")
            .replace(/'/g, '"')
            .replace(/},/g, "},***")
            .split(",***")
        );
        var parent = orderData[1].replace(/"/g, "");
        boards.push(parent.substring(parent.indexOf(": ") + 2));
        var shipping = orderData[12].replace(/"/g, "");
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
        var country = orderData[9].replace(/"/g, "");
        boards.push(country.substring(country.indexOf(": ") + 2));
        var zip = orderData[10].replace(/"/g, "");
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
          this.orders[this.orders.length - 1]["state"] = boards[9];
          this.orders[this.orders.length - 1]["zip"] = boards[10];
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
      console.log(sitevars);
      this.first_time_sale = sitevars[4].substring(
        sitevars[4].indexOf(": ") + 3,
        sitevars[4].length - 1
      );
      this.colors = sitevars[1].substring(
        sitevars[1].indexOf(": ") + 3,
        sitevars[1].length - 1
      );
      this.silk_colors = sitevars[8].substring(
        sitevars[8].indexOf(": ") + 3,
        sitevars[8].length - 1
      );
      this.fast_time = sitevars[3].substring(
        sitevars[3].indexOf(": ") + 3,
        sitevars[3].length - 1
      );
      this.price_per_sqcm = sitevars[6].substring(
        sitevars[6].indexOf(": ") + 3,
        sitevars[6].length - 1
      );
      this.promo_codes = sitevars[7].substring(
        sitevars[7].indexOf(": ") + 3,
        sitevars[7].length - 1
      );
      this.fast_multiplier = sitevars[2].substring(
        sitevars[2].indexOf(": ") + 3,
        sitevars[2].length - 1
      );
      this.turbo_multiplier = sitevars[10].substring(
        sitevars[10].indexOf(": ") + 3,
        sitevars[10].length - 1
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
        fast_multiplier: this.fast_multiplier,
        turbo_multiplier: this.turbo_multiplier,
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
    successAlert() {
      this.success = true;
      setTimeout(() => {
        this.success = false;
      }, 3000);
    },
  },
  beforeMount() {
    if (this.$login.length != 0) {
      this.manage = true;
      this.login = this.$login[0];
      this.firstname = this.$login[1];
      this.lastname = this.$login[2];
      this.email = this.$login[3];
      this.address = this.$login[4];
      this.city = this.$login[5];
      this.state = this.$login[6];
      this.zip = this.$login[7];
      this.num_orders = this.$login[8];
    }
  },
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.registration_form {
  padding: 40px;
}
.registration_form_header {
  padding: 10px;
}
</style>