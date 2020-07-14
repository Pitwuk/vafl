<template>
  <v-stepper v-model="e1">
    <v-stepper-header>
      <v-stepper-step :complete="e1 > 1" step="1"
        >Shipping Information</v-stepper-step
      >

      <v-divider></v-divider>

      <v-stepper-step :complete="e1 > 2" step="2"
        >Shipping Method</v-stepper-step
      >

      <v-divider></v-divider>

      <v-stepper-step step="3">Billing</v-stepper-step>
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
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="E-mail"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="address"
                  :rules="addressRules"
                  label="Address"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="city"
                  :rules="cityRules"
                  label="City"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-autocomplete
                  v-model="state"
                  :items="states"
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

        <v-btn color="primary" @click="valid ? calculateShipping() : null"
          >Continue</v-btn
        >

        <v-btn text to="/order">Cancel</v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-btn color="primary" @click="e1 = 3">Continue</v-btn>

        <v-btn text @click="e1 = 1">Back</v-btn>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-form v-model="valid">
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
        <v-btn
          color="primary"
          :disabled="stripeCheck || !valid"
          @click="valid ? createToken() : null"
          >Submit</v-btn
        >
        <v-btn color="primary" @click="valid ? (e1 = 1) : null">Continue</v-btn>

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
    e1: 3,
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
    zip: "",
    zipRules: [
      (v) => !!v || "Zip Code is required",
      (v) => (!isNaN(v) && !v.includes(".")) || "Must be an integer value",
      (v) => v.length == 5 || "Zip Code must be 5 digits",
    ],
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
    calculateShipping() {
      this.e1 = 2;
      this.valid = false;

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
      var parcel = {
        length: (globals.height * globals.quantity) / 10,
        width: (globals.width * globals.quantity) / 10,
        height: 0.16,
        distance_unit: "cm",
        weight:
          ((globals.width * globals.height * globals.quantity) / 10) * 0.035,
        mass_unit: "oz",
      };
      shippo.shipment.create(
        {
          address_from: addressFrom,
          address_to: addressTo,
          parcels: [parcel],
          async: false,
        },
        function(err, shipment) {
          if (err) {
            console.log(err);
          } else console.log(shipment);
        }
      );
    },

    createToken() {
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

          globals.orderNum =
            Math.random()
              .toString(36)
              .substring(2, 10) +
            Math.random()
              .toString(36)
              .substring(2, 10); //used in development DELETE AFTER
          const payload = {
            token: response.id,
            orderNum: globals.orderNum,
            price: globals.price,
          };
          axios
            .post("http://toasterwaffles.ddns.net/api/charge/", payload)
            .then(() => {
              this.$router.push({ path: "/complete" });
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

<style></style>
