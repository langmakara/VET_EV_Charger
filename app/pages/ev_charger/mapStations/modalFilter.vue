<script setup lang="ts">
  import { ref } from 'vue'
  import {
    IonModal,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton
  } from '@ionic/vue'
  import AppSelect from '~/components/Controls/AppSelect.vue'
  import SelectFloatControl from '~/components/Controls/FloatControl/SelectFloatControl.vue'
  import IconButton from '~/components/Button/IconButton.vue'

  const props = withDefaults(
    defineProps<{
      isOpen: boolean
    }>(),
    {
      isOpen: false
    }
  )

  const emit = defineEmits<{
    (e: 'close'): void
  }>()

  const selectedStatus = ref([])
  const selectedConnector = ref([])
  const selectedTags = ref([])
  const selectedPovince = ref([])

  const ChargerOptions = [
    { label: 'All Type', value: 'All' },
    { label: 'CCS2 (DC)', value: 'CCS2' },
    { label: 'GB/T (AC)', value: 'GBT' }
  ]

  const availabilityOptions = [
    { label: 'Available Now', value: 'available' },
    { label: 'Occupied', value: 'occupied' },
    { label: 'Out of Order', value: 'out' }
  ]

  const distanceOptions = [
    { label: 'Within 5km', value: '5' },
    { label: 'Within 10km', value: '10' },
    { label: 'Within 15km', value: '15' },
    { label: 'Within 20km', value: '20' },
    { label: 'Within 25km', value: '25' },
    { label: 'Any distance', value: 'Closed' }
  ]

  const povinceOptions = [
    { label: 'All Provinces', value: 'All' },
    { label: 'Phnom Penh', value: 'Phnom Penh' },
    { label: 'Banteay Meanchey', value: 'Banteay Meanchey' },
    { label: 'Battambang', value: 'Battambang' },
    { label: 'Kampong Cham', value: 'Kampong Cham' },
    { label: 'Kampong Chhnang', value: 'Kampong Chhnang' },
    { label: 'Kampong Speu', value: 'Kampong Speu' },
    { label: 'Kampong Thom', value: 'Kampong Thom' },
    { label: 'Kampot', value: 'Kampot' },
    { label: 'Kandal', value: 'Kandal' },
    { label: 'Kep', value: 'Kep' },
    { label: 'Koh Kong', value: 'Koh Kong' },
    { label: 'Kratie', value: 'Kratie' },
    { label: 'Mondulkiri', value: 'Mondulkiri' },
    { label: 'Oddar Meanchey', value: 'Oddar Meanchey' },
    { label: 'Pailin', value: 'Pailin' },
    { label: 'Preah Sihanouk', value: 'Preah Sihanouk' },
    { label: 'Preah Vihear', value: 'Preah Vihear' },
    { label: 'Prey Veng', value: 'Prey Veng' },
    { label: 'Pursat', value: 'Pursat' },
    { label: 'Ratanakiri', value: 'Ratanakiri' },
    { label: 'Siem Reap', value: 'Siem Reap' },
    { label: 'Stung Treng', value: 'Stung Treng' },
    { label: 'Svay Rieng', value: 'Svay Rieng' },
    { label: 'Takeo', value: 'Takeo' },
    { label: 'Tboung Khmum', value: 'Tboung Khmum' }
  ]
</script>

<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="emit('close')"
    mode="ios"
    :initial-breakpoint="0.60"
    :breakpoints="[0, 0.60, 1]"
  >
    <ion-header>
      <ion-toolbar class="header-filter">
        <ion-buttons slot="start">
          <ion-button  class="but-reset">Reset</ion-button>
        </ion-buttons>
        <ion-title>Filter</ion-title>
        <ion-buttons slot="end">
          <IconButton name="close" size="lg" @click="emit('close')" />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <SelectFloatControl
        v-model="selectedStatus"
        label="Charger Type"
        :options="ChargerOptions"
      />

      <SelectFloatControl
        v-model="selectedConnector"
        label="Availability"
        :options="availabilityOptions"
      />

      <SelectFloatControl
        v-model="selectedTags"
        label="Distance"
        :options="distanceOptions"
      />

      <SelectFloatControl
        v-model="selectedPovince"
        label="Province"
        :options="povinceOptions"
      />
    </ion-content>
  </ion-modal>
</template>


<style scoped>
.but-reset {
  --color: red; /* or hex like #ff4d4f or var(--ion-color-danger) */
  font-size: var(--app-font-size-title);
}
.header-filter {
    padding-top: var(--ion-padding);
    
}
</style>