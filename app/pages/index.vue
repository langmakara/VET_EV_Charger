<script setup lang="ts">
import IconButton from "~/components/Button/IconButton.vue";
import EvChargerPage from "./ev_charger/index.vue";
</script>

<template>
  <ion-page>
    <ion-content>
      <EvChargerPage />
    </ion-content>
    <ion-footer class="scan-QR">
      <div class="scan-QR__container">
        <div class="scan-QR__fab">
          <IconButton
            button-type="qr-code"
            colorScheme="brand"
            style="
              --border-radius: 50%;
              --box-shadow: 0 0 0 6px #ffffff;
              --padding-start: 14px;
              --padding-end: 14px;
              --padding-top: 14px;
              --padding-bottom: 14px;
              --height: 64px;
              font-size: 1.6rem;
            "
          />
        </div>
      </div>
    </ion-footer>
  </ion-page>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--ion-color-medium);
}

/* ion-footer: transparent + allow button to poke out */
.scan-QR {
  --background: transparent;
  padding: 0;
}

/* plain div = full CSS control, no Shadow DOM clipping */
.scan-QR__container {
  background-color: var(--ion-color-primary);
  display: flex;
  justify-content: center;
  overflow: visible;
  padding-top: 0;
  padding-bottom: 10px;
}

/* pull button upward so it floats above the orange bar */
.scan-QR__fab {
  margin-top: -32px;
}
</style>
