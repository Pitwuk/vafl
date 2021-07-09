<template>
  <v-app class="accent">
    <v-stepper v-model="e1">
      <v-stepper-header class="primary">
        <v-stepper-step :complete="e1 > 1" step="1">
          <span style="color: white">Shipping Information</span>
        </v-stepper-step>

        <v-divider color="grey"></v-divider>

        <v-stepper-step :complete="e1 > 2" step="2">
          <span style="color: white">Shipping Method</span>
        </v-stepper-step>

        <v-divider color="grey"></v-divider>

        <v-stepper-step color="grey" step="3">
          <span style="color: white">Billing</span>
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
                  <v-text-field
                    v-model="companyname"
                    label="Company name"
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
                <v-col cols="12" md="8">
                  <v-autocomplete
                    v-model="country"
                    :items="country_list"
                    :rules="countryRules"
                    label="Country"
                  ></v-autocomplete>
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
                    v-if="country == 'United States'"
                    v-model="state"
                    :items="us_states"
                    :rules="stateRules"
                    label="State/Territory"
                    append-icon="mdi-city"
                  ></v-autocomplete>
                  <v-autocomplete
                    v-if="country == 'Canada'"
                    v-model="state"
                    :items="ca_provinces"
                    :rules="stateRules"
                    label="Province"
                    append-icon="mdi-city"
                  ></v-autocomplete>
                  <v-text-field
                    v-if="country != 'Canada' && country != 'United States'"
                    v-model="state"
                    label="State/Province"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="zip"
                    label="Zip Code"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
          <v-alert transition="scale-transition" type="error" v-if="error"
            >Shipping Information Incorrect</v-alert
          >

          <v-btn
            color="primary"
            @click="
              valid || $login.length > 8 ? calculateShipping() : infoError()
            "
            >Continue</v-btn
          >

          <v-btn text to="/order">Cancel</v-btn>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-progress-circular
            indeterminate
            color="accent"
            v-if="loading"
          ></v-progress-circular>
          <v-list>
            <v-list-item-group>
              <v-list-item>
                <v-list-item-content>
                  <h2>Price</h2>
                </v-list-item-content>

                <v-list-item-content>
                  <h2>Est. Days</h2>
                </v-list-item-content>

                <v-list-item-content>
                  <h2>Provider</h2>
                </v-list-item-content>

                <v-list-item-content>
                  <h2>Method</h2>
                </v-list-item-content>
                <v-list-item-icon> </v-list-item-icon> </v-list-item
            ></v-list-item-group>

            <v-list-item-group v-model="shippingMethod" color="primary">
              <v-list-item
                v-for="(shippingMethod, i) in shippingRates"
                :key="i"
              >
                <v-list-item-content>
                  <v-list-item-title
                    v-text="'$' + [...shippingMethod.amount][0]"
                  ></v-list-item-title>
                </v-list-item-content>

                <v-list-item-content>
                  <v-list-item-title
                    v-text="shippingMethod.estimated_days"
                  ></v-list-item-title>
                </v-list-item-content>

                <v-list-item-content>
                  <v-list-item-title
                    v-text="shippingMethod.provider"
                  ></v-list-item-title>
                </v-list-item-content>
                <v-list-item-content>
                  <v-list-item-title
                    v-text="shippingMethod.servicelevel.name"
                  ></v-list-item-title>
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
                <v-col cols="12" md="9">
                  <v-list>
                    <v-list-item v-for="item in $cart.slice(1)" :key="item[0]">
                      <v-list-item-title v-text="item.name"></v-list-item-title>
                      <v-list-item-title
                        v-text="'x ' + item.quantity"
                      ></v-list-item-title>
                      <v-list-item-title
                        v-text="
                          '$' +
                          (item.name == 'PCB Prototyping Service'
                            ? item.price / item.quantity
                            : item.price
                          ).toFixed(2)
                        "
                      ></v-list-item-title>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>Shipping:</v-list-item-title>
                      <v-list-item-title></v-list-item-title>
                      <v-list-item-title
                        v-text="'$' + $shippingPrice.toFixed(2)"
                      ></v-list-item-title>
                    </v-list-item>
                    <v-divider></v-divider>
                    <v-list-item>
                      <v-list-item-title>Total:</v-list-item-title>
                      <v-list-item-title></v-list-item-title>
                      <v-list-item-title
                        v-text="'$' + totalCost.toFixed(2)"
                        :style="
                          salePrice != 0
                            ? 'text-decoration: line-through'
                            : null
                        "
                      ></v-list-item-title>
                    </v-list-item>
                    <v-list-item v-if="salePrice">
                      <v-list-item-title
                        v-text="
                          ' ' +
                          Math.round(
                            (1 -
                              (parseFloat(salePrice) - $shippingPrice) /
                                (totalCost - $shippingPrice)) *
                              100
                          ) +
                          '% off'
                        "
                      ></v-list-item-title>
                      <v-list-item-title></v-list-item-title>
                      <v-list-item-title
                        style="color: red"
                        v-text="'$' + salePrice.toFixed(2).toString()"
                      ></v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="3">
                  <v-card-subtitle class="headline">
                    Promo Code
                  </v-card-subtitle>

                  <v-text-field
                    v-model="promocode"
                    label="Promo Code"
                    outlined
                  ></v-text-field>
                  <v-progress-circular
                    indeterminate
                    color="accent"
                    v-if="code_loading"
                  ></v-progress-circular>

                  <v-btn
                    color="primary"
                    :disabled="!promocode"
                    @click="promocode ? applyCode() : null"
                    >Apply</v-btn
                  ><v-alert
                    transition="scale-transition"
                    type="error"
                    v-if="code_failed"
                    >Invalid Code</v-alert
                  >
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-card-subtitle class="headline">
                    Billing Address
                  </v-card-subtitle>

                  <v-checkbox
                    v-model="bill_address_same"
                    label="Same as Shipping Address"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <v-form v-if="!bill_address_same" v-model="bill_valid">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="bill_firstname"
                        :rules="nameRules"
                        :counter="32"
                        label="First name"
                        required
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="bill_lastname"
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
                        v-model="companyname"
                        label="Company name"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="8">
                      <v-text-field
                        v-model="bill_email"
                        :rules="emailRules"
                        label="E-mail"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-autocomplete
                        v-model="bill_country"
                        :items="country_list"
                        :rules="countryRules"
                        label="Country"
                      ></v-autocomplete>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="bill_address"
                        :rules="addressRules"
                        label="Address"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="bill_city"
                        :rules="cityRules"
                        label="City"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-autocomplete
                        v-if="country == 'United States'"
                        v-model="bill_state"
                        :items="us_states"
                        :rules="stateRules"
                        label="State/Territory"
                        append-icon="mdi-city"
                      ></v-autocomplete>
                      <v-autocomplete
                        v-if="country == 'Canada'"
                        v-model="bill_state"
                        :items="ca_provinces"
                        :rules="stateRules"
                        label="Province"
                        append-icon="mdi-city"
                      ></v-autocomplete>
                      <v-text-field
                        v-if="country != 'Canada' && country != 'United States'"
                        v-model="bill_state"
                        label="State/Province"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="bill_zip"
                        label="Zip Code"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="card.number"
                    :rules="cardRules"
                    label="Card Number"
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
                    label="CVC"
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
              <a
                style="text-decoration: none"
                href="https://stripe.com/privacy"
              >
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
          <v-progress-circular
            indeterminate
            color="accent"
            v-if="loading"
          ></v-progress-circular>
          <v-alert transition="scale-transition" type="error" v-if="failed"
            >Error Information Incorrect</v-alert
          >
          <v-btn
            color="primary"
            :disabled="stripeCheck || !valid"
            @click="valid ? createToken() : null"
            >Submit</v-btn
          >

          <v-btn text @click="e1 = 2">Back</v-btn>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-app>
</template>

<script>
import { mask } from "vue-the-mask";
const axios = require("axios");
export default {
  data: () => ({
    e1: 1,
    valid: false,
    bill_valid: true,
    loading: false,
    error: false,
    failed: false,
    firstname: "",
    lastname: "",
    bill_firstname: "",
    bill_lastname: "",
    companyname: "",
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => v.length <= 32 || "Name must be less than 32 characters",
    ],
    email: "",
    bill_email: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+/.test(v) || "E-mail must be valid",
      (v) => /.+\..+/.test(v) || "E-mail must be valid",
      (v) => v.length <= 64 || "E-mail must be less than 64 characters",
    ],
    address: "",
    bill_address: "",
    addressRules: [
      (v) => !!v || "Address is required",
      (v) => v.length <= 128 || "Address must be less than 128 characters",
    ],
    city: "",
    bill_city: "",
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
    us_states: [
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
      "American Samoa",
      "Federated States of Micronesia",
      "Guam",
      "Marshall Islands",
      "Northern Marina Islands",
      "Palau",
      "Puerto Rico",
      "US Virgin Islands",
    ],
    ca_provinces: [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "Newfoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Yukon Territory",
    ],

    stateRules: [(v) => !!v || "State is required"],
    country: "United States",
    bill_country: "United States",
    country_list: [
      "Afghanistan",
      "Aland Islands",
      "Albania",
      "Algeria",
      "Andorra",
      "Angola",
      "Anguilla",
      "Antigua and Barbuda",
      "Argentina",
      "Armenia",
      "Aruba",
      "Ascension",
      "Australia",
      "Austria",
      "Azerbaijan",
      "Bahamas",
      "Bahrain",
      "Bangladesh",
      "Barbados",
      "Belarus",
      "Belgium",
      "Belize",
      "Benin",
      "Bermuda",
      "Bhutan",
      "Bolivia, Plurinational State of",
      "Bosnia and Herzegovina",
      "Botswana",
      "Brazil",
      "Brunei Darussalam",
      "Bulgaria",
      "Burkina Faso",
      "Burundi",
      "Cambodia",
      "Cameroon",
      "Canada",
      "Cayman Islands",
      "Central African Republic",
      "Chad",
      "Chile",
      "China",
      "Christmas Island",
      "Cocos (Keeling) Islands",
      "Colombia",
      "Comoros",
      "Congo, the Democratic Republic of the",
      "Congo",
      "Cook Islands",
      "Costa Rica",
      "Croatia",
      "Cuba",
      "Curaçao",
      "Cyprus",
      "Czech Republic",
      "Côte d'Ivoire",
      "Denmark",
      "Djibouti",
      "Dominica",
      "Dominican Republic",
      "Ecuador",
      "Egypt",
      "El Salvador",
      "Equatorial Guinea",
      "Eritrea",
      "Estonia",
      "Eswatini",
      "Ethiopia",
      "Falkland Islands [Malvinas]",
      "Faroe Islands",
      "Fiji",
      "Finland",
      "France",
      "French Guiana",
      "French Polynesia",
      "Gabon",
      "Gambia",
      "Georgia",
      "Germany",
      "Ghana",
      "Gibraltar",
      "Greece",
      "Greenland",
      "Grenada",
      "Guadeloupe",
      "Guam",
      "Guatemala",
      "Guernsey",
      "Guinea",
      "Guinea-Bissau",
      "Guyana",
      "Haiti",
      "Holy See (Vatican City State)",
      "Honduras",
      "Hong Kong",
      "Hungary",
      "Iceland",
      "India",
      "Indonesia",
      "Iran, Islamic Republic of",
      "Iraq",
      "Ireland",
      "Isle of Man",
      "Israel",
      "Italy",
      "Jamaica",
      "Japan",
      "Jersey",
      "Jordan",
      "Kazakhstan",
      "Kenya",
      "Kiribati",
      "Korea, Democratic People's Republic of",
      "Korea, Republic of",
      "Kosovo",
      "Kuwait",
      "Kyrgyzstan",
      "Lao People's Democratic Republic",
      "Latvia",
      "Lebanon",
      "Lesotho",
      "Liberia",
      "Libya",
      "Liechtenstein",
      "Lithuania",
      "Luxembourg",
      "Macao",
      "Madagascar",
      "Malawi",
      "Malaysia",
      "Maldives",
      "Mali",
      "Malta",
      "Martinique",
      "Mauritania",
      "Mauritius",
      "Mayotte",
      "Mexico",
      "Moldova, Republic",
      "Monaco",
      "Mongolia",
      "Montenegro",
      "Montserrat",
      "Morocco",
      "Mozambique",
      "Myanmar",
      "Namibia",
      "Nauru",
      "Nepal",
      "Netherlands",
      "New Caledonia",
      "New Zealand",
      "Nicaragua",
      "Niger",
      "Nigeria",
      "Niue",
      "Norfolk Island",
      "North Macedonia, Republic of",
      "Norway",
      "Oman",
      "Pakistan",
      "Panama",
      "Papua New Guinea",
      "Paraguay",
      "Peru",
      "Philippines",
      "Pitcairn",
      "Poland",
      "Portugal",
      "Qatar",
      "Romania",
      "Russian Federation",
      "Rwanda",
      "Réunion",
      "Saint Barthélemy",
      "Saint Christopher and Nevis",
      "Saint Helena",
      "Saint Lucia",
      "Saint Martin (French part)",
      "Saint Pierre and Miquelon",
      "Saint Vincent and the Grenadines",
      "Samoa",
      "San Marino",
      "Sao Tome and Principe",
      "Saudi Arabia",
      "Senegal",
      "Serbia",
      "Seychelles",
      "Sierra Leone",
      "Singapore",
      "Sint Maarten",
      "Slovakia",
      "Slovenia",
      "Solomon Islands",
      "South Africa",
      "South Sudan, Republic of",
      "Spain",
      "Sri Lanka",
      "Sudan",
      "Suriname",
      "Sweden",
      "Switzerland",
      "Syrian Arab Republic",
      "Taiwan",
      "Tajikistan",
      "Tanzania, United Republic of",
      "Thailand",
      "Timor-Leste",
      "Togo",
      "Tokelau",
      "Tonga",
      "Trinidad and Tobago",
      "Tristan da Cunha",
      "Tunisia",
      "Turkey",
      "Turkmenistan",
      "Turks and Caicos Islands",
      "Tuvalu",
      "Uganda",
      "United Arab Emirates",
      "United Kingdom",
      "United States",
      "Uruguay",
      "Uzbekistan",
      "Vanuatu",
      "Venezuela, Bolivarian Republic of",
      "Viet Nam",
      "Virgin Islands, British",
      "Wallis and Futuna",
      "Western Sahara",
      "Yemen",
      "Zambia",
      "Zimbabwe",
    ],
    countryRules: [(v) => !!v || "Country is required"],
    zip: "",
    bill_zip: "",
    zipRules: [
      (v) =>
        (!!v &&
          (this.country == "United States" || this.country == "Canada")) ||
        "Zip Code is required",
    ],
    shippingRates: [],
    shippingMethod: 0,
    productPrice: 0,
    totalCost: 0,
    bill_address_same: true,
    card: {
      number: "",
      cvc: "",
      exp: "",
    },
    cardRules: [
      (v) => !!v || "Card Number is required",
      (v) => window.Stripe.validateCardNumber(v) || "Must be a valid card",
    ],
    cvcRules: [
      (v) => !!v || "Card Verification Code is required",
      (v) =>
        window.Stripe.validateCVC(v) || "Card Verification Code must be valid",
    ],
    dateRules: [
      (v) => !!v || "Expiration date is required",
      (v) => window.Stripe.validateExpiry(v) || "Expiration date must be valid",
      (v) => v.length == 5 || "Expiration date must be 4 digits",
    ],
    stripeCheck: false,
    num_orders: 0,
    promocode: "",
    code_loading: false,
    code_failed: false,
    salePrice: false,
  }),
  methods: {
    async applyCode() {
      this.promocode = this.promocode.toLowerCase();
      this.code_loading = true;
      this.code_failed = false;
      const formData = { password: process.env.VUE_APP_ORDER_PASS };

      const response = await axios.get(
        this.$baseUrl + "/api/sitevars/",
        formData
      );
      const sitevars = response.data
        .substring(1, response.data.length - 1)
        .split(', "');
      this.promo_codes = sitevars[7].substring(
        sitevars[7].indexOf(": ") + 3,
        sitevars[7].length - 1
      );
      this.promo_codes = this.promo_codes.split(";");

      var self = this;
      var match = false;
      this.promo_codes.forEach(function (code) {
        var discount = code.substring(code.indexOf(",") + 1);
        code = code.substring(0, code.indexOf(","));
        if (self.promocode == code) {
          self.adjustPrice(discount);
          self.code_loading = false;
          match = true;
        }
      });
      if (!match) {
        this.code_failed = true;
        this.code_loading = false;
      }
    },
    adjustPrice(discount) {
      this.promocode = "";
      console.log(discount);
      var sale = 1 - discount;
      this.salePrice =
        this.totalCost2 - this.productPrice + this.productPrice * sale;
      this.salePrice2 = this.salePrice;
    },
    infoError() {
      this.error = true;
      setTimeout(() => {
        this.error = false;
      }, 5000);
    },
    async calculateShipping() {
      this.e1 = 2;
      this.valid = false;
      this.loading = true;

      var shippo = require("shippo")(process.env.VUE_APP_SHIPPO_SECRET_KEY);
      var addressFrom = {
        name: "VAFL PCB",
        street1: "Townsend Dr",
        city: "Houghton",
        state: "MI",
        zip: "49931",
        country: "US",
      };
      var addressTo = {
        name: this.firstname + this.lastname,
        street1: this.address,
        city: this.city,
        state: this.state,
        zip: this.zip,
        country: this.country,
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
        length: "10",
        width: "10",
        height: "0.16",
        distance_unit: "cm",
        weight: "2.00",
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
      if (this.productPrice >= 10 && this.country == "United States") {
        var freeRate = {
          amount: ["0.00"],
          estimated_days: 5,
          provider: "USPS",
          servicelevel: { name: "First-Class Package/Mail Parcel" },
          provider_image_75:
            "https://shippo-static.s3.amazonaws.com/providers/75/USPS.png",
        };
        this.shippingRates.unshift(freeRate);
      }
    },
    sortShippingRates(a, b) {
      this.loading = false;
      if (parseFloat(a.amount) > parseFloat(b.amount)) return 1;
      if (parseFloat(b.amount) > parseFloat(a.amount)) return -1;

      return 0;
    },
    handleShipping() {
      this.e1 = 3;

      this.$shippingPrice = parseFloat(
        this.shippingRates[this.shippingMethod]["amount"]
      );
      this.$shippingMethod =
        this.shippingRates[this.shippingMethod]["provider"] +
        " | " +
        this.shippingRates[this.shippingMethod]["servicelevel"]["name"];
      this.totalCost = this.$shippingPrice + this.productPrice;
      this.totalCost2 = this.totalCost;
    },
    createToken() {
      this.loading = true;
      this.stripeCheck = true;
      window.Stripe.setPublishableKey(process.env.VUE_APP_STRIPE_PUB_KEY);
      try {
        window.Stripe.createToken(this.card, (status, response) => {
          if (response.error) {
            this.loading = false;
            this.failed = true;
            this.stripeCheck = false;
            this.errors.push(response.error.message);
            // eslint-disable-next-line

            console.error(response);
          } else {
            var price = this.totalCost2;
            if (this.salePrice) price = this.salePrice2;
            if (price < 0.5) price = 0.5;

            const payload = {
              token: response.id,
              orderNum: this.$cart[0],
              price: price,
            };
            axios
              .post(this.$baseUrl + "/api/charge/", payload)
              .then(() => {
                //put info to api

                //combine all boards into an arr
                var boards = [];
                for (let i = 1; i < this.$cart.length; i++) {
                  boards.push(this.$cart[i]);
                }

                //form data
                const formData = {
                  orderNum: this.$cart[0],
                  first_name: this.firstname,
                  last_name: this.lastname,
                  email: this.email,
                  address: this.address,
                  city: this.city,
                  state: this.state,
                  country: this.country,
                  zipCode: this.zip,
                  boards: boards,
                  shipping: this.$shippingMethod,
                };
                console.log(this.$shippingMethod);

                //http file post

                axios
                  .post(this.$baseUrl + "/api/orders/", formData)
                  .then(() => {
                    // if (this.num_orders >= 0) {
                    //   axios
                    //     .post(this.$baseUrl + "/api/account/", {
                    //       action: "inc",
                    //       num: this.num_orders++,
                    //     })
                    //     .then(() => {
                    //       this.$router.push({ path: "/success" });
                    //     })
                    //     .catch((error) => {
                    //       console.error(error);
                    //       this.loading = false;
                    //       this.failed = true;
                    //     });
                    // } else {
                    this.$router.push({ path: "/success" });
                  })
                  .catch((error) => {
                    console.error(error);
                    this.loading = false;
                    this.failed = true;
                    this.stripeCheck = false;
                  });
              })
              .catch((error) => {
                console.error(error);
                this.loading = false;
                this.failed = true;
                this.stripeCheck = false;
              });
          }
        });
      } catch (e) {
        console.error(e);
        this.loading = false;
        this.failed = true;
        this.stripeCheck = false;
      }
    },
  },
  async beforeMount() {
    try {
      if (!axios.defaults.headers.common["X-CSRFTOKEN"]) {
        var res = await axios.get(this.$baseUrl + "/api/get-token/");
        axios.defaults.headers.common["X-CSRFTOKEN"] = res.data.token;
      }
    } catch {
      console.log("error creating session");
    }
    this.productPrice = 0;
    for (let i = 1; i < this.$cart.length; i++) {
      this.productPrice += this.$cart[i].price;
    }
    if (this.$login.length > 8) {
      this.firstname = this.$login[1];
      this.lastname = this.$login[2];
      this.email = this.$login[3];
      this.address = this.$login[4];
      this.city = this.$login[5];
      this.state = this.$login[6];
      this.zip = this.$login[7];
      this.login = this.$login[0];
      this.num_orders = this.$login[8];
      this.valid = true;
    }
  },
  directives: { mask },
};
</script>

<style scoped>
</style>
