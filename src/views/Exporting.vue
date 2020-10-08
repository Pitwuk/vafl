<template>
  <body class="secondary">
    <Appbar />
    <div>
      <v-container fluid>
        <div class="main_box shadow">
          <h1>How To Export Your Gerber Files</h1>
          <v-divider></v-divider>
          <p>
            This guide should help if you are having trouble uploading your
            gerber files.
          </p>

          <h2>Format Rules:</h2>
          <br />
          <p>
            We only accept files in the RS-274X format with Protel filename
            extensions.
          </p>

          <v-expansion-panels class="exp_pan">
            <v-expansion-panel
              v-for="(item, i) in instructions"
              :key="i"
              class="grey lighten-4"
            >
              <v-expansion-panel-header class="names">{{
                item.name
              }}</v-expansion-panel-header>
              <v-expansion-panel-content
                ><v-img :src="item.img" />
                <p>
                  To export your gerber files in KiCad click on Plot and then
                  fill out the boxes as shown in the image.<br />
                  Make sure to enable 'Use Protel filename extensions', 'Use
                  extended X2 format', and 'Subtract soldermask from silkscreen'
                  before plotting your gerber files. Then click Generate Drill
                  files and export them in Excellon to the same folder as your
                  gerber files. Do not combione the PTH and NPTH files.
                </p>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-container>
      <v-container class="shadow support">
        <div>
          <h1>Further Inqueries?</h1>
          <v-divider></v-divider>
          <p>
            For a guide on how to properly set up the design rules, check out
            our
            <a href="/design-rules">Design Rule Guide.</a>
          </p>
          <p>
            If this guide does not include your design software you can let us
            know at
            <a
              href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=vaflpcb@gmail.com"
              >vaflpcb@gmail.com</a
            >, and we will update this page to include it soon.
          </p>
        </div>
      </v-container>
    </div>
    <Bottom />
  </body>
</template>


<script>
import Appbar from "../components/Appbar.vue";
import Bottom from "../components/Bottom.vue";

export default {
  data: () => ({
    instructions: [
      {
        name: "KiCad",
        img: require("../assets/export/kicad.png"),
      },
      //   {
      //     name: "Eagle",

      //   },
    ],
  }),
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.v-list {
  margin-left: 20px;
}
h1,
h2,
p {
  padding: 15px;
}
li {
  padding: 3px;
}
.shadow {
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
}
.main_box {
  width: 100%;
  margin-bottom: 20px;
  background-color: white;
}
.support {
  background-color: white;
  padding: 30px;
  margin-bottom: 30px;
}
.names {
  font-size: medium;
  font-weight: bold;
  padding: 25px;
}
.exp_pan {
  padding: 20px;
}
</style>