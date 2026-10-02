<script setup lang="ts">
  import AppInputField from '~/components/Controls/AppInputField.vue'
  import { IonCol, IonGrid, IonRow } from '@ionic/vue'
import IconButton from '~/components/Button/IconButton.vue';
</script>

<template>
  <ion-page>
    <ion-content>
      <ion-grid columns="2" class="voucher-grid">
        <ion-row>
          <ion-col>
            <AppInputField label="Enter or scan voucher code" placeholder="Code" />
          </ion-col>
          <ion-col size="auto" class="btn-container">
            <IconButton buttonType="scan" size="lg" />
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.btn-container {
  display: flex;
  align-items: flex-end;
  padding-bottom: 2px;
}

</style>
