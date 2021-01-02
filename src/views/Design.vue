<template>
  <body class="quaternary">
    <Appbar />
    <v-container class="fill-height quaternary" fluid>
      <div class="main_box shadow">
        <h1>How To Update Your Design Rules</h1>
        <v-divider></v-divider>
        <p>
          This guide should help you to set up your design rules to our
          specifications.
        </p>

        <h2>Global Rules:</h2>

        <ul>
          <li>Minimum Track Width: 0.127mm | 5mil</li>
          <li>Minimum Via Diameter: 0.5mm | 20mil</li>
          <li>Minimum Via Drill: 0.3mm | 11.811mil</li>
          <li>Minimum Hole to Hole to 0.25mm | 10mil</li>
        </ul>
        <p>
          The full list of capabilities can be found
          <a href="/capabilities">here.</a>
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
              ><v-list>
                <template v-for="(step, i) in item.steps">
                  <v-list-item-title v-bind:key="i">
                    <h3>
                      {{ step.title }}
                    </h3></v-list-item-title
                  ><v-list-item v-bind:key="i"
                    ><p>
                      {{ step.details }}
                    </p></v-list-item
                  ></template
                >
              </v-list></v-expansion-panel-content
            >
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <v-container class="shadow support">
        <div>
          <h1>Further Inqueries?</h1>
          <v-divider></v-divider>
          <p>
            For a guide on how to properly export your gerber files, check out
            our
            <a href="/export">Exporting Guide.</a>
          </p>
          <p>
            If this guide does not include your design software you can let us
            know at
            <a
              href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=support@vaflpcb.com"
              >support@vaflpcb.com</a
            >, and we will update this page to include it soon.
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
    instructions: [
      {
        name: "KiCad",
        steps: [
          {
            title: "1. Open Pcbnew",
            details: "Open the Pcbnew workspace within KiCad.",
          },
          {
            title: "2. Navigate to Board Setup",
            details:
              "Open the Board Setup for your project by clicking the green icon in the upper left-hand corner of the window.",
          },
          {
            title: "3. Setup Layers",
            details:
              "Make sure the Copper layers is set to 2. Set the PCB thickness to 1.6mm | 62.99213mils. ",
          },
          {
            title: "4. Setup Design Rules",
            details:
              "Click design Rules on the lefthand side of the board setup window. Make sure 'Allow blind/buried vias' and 'Allow micro vias' are unchecked. Set the minimum track width to 0.127mm | 5mil. Set the minimum via diameter to 0.5mm | 20mil. Set the minimum via drill to 0.3mm. Set the minimum hole to hole to 0.25mm | 10mil.",
          },
        ],
      },
      {
        name: "Eagle",
        steps: [
          {
            title: "1. Open File",
            details:
              "Open your PCB layout (.brd) file from your Autodesk EAGLE Control Panel.",
          },
          {
            title: "2. Navigate to DRC Setup",
            details:
              "Select the DRC tool on the left-hand side of your interface to open the DRC Setup dialog.",
          },
          {
            title: "3. Setup Layers",
            details:
              "Make sure the Copper layers are set to 0.035mm. Set the PCB isolation thickness to 1.5mm. ",
          },
          {
            title: "4. Setup Clearance",
            details:
              "Click on the Clearance tab. Set all different signals clearances to 0.127mm | 5mil.",
          },
          {
            title: "5. Setup Distance",
            details:
              "Click on the Distance tab. Set the Copper/Dimension and Drill/Hole to 0.25mm | 10mil.",
          },
          {
            title: "6. Setup Sizes",
            details:
              "Click on the Sizes tab. Set the Minimum Width to 0.127 | 5mil. Set the Minimum Drill to 0.3mm | 11.811mil.",
          },
          {
            title: "7. Setup Annular Ring",
            details:
              "Click on the Annular Ring tab. Set the Minimum Annular Ring for pads to 0.127 | 5mil. Set the Minimum Annular Ring for vias to 0.1 | 5mil.",
          },
          {
            title: "8. Check",
            details:
              "The rest of the values can be left as their default. Click the check button to make sure your layout complies our capabilities.",
          },
        ],
      },
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