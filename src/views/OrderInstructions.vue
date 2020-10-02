<template>
  <body class="secondary">
    <Appbar />
    <div>
      <v-container fluid>
        <div class="main_box shadow">
          <h1>How To Order</h1>
          <v-divider></v-divider>
          <p>
            This guide should help if you are having trouble submitting your
            order.
          </p>
          <v-list>
            <v-list-item-title>
              <h3>1. Prepare your files</h3></v-list-item-title
            ><v-list-item
              ><p>
                Ensure that your files are in the correct format by following
                our
                <a href="/exporting">Exporting Guide.</a>
              </p></v-list-item
            >
            <v-list-item-title>
              <h3>2. Go to our order page</h3></v-list-item-title
            ><v-list-item
              ><p>
                Navigate to our order page by clicking
                <a href="/order">here.</a>
              </p></v-list-item
            >
            <v-list-item-title> <h3>3. Upload your files</h3></v-list-item-title
            ><v-list-item
              ><p>
                Click on the Upload Files button at the top of the order page
                and select your .zip file containing your gerber files.
              </p></v-list-item
            >
            <v-list-item-title>
              <h3>4. Rendering you files</h3></v-list-item-title
            ><v-list-item
              ><p>
                If you recieve an 'Invalid File' error or the image rendered is
                not your intended file then please refer to the
                <a href="/exporting">Exporting Guide.</a> If everything renders
                correctly then proceed to the next step. Please note that it may
                take a while to render larger files.
              </p></v-list-item
            >
            <v-list-item-title>
              <h3>5. Selecting your options</h3></v-list-item-title
            ><v-list-item
              ><p>
                Select the quantity, soldermask color, silk screen color, number
                of layers of your board, and add any additional requests in the
                requests box. Please note that if an option is disabled then we
                are not able to provide that option at this time.
              </p></v-list-item
            >
            <v-list-item-title>
              <h3>5. Purchasing Your Boards</h3></v-list-item-title
            ><v-list-item
              ><p>
                Click the purchase button on the right hand side of the order
                page. If you wish to add boards to your order then select
                continue shopping and your order will be added to your cart,
                otherwise click purchase now. You will be redirected to the
                checkout where you first enter your shipping information. Please
                note that we are currently only shipping within the US. Then
                select your prefered shipping method (if your oder exceeds $10,
                then you will have the option for USPS First Class free
                shipping). Finally enter your billing information. If your
                billing address is different than your shipping address then
                select change billing address and enter it.
              </p></v-list-item
            >
            <v-list-item-title> <h3>6. Success</h3></v-list-item-title
            ><v-list-item
              ><p>
                You should now be redirected to a success page if your payment
                was successful, otherwise your payment was declined. If you
                believe this to be an error on our part contact us at
                <a
                  href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=vaflpcb@gmail.com"
                  >vaflpcb@gmail.com</a
                >. You should receive an email with your order information and
                order number. You can check the status of your order at any time
                by entering your order number on the
                <a href="/status">status page</a>. Should you need to cancel
                your order contact us directly at
                <a
                  href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=vaflpcb@gmail.com"
                  >vaflpcb@gmail.com</a
                >, and you will recieve a full refund as long you cancel before
                we start manufacturing your boards.
              </p></v-list-item
            >
          </v-list>
        </div>
      </v-container>
      <v-container class="shadow support">
        <div>
          <h1>Still Having Trouble?</h1>
          <v-divider></v-divider>
          <p>
            If this guide didn't solve your issue check out our
            <a href="/support">Frequently Answered Questions</a> or contact us
            at
            <a
              href="https://mail.google.com/mail/u/0/?view=cm&fs=1&to=vaflpcb@gmail.com"
              >vaflpcb@gmail.com</a
            >.
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
  data: () => ({}),
  components: { Appbar, Bottom },
};
</script>

<style scoped>
.v-list {
  margin-left: 20px;
}
h1,
p {
  padding: 15px;
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
  height: 200px;
  padding: 30px;
  margin-bottom: 30px;
}
</style>