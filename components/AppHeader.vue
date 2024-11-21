<template>
  <div>
    <Head>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    </Head>
    <nav class="menu-strip">
      <div class="left-section">
        <h2 class="menu-item">Floor Manager</h2>
      </div>
      <div class="right-section">
        <!-- <DevTools @add-test-data="handleTestData" /> -->
        <button class="manage-staff-button" @click="$emit('openStaffModal')">Manage Staff</button>
        <button class="add-button" @click="$emit('openModal')">Add Customer</button>
      </div>
    </nav>
  </div>
</template>

<script>
import DevTools from './dev/DevTools.vue';
export default {
  name: 'AppHeader',
  components: { DevTools },
  emits: ['openModal', 'openStaffModal', 'add-test-data'],
  methods: {
    handleTestData(data) {
      this.$emit('add-test-data', data);
    },
  },
};
</script>
