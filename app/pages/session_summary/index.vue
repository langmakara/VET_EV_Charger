<script setup lang="ts">
import AppButton from '~/components/Button/AppButton.vue';
import Icon from '~/components/Icon/icon.vue';
import { abaBridge } from '~/composables/useNativeBridge';

 const handleBackToHome = () => {
    abaBridge.backToHomePage()
 }


</script>

<template>
    <ion-page>
        <ion-content>
            <div class="header-summary">
                <Icon name="info" size="64px" color="red" />
            </div>
            <h3 class="header-Title">Charging stopped</h3>

            <div class="list">
                <div>
                    <h4 >Your payment</h4>
                    <ion-item>
                        <ion-label color="medium">Pre-authorised amount</ion-label>
                        <ion-note slot="end" color="primary">40000 KHR</ion-note>
                    </ion-item>
                    <ion-item>
                        <ion-label color="medium">Final charging cost</ion-label>
                        <ion-note slot="end" color="primary">20000 KHR</ion-note>
                    </ion-item>
                    <ion-item lines="none" class="lastRow">
                        <ion-label color="medium">Unused amount</ion-label>
                        <ion-note slot="end" color="primary">22000 KHR</ion-note>
                    </ion-item>
                </div>
            </div>
            <ion-item lines="none" class="lastRow">
                <ion-label color="medium">Estimated Final Cost</ion-label>
                <ion-note slot="end" color="dark" class="FinalCost" >20,000 KHR</ion-note>
            </ion-item>
        </ion-content>
        <ion-footer class="footer-btn">
            <AppButton label="Back to Homescreen" color="primary" fill="outline" class="custom-outline" expand="block" @click="handleBackToHome" />
        </ion-footer>
    </ion-page>
</template>

<style scoped>
ion-item{
    --padding-start: 0;
    --inner-padding-end: 0;
}
.header-summary {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
}

.header-Title {
    width: 100%;
    height: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 40px;
}

.list {
    border: 1px solid #e2e8f0;
    padding: var(--ion-padding);
    border-radius: var(--ion-padding);
}

.lastRow {
    --inner-border-width: 0;
    --border-width: 0;
}

ion-note {
    font-size: 14px;
}
ion-label {
    font-size: 14px;
}
.footer-btn {
    --background: transparent;
    padding: 16px;
    box-shadow: none;
}

.custom-outline::part(native) {
  color: var(--ion-color-primary);           /* your custom text color */
  border-radius: 10px;
  border: 1px solid #64748b;
}

.FinalCost {
    font-size: 20px;
}
</style>