<template>
  <v-stepper v-model="e1">
    <v-stepper-header class="primary">
      <v-stepper-step :complete="e1 > 1" step="1">
        <span style="color:white">Shipping Information</span>
      </v-stepper-step>

      <v-divider color="grey"></v-divider>

      <v-stepper-step :complete="e1 > 2" step="2">
        <span style="color:white">Shipping Method</span>
      </v-stepper-step>

      <v-divider color="grey"></v-divider>

      <v-stepper-step color="grey" step="3">
        <span style="color:white">Billing</span>
      </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items class="tertiary">
      <v-stepper-content step="1">
        <v-form v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="firstname"
                  :rules="nameRules"
                  :counter="32"
                  label="First name"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
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
              <v-col cols="12" md="8">
                <v-text-field v-model="email" :rules="emailRules" label="E-mail" required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field v-model="address" :rules="addressRules" label="Address" required></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field v-model="city" :rules="cityRules" label="City" required></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="state"
                  :items="states"
                  :rules="stateRules"
                  label="State"
                  append-icon="mdi-city"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="zip"
                  :rules="zipRules"
                  label="Zip Code"
                  :counter="5"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>

        <v-btn color="primary" @click="valid ? calculateShipping() : null">Continue</v-btn>

        <v-btn text to="/order">Cancel</v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-progress-circular indeterminate color="accent" v-if="loading"></v-progress-circular>
        <v-list>
          <v-list-item-group v-model="shippingMethod" color="primary">
            <v-list-item v-for="(shippingMethod, i) in shippingRates" :key="i">
              <v-list-item-content>
                <v-list-item-title v-text="[...shippingMethod.amount][0]"></v-list-item-title>
              </v-list-item-content>

              <v-list-item-content>
                <v-list-item-title v-text="shippingMethod.estimated_days"></v-list-item-title>
              </v-list-item-content>

              <v-list-item-content>
                <v-list-item-title v-text="shippingMethod.provider"></v-list-item-title>
              </v-list-item-content>
              <v-list-item-content>
                <v-list-item-title v-text="shippingMethod.servicelevel.name"></v-list-item-title>
              </v-list-item-content>

              <v-list-item-icon>
                <v-img :src="shippingMethod.provider_image_75" />
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <v-btn color="primary" @click="handleShipping()">Continue</v-btn>

        <v-btn text @click="e1 = 1">Back</v-btn>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-form v-model="valid">
          <!-- <v-textarea>Price: {{ boardPrice }} + {{ shippingRates[shippingMethod]['amount'] }} = {{totalCost}}</v-textarea> -->
          <v-container>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="card.number"
                  :rules="cardRules"
                  label="Card Number"
                  v-mask="'#### #### #### ####'"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="2">
                <v-text-field
                  v-model="card.cvc"
                  :rules="cvcRules"
                  :counter="3"
                  label="CVC"
                  v-mask="'###'"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="2">
                <v-text-field
                  v-model="card.exp"
                  :rules="dateRules"
                  label="MM/YY"
                  v-mask="'##/##'"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        <v-progress-circular indeterminate color="accent" v-if="loading"></v-progress-circular>
        <v-btn
          color="primary"
          :disabled="stripeCheck || !valid"
          @click="valid ? createToken() : null"
        >Submit</v-btn>

        <v-btn text @click="e1 = 2">Back</v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import globals from "../globals.js";
import { mask } from "vue-the-mask";

export default {
  data: () => ({
    e1: 1,
    valid: false,
    loading: false,
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
    zip: "",
    zipRules: [
      (v) => !!v || "Zip Code is required",
      (v) => (!isNaN(v) && !v.includes(".")) || "Must be an integer value",
      (v) => v.length == 5 || "Zip Code must be 5 digits",
    ],
    shippingRates: [],
    shippingMethod: 0,
    boardPrice: globals.price,
    totalCost: 0,
    card: {
      number: "",
      cvc: "",
      exp: "",
    },
    cardRules: [
      (v) => !!v || "Card Number is required",
      (v) => window.Stripe.validateCardNumber(v) || "Must be a valid card",
      (v) => v.length == 19 || "Card number must be 16 digits",
    ],
    cvcRules: [
      (v) => !!v || "Card Verification Code is required",
      (v) =>
        window.Stripe.validateCVC(v) || "Card Verification Code must be valid",
      (v) => v.length == 3 || "Card Verification Code must be 3 digits",
    ],
    dateRules: [
      (v) => !!v || "Expiration date is required",
      (v) => window.Stripe.validateExpiry(v) || "Expiration date must be valid",
      (v) => v.length == 5 || "Expiration date must be 4 digits",
    ],
    stripeCheck: false,
  }),
  methods: {
    async calculateShipping() {
      this.e1 = 2;
      this.valid = false;
      this.loading = true;

      var shippo = require("shippo")(process.env.VUE_APP_SHIPPO_SECRET_KEY);
      var addressFrom = {
        name: "VAFL PCB",
        street1: "5716 Lakeshore Rd",
        city: "Fort Gratiot",
        state: "MI",
        zip: "48059",
        country: "US",
      };
      var addressTo = {
        name: this.firstname + this.lastname,
        street1: this.address,
        city: this.city,
        state: this.state,
        zip: this.zip,
        country: "US",
        email: this.email,
      };

      //calculate layers thick in envelope
      var layers = 0;
      var big = false;
      //4x8 envelope
      if (globals.height <= 203.2 && globals.width <= 101.6) {
        layers = globals.quantity / Math.floor(203.2 / globals.height);
        layers / Math.floor(101.6 / globals.width);
        layers = Math.floor(layers) + 1;
      }

      if (layers == 0 || layers > 11) {
        //8.5x12 envelope
        layers = globals.quantity / Math.floor(304.8 / globals.height);
        layers / Math.floor(215.9 / globals.width);
        layers = Math.floor(layers) + 1;
        big = true;
      }

      var parcel = {
        template: null,
        length: (big ? 30.48 : 20.32).toString(),
        width: (big ? 21.59 : 10.16).toString(),
        height: 0.16 * layers.toFixed(4).toString(),
        distance_unit: "cm",
        weight: (
          ((globals.width * globals.height * globals.quantity) / 10) *
          0.035
        )
          .toFixed(4)
          .toString(),
        mass_unit: "oz",
        extra: {},
        test: true,
      };
      const shipment = await shippo.shipment.create(
        {
          address_from: addressFrom,
          address_to: addressTo,
          parcels: [parcel],
          async: true,
        },
        function (err, shipment) {
          if (err) {
            console.log(err);
          }
        }
      );
      this.shippingRates = shipment.rates;
      this.shippingRates.sort(this.sortShippingRates);
    },
    sortShippingRates(a, b) {
      this.loading = false;
      if (parseFloat(a.amount) > parseFloat(b.amount)) return 1;
      if (parseFloat(b.amount) > parseFloat(a.amount)) return -1;

      return 0;
    },
    handleShipping() {
      this.e1 = 3;
      globals.shippingPrice = this.shippingRates[this.shippingMethod]["amount"];
      this.totalCost =
        this.shippingRates[this.shippingMethod].amount + this.boardPrice;
    },
    createToken() {
      this.loading = true;
      this.stripeCheck = true;
      window.Stripe.setPublishableKey(process.env.VUE_APP_STRIPE_PUB_KEY);
      window.Stripe.createToken(this.card, (status, response) => {
        if (response.error) {
          this.stripeCheck = false;
          this.errors.push(response.error.message);
          // eslint-disable-next-line
          console.error(response);
        } else {
          const axios = require("axios");

          const payload = {
            token: response.id,
            orderNum: globals.orderNum,
            price:
              parseFloat(globals.price) + parseFloat(globals.shippingPrice),
          };
          axios
            .post("http://toasterwaffles.ddns.net/api/charge/", payload)
            .then(() => {
              //put info to api

              try {
                //form data
                const formData = {
                  orderNum: globals.orderNum,
                  first_name: this.firstname,
                  last_name: this.lastname,
                  email: this.email,
                  address: this.address,
                  city: this.city,
                  state: this.stateAbrev[this.state],
                  zipCode: this.zip,
                  quantity: globals.quantity,
                  speed: globals.speed,
                  color: globals.color,
                  layers: globals.layers,
                  request: globals.request,
                };

                //http file post
                const axios = require("axios");

                axios
                  .post("http://toasterwaffles.ddns.net/api/orders/", formData)
                  .then(() => {
                    this.$router.push({ path: "/success" });
                  });
              } catch (e) {
                console.error(e);
                this.failed = true;
              }
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    },
  },
  directives: { mask },
};
</script>

<style scoped>
</style>
