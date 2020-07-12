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
        <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card>

        <v-btn color="primary" @click="e1 = 3">Continue</v-btn>

        <v-btn text @click="e1 = 1">Back</v-btn>
      </v-stepper-content>

      <v-stepper-content step="3">
        <v-card class="mb-12" color="grey lighten-1" height="200px"></v-card>

        <v-btn color="primary" @click="e1 = 1">Continue</v-btn>

        <v-btn text @click="e1 = 2">Back</v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
import globals from "../globals.js";
export default {
  data: () => ({
    e1: 1,
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
  }),
  methods: {
    calculateShipping() {
      this.e1 = 2;

      var shippo = require("shippo")(
        "shippo_test_cbf20a69b49d247b111dff65de933add66aee981"
      );
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
  },
};
</script>

<style></style>
