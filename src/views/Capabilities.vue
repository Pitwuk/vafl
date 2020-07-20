<template>
<body class="secondary">
  <Appbar />

  <v-container fluid class="center">
    <v-row v-for="(capability, i) in list" :key="i" no-gutters>
      <v-col cols="2">
        <v-card outlined tile class="ma-1 pa-6 tertiary">
          <span>{{capability.feature}}</span>
        </v-card>
      </v-col>
      <v-col cols="2">
        <v-card outlined tile class="ma-1 pa-6 tertiary">
          <span>{{capability.description}}</span>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</body>
</template>

<script>
import Appbar from "../components/Appbar.vue";

export default {
  data: () => ({
    list: [
      { feature: "Material", description: "G10 FR-4" },
      { feature: "Board Thickness", description: "1.6mm" },
      { feature: "Max Dimension", description: "215x279mm" },
      { feature: "Copper Weight", description: "1 oz" },
      { feature: "Min Drill Diameter", description: "0.3 mm" },
      { feature: "Min Clearance", description: "TBD" },
      { feature: "Min Trace Width", description: "TBD" }
    ]
  }),
  components: { Appbar }
};
</script>

<style scoped>
.center {
  margin: auto;
}
</style>