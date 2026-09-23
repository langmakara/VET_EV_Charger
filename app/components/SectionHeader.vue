<script setup lang="ts">
import Icon from '~/components/Icon/icon.vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  showViewAll: {
    type: Boolean,
    default: true
  }
});

defineEmits(['view-all']);
</script>

<template>
  <div class="section-header">
    <h2 class="title">{{ title }}</h2>
    <div v-if="showViewAll" class="view-all" @click="$emit('view-all')" role="button" tabindex="0">
      <span>View All</span>
      <Icon name="chevron-right" class="chevron-icon" size="16px" />
    </div>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 4px 12px 4px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1d2e;
  margin: 0;
}

.view-all {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e85d04;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.chevron-icon {
  color: #e85d04;
}
</style>
