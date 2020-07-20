<template>
<body class="secondary">
  <Appbar />
  <br />
  <v-card class="tertiary">
    <h1>Frequently Asked Questions:</h1>
    <v-expansion-panels>
      <v-expansion-panel v-for="(item,i) in questions" :key="i">
        <v-expansion-panel-header style="font-weight: bold">{{item.question}}</v-expansion-panel-header>
        <v-expansion-panel-content>{{item.answer}}</v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
  <br />
  <v-card class="tertiary">
    <h3>Further Inqueries?</h3>
    <span>Please contact our customer support at vaflpcb@gmail.com</span>
  </v-card>
</body>
</template>

<script>
import Appbar from "../components/Appbar.vue";
export default {
  data: () => ({
    questions: [
      { question: "Why do when can dont", answer: "agreed" },
      { question: "Why don't when can do", answer: "I couldn't agree more" }
    ]
  }),
  components: { Appbar }
};
</script>

<style>
</style>