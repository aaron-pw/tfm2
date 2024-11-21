<template>
  <div class="layout-container">
    <AppHeader
      @open-modal="handleOpenModal"
      @open-staff-modal="handleOpenStaffModal"
      @add-test-data="handleAddTestData"
    />
    <div class="page-container">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import AppHeader from '~/components/AppHeader.vue';
import type { Customer, Staff } from '~/types';

const modalState = useState('modalState', () => ({
  showModal: false,
  showStaffModal: false,
}));

const handleOpenModal = () => {
  modalState.value.showModal = true;
};

const handleOpenStaffModal = () => {
  modalState.value.showStaffModal = true;
};

const handleAddTestData = (data: { customers: Customer[]; staff: Staff[] }) => {
  useState('testData', () => data);
};

// Provide the modal state to child components
provide('modalState', modalState);
</script>

<style>
.layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
  z-index: 1;
}

.page-container {
  flex: 1;
  position: relative;
  z-index: 1;
}

/* Ensure modals appear above everything */
.modal-overlay {
  z-index: 9999999 !important;
}

.modal-content {
  z-index: 10000000 !important;
}
</style>
