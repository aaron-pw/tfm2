<template>
  <nav class="menu-strip">
    <NuxtLink to="/" class="menu-item">Floor Manager</NuxtLink>
    <button @click="$emit('openModal')" class="add-button">Add Customer</button>
  </nav>
</template>

<style scoped>
.menu-strip {
  background-color: #f5ede2;
  padding: 1rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item {
  color: #0d54ff;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2rem;
  margin-left: 1rem;
}

.add-button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  background-color: white;
  color: #0d54ff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.add-button:hover {
  background-color: #f0f0f0;
}
</style> 