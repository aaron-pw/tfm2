<template>
  <Transition name="slide-fade">
    <div v-if="show" class="notification" :class="type">
      <span class="notification-text">{{ message }}</span>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'SaveNotification',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success'
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  z-index: 1000;
}

.success {
  background-color: #4CAF50;
}

.error {
  background-color: #f44336;
}

.notification-text {
  font-size: 0.95rem;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-50%) translateY(-10px);
  opacity: 0;
}
</style> 