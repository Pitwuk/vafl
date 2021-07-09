<template>
  <body class="quaternary">
    <Appbar />
    <v-container class="fill-height quaternary" fluid>
      <div class="main_box shadow">
        <h1>Frequently Asked Questions</h1>
        <v-divider></v-divider>
        <v-expansion-panels class="faq">
          <v-expansion-panel
            v-for="(item, i) in questions"
            :key="i"
            class="grey lighten-4"
          >
            <v-expansion-panel-header class="question">{{
              item.question
            }}</v-expansion-panel-header>
            <v-expansion-panel-content
              >{{ item.answer
              }}<a v-if="item.link" :href="item.link"
                >here.</a
              ></v-expansion-panel-content
            >
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <v-container class="shadow further">
        <div>
          <h1>Further Inqueries?</h1>
          <v-divider></v-divider>
          <p>
            Please contact our customer support at
            <a
              href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=support@vaflpcb.com"
              >support@vaflpcb.com</a
            >.
          </p>
        </div>
      </v-container>
    </v-container>
    <Bottom />
  </body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";

export default {
  data: () => ({
    questions: [
      {
        question: "Where do I enter the promo code?",
        answer:
          "Enter the promo code on the billing page and apply it before entering your billing details.",
      },
      {
        question: "When will you be adding silkcreen overlay?",
        answer:
          "We plan to start shipping boards with overlay by the end of January.",
      },
      {
        question: "Do you have a certain color of soldermask?",
        answer:
          "The colors we have available are those listed on the order page.",
      },

      {
        question: "Do you offer multilayer PCB fabrication?",
        answer:
          "No, we do not currently offer any services aside from 1.6mm 1oz 2 layer boards.",
      },
      {
        question: "Do you offer flexible PCB fabrication?",
        answer:
          "No, we do not currently offer any services aside from 1.6mm 1oz 2 layer boards.",
      },
      {
        question: "Is my payment secure?",
        answer:
          "Yes, all of our purchases are handled with Stripe. It is completely secure.",
      },
      {
        question: "Where can I place an order?",
        answer:
          "You can place an order by clicking the Order Now button on the homepage or click ",
        link: "/order",
      },
      {
        question: "Where can I check the status of my order?",
        answer: "You can check the status of your order ",
        link: "/status",
      },
      {
        question: "I am getting an Invalid File error when uploading my files?",
        answer: "Please check out our guide on placing an order ",
        link: "/ordersupport",
      },
      {
        question: "Where can I find your manufacturing capabilities?",
        answer: "Our capabilities can be found ",
        link: "/capabilities",
      },
      {
        question:
          "How do I enter your capabilities into my design software's design rule checker?",
        answer:
          "Instructions on updating your design software's design rules can be found ",
        link: "/design-rules",
      },
      {
        question: "How do I get 50% off?",
        answer:
          "If there is a 50% off first order sale going on you must create an account first.",
      },
    ],
  }),
  components: { Appbar, Bottom },
};
</script>

<style scoped>
h1,
p {
  padding: 15px;
}
.question {
  font-size: medium;
  font-weight: bold;
  padding: 25px;
}
.shadow {
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
}
.main_box {
  width: 100%;
  /* margin-bottom: 20px; */
  background-color: white;
}
.faq {
  padding: 20px;
}
.further {
  background-color: white;
  /* height: 200px; */
  padding: 30px;
  /* margin-bottom: 30px; */
}
</style>