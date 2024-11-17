<template>
  <div class="layout-container">
    <AppHeader @openModal="showModal = true" />
    <WaitList :show-modal="showModal" @closeModal="showModal = false" />
  </div>
</template>

<script setup>
const showModal = ref(false)
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
}
</style>