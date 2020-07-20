<template>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark elevation="0">
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-form>
                <v-text-field v-model="login" label="Username" prepend-icon="mdi-account" />
                <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-icon="mdi-lock"
                  type="password"
                />
                <v-alert transition="scale-transition" type="error" :value="!!alert">{{ alert }}</v-alert>
              </v-form>
            </v-card-text>

            <v-card-actions class="justify-end pa-4">
              <v-spacer />
              <v-btn text color="primary" @click="acessar">Login</v-btn>
              <v-btn text to="/">Dismiss</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</template>

<script>
export default {
  data() {
    return {
      login: "",
      password: "",
      alert: ""
    };
  },
  methods: {
    acessar() {
      if (this.login === "admin" && this.password === "password") {
        this.$ls.set("user", {
          login: this.login,
          name: "Patar Gregorious",
          email: "plogden2@gmail.com"
        });
        this.$router.push("/");
      } else {
        this.alert = "Username or password is incorrect";
      }
    }
  }
};
</script>
