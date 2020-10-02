<template>
  <v-menu rounded="b-xl" offset-y>
    <v-list>
      <v-list-item v-for="item in $cart" :key="item" link>
        <v-list-item-title v-text="item.orderNum"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {};
</script>

<style>
</style>