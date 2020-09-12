<template>
  <v-app class="accent">
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

      <v-stepper-items>
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
              <v-list>
                <v-list-item v-for="item in $cart.slice(1)" :key="item">
                  <v-list-item-title v-text="item.name"></v-list-item-title>
                  <v-list-item-title v-text="'x '+item.quantity"></v-list-item-title>
                  <v-list-item-title
                    v-text="'$'+(item.name=='PCB Prototyping Service'?(item.price/item.quantity):item.price).toFixed(2)"
                  ></v-list-item-title>
                </v-list-item>
                <v-list-item v-for="item in $cart.slice(1)" :key="item">
                  <v-list-item-title>Shipping:</v-list-item-title>
                  <v-list-item-title></v-list-item-title>
                  <v-list-item-title v-text="'$'+$shippingPrice.toFixed(2)"></v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item v-for="item in $cart.slice(1)" :key="item">
                  <v-list-item-title>Total:</v-list-item-title>
                  <v-list-item-title></v-list-item-title>
                  <v-list-item-title v-text="'$'+totalCost.toFixed(2)"></v-list-item-title>
                </v-list-item>
              </v-list>
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="card.number"
                    :rules="cardRules"
                    label="Card Number"
                    v-mask="'#### #### #### ####'"
                    required
                    outlined
                    append-icon="https://js.stripe.com/v3/fingerprinted/img/visa-365725566f9578a9589553aa9296d178.svg"
                  >
                    <template v-slot:append>
                      <v-fade-transition leave-absolute>
                        <img
                          width="24"
                          height="24"
                          src="https://js.stripe.com/v3/fingerprinted/img/visa-365725566f9578a9589553aa9296d178.svg"
                          alt
                        />
                      </v-fade-transition>
                      <v-fade-transition leave-absolute>
                        <img
                          width="24"
                          height="24"
                          src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg"
                          alt
                        />
                      </v-fade-transition>
                      <v-fade-transition leave-absolute>
                        <img
                          width="24"
                          height="24"
                          src="https://js.stripe.com/v3/fingerprinted/img/amex-a49b82f46c5cd6a96a6e418a6ca1717c.svg"
                          alt
                        />
                      </v-fade-transition>
                      <v-fade-transition leave-absolute>
                        <img
                          width="24"
                          height="24"
                          src="https://js.stripe.com/v3/fingerprinted/img/discover-ac52cd46f89fa40a29a0bfb954e33173.svg"
                          alt
                        />
                      </v-fade-transition>
                      <v-fade-transition leave-absolute>
                        <img
                          width="24"
                          height="24"
                          src="https://js.stripe.com/v3/fingerprinted/img/jcb-271fd06e6e7a2c52692ffa91a95fb64f.svg"
                          alt
                        />
                      </v-fade-transition>
                      <v-fade-transition leave-absolute>
                        <img
                          width="24"
                          height="24"
                          src="https://js.stripe.com/v3/fingerprinted/img/diners-fbcbd3360f8e3f629cdaa80e93abdb8b.svg"
                          alt
                        />
                      </v-fade-transition>
                      <v-fade-transition leave-absolute>
                        <img
                          width="24"
                          height="24"
                          src="https://js.stripe.com/v3/fingerprinted/img/unionpay-8a10aefc7295216c338ba4e1224627a1.svg"
                          alt
                        />
                      </v-fade-transition>
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="card.cvc"
                    :rules="cvcRules"
                    :counter="3"
                    label="CVC"
                    v-mask="'###'"
                    required
                    outlined
                  ></v-text-field>
                </v-col>

                <v-col cols="12" md="2">
                  <v-text-field
                    v-model="card.exp"
                    :rules="dateRules"
                    label="MM/YY"
                    v-mask="'##/##'"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider></v-divider>
              <a style="text-decoration: none" href="https://stripe.com/privacy">
                Powered by
                <svg focusable="false" width="33" height="15">
                  <g fill-rule="evenodd">
                    <path
                      d="M32.956 7.925c0-2.313-1.12-4.138-3.261-4.138-2.15 0-3.451 1.825-3.451 4.12 0 2.719 1.535 4.092 3.74 4.092 1.075 0 1.888-.244 2.502-.587V9.605c-.614.307-1.319.497-2.213.497-.876 0-1.653-.307-1.753-1.373h4.418c0-.118.018-.588.018-.804zm-4.463-.859c0-1.02.624-1.445 1.193-1.445.55 0 1.138.424 1.138 1.445h-2.33zM22.756 3.787c-.885 0-1.454.415-1.77.704l-.118-.56H18.88v10.535l2.259-.48.009-2.556c.325.235.804.57 1.6.57 1.616 0 3.089-1.302 3.089-4.166-.01-2.62-1.5-4.047-3.08-4.047zm-.542 6.225c-.533 0-.85-.19-1.066-.425l-.009-3.352c.235-.262.56-.443 1.075-.443.822 0 1.391.922 1.391 2.105 0 1.211-.56 2.115-1.39 2.115zM18.04 2.766V.932l-2.268.479v1.843zM15.772 3.94h2.268v7.905h-2.268zM13.342 4.609l-.144-.669h-1.952v7.906h2.259V6.488c.533-.696 1.436-.57 1.716-.47V3.94c-.289-.108-1.346-.307-1.879.669zM8.825 1.98l-2.205.47-.009 7.236c0 1.337 1.003 2.322 2.34 2.322.741 0 1.283-.135 1.581-.298V9.876c-.289.117-1.716.533-1.716-.804V5.865h1.716V3.94H8.816l.009-1.96zM2.718 6.235c0-.352.289-.488.767-.488.687 0 1.554.208 2.241.578V4.202a5.958 5.958 0 0 0-2.24-.415c-1.835 0-3.054.957-3.054 2.557 0 2.493 3.433 2.096 3.433 3.17 0 .416-.361.552-.867.552-.75 0-1.708-.307-2.467-.723v2.15c.84.362 1.69.515 2.467.515 1.879 0 3.17-.93 3.17-2.548-.008-2.692-3.45-2.213-3.45-3.225z"
                    />
                  </g>
                </svg>
              </a>
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
  </v-app>
</template>

<script>
import { mask } from "vue-the-mask";

const BASE_URL = "http://127.0.0.1:8000";

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
    productPrice: 0,
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
      var weight = 0;
      for (let i = 1; i < this.$cart.length; i++) {
        //4x8 envelope
        if (this.$cart[i].height <= 203.2 && this.$cart[i].width <= 101.6) {
          layers =
            this.$cart[i].quantity / Math.floor(203.2 / this.$cart[i].height);
          layers / Math.floor(101.6 / this.$cart[i].width);
          layers = Math.floor(layers) + 1;
        }

        if (layers == 0 || layers > 11) {
          //8.5x12 envelope
          layers =
            this.$cart[i].quantity / Math.floor(304.8 / this.$cart[i].height);
          layers / Math.floor(215.9 / this.$cart[i].width);
          layers = Math.floor(layers) + 1;
          big = true;
        }
        weight +=
          ((this.$cart[i].width *
            this.$cart[i].height *
            this.$cart[i].quantity) /
            10) *
          0.035;
      }

      var parcel = {
        template: null,
        length: (big ? 30.48 : 20.32).toString(),
        width: (big ? 21.59 : 10.16).toString(),
        height: 0.16 * layers.toFixed(4).toString(),
        distance_unit: "cm",
        weight: weight.toFixed(4).toString(),
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
      this.productPrice = 0;
      for (let i = 1; i < this.$cart.length; i++) {
        this.productPrice += this.$cart[i].price;
      }
      this.$shippingPrice = parseFloat(
        this.shippingRates[this.shippingMethod]["amount"]
      );
      this.totalCost = this.$shippingPrice + this.productPrice;
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
            orderNum: this.$cart[0],
            price:
              parseFloat(this.productPrice) + parseFloat(this.$shippingPrice),
          };
          axios
            .post(BASE_URL + "/api/charge/", payload)
            .then(() => {
              //put info to api

              //combine all boards into an arr
              var boards = [];
              for (let i = 1; i < this.$cart.length; i++) {
                boards.push(this.$cart[i]);
              }

              try {
                //form data
                const formData = {
                  orderNum: this.$cart[0],
                  first_name: this.firstname,
                  last_name: this.lastname,
                  email: this.email,
                  address: this.address,
                  city: this.city,
                  state: this.stateAbrev[this.state],
                  zipCode: this.zip,
                  boards: boards,
                };

                //http file post
                const axios = require("axios");

                axios.post(BASE_URL + "/api/orders/", formData).then(() => {
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
