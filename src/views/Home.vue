<template>
  <v-app>
    <v-app-bar elevate-on-scroll dark color="primary">
      <v-spacer />
      <v-toolbar-title>VAFL</v-toolbar-title>
      <v-spacer />
      <v-toolbar-items>
        <v-btn icon to="/cart">
          <v-icon>mdi-cart</v-icon>
        </v-btn>
        <v-btn icon to="/login">
          <v-icon>mdi-account</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <v-btn raised to="/order">Order</v-btn>
    <v-spacer />
  </v-app>
</template>

<script>
export default {};
</script>
