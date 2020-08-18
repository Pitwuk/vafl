<template>
  <!-- <footer class="tertiary">

      <ul class="center">
        <br />
        <h4>Help</h4>
        <a href="/capabilities">Capabilities</a>
        <br />
        <a href="/support">Support</a>
      </ul>
      <ul class="center">
        <br />
        <h4>Services</h4>
        <a href="/order">PCB Prototyping</a>
        <br />
        <a href="/status">Order Status</a>
      </ul>
    </div>
  </footer>-->
  <footer class="tertiary">
    <ul class="footer-list-top">
      <li>
        <h4 class="footer-header">Services</h4>
      </li>
      <li>
        <a href="/order" class="footer-item">PCB Prototyping</a>
      </li>
      <li>
        <a href="/store" class="footer-item">Store</a>
      </li>
      <li>
        <a href="/status" class="footer-item">Order Status</a>
      </li>
    </ul>

    <ul class="footer-list-top">
      <li>
        <h4 class="footer-header">Help</h4>
      </li>
      <li>
        <a href="/capabilities" class="footer-item">Capabilities</a>
      </li>
      <li>
        <a href="/support" class="footer-item">Support</a>
      </li>
    </ul>

    <ul class="footer-list-top">
      <li>
        <h4 class="footer-header">Company</h4>
      </li>
      <li>
        <a href="/about" class="footer-item">About Us</a>
      </li>
    </ul>
    <span class="center">© Copyright 2020 VAFL PCB LLC</span>
  </footer>
</template>

<script>
export default {};
</script>

<style scoped>
body {
  height: 100%;
  margin: auto;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
}
ul {
  list-style: none;
}
a {
  text-decoration: none;
}
footer {
  margin-top: auto;
  width: 100%;
}
.tertiary {
  display: flex;
  flex-flow: row wrap;
}
.footer-list-top {
  width: 33.333%;
}
.footer-list-top > li {
  text-align: center;
  padding-bottom: 0.3%;
}
.footer-header {
  padding: 3% 0 0.5% 0;
  font-size: large;
}
.footer-item {
  font-size: medium;
}
.center {
  position: relative;
  padding-top: 1%;
  padding-bottom: 0.5%;
  margin: auto;
  width: 60%;
  text-align: center;
}
</style>