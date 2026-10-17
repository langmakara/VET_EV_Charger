<script setup lang="ts">
 import { IonPage, IonContent } from '@ionic/vue'
 import history from '../membership/history.vue';
</script>

<template>
    <ion-page>
        <ion-content>
            <history data-source="chargingHistory" />
        </ion-content>
    </ion-page>
</template>

<style scoped>
    ion-page {
        padding: 0 !important;
    }
</style>