<template>
  <body class="secondary">
    <Appbar />
    <div>
      <v-container fluid>
        <table class="table shadow">
          <thead class="font16">
            <tr>
              <th width="23%">Feature</th>
              <th width="23%">Specification</th>
              <th width="31%">Description</th>
              <!-- <th width="23%" style="text-align: center;">Visual</th> -->
            </tr>
          </thead>
          <tbody class="font14">
            <tr v-for="(capability, i) in list" :key="i">
              <td>{{ capability.feature }}</td>
              <td>{{ capability.specification }}</td>
              <td>{{ capability.description }}</td>
            </tr>
          </tbody>
        </table>
      </v-container>
      <v-container class="shadow design_rules">
        <div>
          <h1>Design Rule Setup</h1>
          <v-divider></v-divider>
          <p>
            For instructions on how to setup your design software's design rules
            for our capabilities visit <a href="/design-rules">here</a>
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
    list: [
      {
        feature: "Material",
        specification: "G10 FR-4",
        description:
          "Composite material that consists of glass fabric and electrical grade epoxy resin.",
      },
      {
        feature: "Board Thickness",
        specification: "1.6mm | 1/16in",
        description: "The thickness of the finished PCB.",
      },
      {
        feature: "Max. Size",
        specification: "209x273mm | 8.25x10.75in",
        description: "The maximum sized board that we will manufacture.",
      },
      {
        feature: "Copper Weight",
        specification: "1 oz",
        description: "1 ounce of copper per sqft. ~35µm | 1.4mils thick.",
      },
      {
        feature: "Min Drill Diameter",
        specification: "0.3mm, 0.4mm, ≥0.5mm",
        description:
          "Any holes smaller than 0.5mm will be rounded to the nearest tenth of a mm. Holes >0.5mm that are not round to the tenth of a mm will be milled.",
      },
      {
        feature: "Min. Track Clearance",
        specification: "0.127mm | 5mil",
        description: "Minimum space between traces.",
      },
      {
        feature: "Min. Track Width",
        specification: "0.127mm | 5mil",
        description: "Minimum width for traces.",
      },
      {
        feature: "Min. Via Diameter",
        specification: "0.3mm | 11.811mil",
        description: "Minimum drill size.",
      },
      {
        feature: "Min. Annular Ring",
        specification: "0.127mm | 5mil",
        description: "Minimum annular ring width. (Pad radius - Drill radius)",
      },
      {
        feature: "Min. Hole to Hole Clearance",
        specification: "0.254mm | 10mil",
        description: "Minimum distance between the edges of the drilled holes.",
      },
    ],
  }),
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.center {
  margin: auto;
}
table,
th,
td {
  border: 1px solid rgb(119, 119, 119);
}
th {
  background-color: rgb(100, 100, 100);
  color: white;
  padding: 5px;
}
table,
td {
  background-color: white;
  padding: 30px;
}
h1,
p {
  padding: 15px;
}
.shadow {
  box-shadow: 0 19px 38px rgba(0, 0, 0, 0.3), 0 15px 12px rgba(0, 0, 0, 0.22);
}
.table {
  width: 100%;
  margin-bottom: 20px;
  border-collapse: collapse;
}
.design_rules {
  background-color: white;
  height: 200px;
  padding: 30px;
  margin-bottom: 30px;
}
</style>