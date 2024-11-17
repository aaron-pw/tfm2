<template>
  <div>
    <Head>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    </Head>
    <nav class="menu-strip">
      <div class="left-section">
        <h2 class="menu-item">Floor Manager</h2>
      </div>
      <div class="right-section">
        <button @click="$emit('openStaffModal')" class="manage-staff-button">Manage Staff</button>
        <button @click="$emit('openModal')" class="add-button">Add Customer</button>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  emits: ['openModal', 'openStaffModal']
}
</script>

<style scoped>
.menu-strip {
  background-color: #f5ede2;
  padding: 1rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-section {
  display: flex;
  align-items: center;
}

.menu-item {
  color: #0d54ff;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0;
}

.right-section {
  display: flex;
  gap: 10px;
}

.add-button, .manage-staff-button {
  padding: 0.5rem 1rem;
  background-color: white;
  color: #0d54ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover, .manage-staff-button:hover {
  background-color: #f0f0f0;
}
</style> 