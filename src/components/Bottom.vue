<template>
  <div class="tertiary">
    <v-container class="center">
      <v-row>
        <v-col>
          <h4>Company</h4>
          <span>About Us</span>
          <br />
          <span>Blog</span>
          <br />
          <span>Store</span>
        </v-col>
        <v-col>
          <v-container>
            <h4>Help</h4>
            <span>Support</span>
          </v-container>
        </v-col>
        <v-col>
          <v-container>
            <h4>Services</h4>
            <span>PCB Prototyping</span>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {};
</script>

<style scoped>
div {
  position: relative;
  bottom: 0;
  width: 100%;
  height: 200px;
}
.center {
  position: relative;
  margin: auto;
  width: 60%;
  text-align: center;
}
</style>