<template>
  <div>
    <SaveNotification :show="showNotification" message="✓ Staff list updated" />
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Manage Staff</h2>
          <span class="material-icons header-icon">groups</span>
        </div>
        <div class="modal-body">
          <div class="input-row">
            <input
              v-model="newStaffName"
              type="text"
              placeholder="Enter staff name"
              :class="{ error: showError && !newStaffName }"
              @keyup.enter="addStaffMember"
            />
            <button class="add-button" @click="addStaffMember">
              <span class="material-icons add-icon">add</span>
              <span>Add</span>
            </button>
          </div>
          <span v-if="showError && !newStaffName" class="error-message"> Please enter staff name </span>

          <div class="staff-list-section">
            <div v-if="staffList.length > 0" class="staff-list">
              <div v-for="staff in staffList" :key="staff.id" class="staff-item">
                <div class="staff-info">
                  <span class="material-icons staff-icon">person</span>
                  <span class="staff-name">{{ staff.name }}</span>
                </div>
                <div class="staff-time" :class="{ serving: staff.servingCustomer, lunch: staff.onLunch }">
                  <template v-if="staff.servingCustomer">
                    Serving: {{ getCustomerName(staff.servingCustomer) }}
                    <span class="serving-time">{{ getTimeElapsed(staff.servingStartTime) }}</span>
                  </template>
                  <template v-else-if="staff.onLunch"> On Break: {{ getTimeElapsed(staff.lunchStartTime) }} </template>
                  <template v-else> Ready: {{ getTimeElapsed(staff.readyTimestamp) }} </template>
                </div>
                <div class="staff-actions">
                  <button
                    class="action-button lunch-button"
                    :title="staff.onLunch ? 'End Break' : 'Start Break'"
                    :disabled="staff.servingCustomer"
                    @click="toggleLunchBreak(staff)"
                  >
                    <span class="material-icons" :class="{ 'on-lunch': staff.onLunch }">local_cafe</span>
                  </button>
                  <button class="delete-button" @click="confirmStaffRemoval(staff)">
                    <span class="material-icons">remove_circle</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">No staff members added yet</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel" @click="$emit('close')">Close</button>
        </div>
      </div>
    </div>
    <ConfirmModal
      :is-open="showConfirmModal"
      title="Remove Staff Member"
      :message="getRemovalMessage()"
      @confirm="confirmRemove"
      @cancel="cancelRemove"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useQueue } from '~/composables/useQueue';
import type { Staff } from '~/types';
import ConfirmModal from './ConfirmModal.vue';

const props = defineProps<{
  isOpen: boolean;
  staffList: Staff[];
}>();

const { waitList } = useQueue();

const emit = defineEmits<{
  close: [];
  'add-staff': [staff: Omit<Staff, 'id'>];
  'remove-staff': [staffId: string];
  'toggle-lunch': [staffId: string];
}>();

const newStaffName = ref('');
const showError = ref(false);
const showNotification = ref(false);
const timer = ref<NodeJS.Timer | null>(null);
const showConfirmModal = ref(false);
const staffToRemove = ref<Staff | null>(null);
const updateTimestamps = ref(0);

const startTimer = () => {
  timer.value = setInterval(() => {
    if (props.isOpen) {
      updateTimestamps.value++;
    }
  }, 1000);
};

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

onMounted(() => {
  if (props.isOpen) {
    startTimer();
  }
});

onUnmounted(() => {
  stopTimer();
});

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      startTimer();
    } else {
      stopTimer();
    }
  }
);

const addStaffMember = () => {
  if (!newStaffName.value) {
    showError.value = true;
    return;
  }

  emit('add-staff', {
    name: newStaffName.value,
    ready_timestamp: new Date().toISOString(),
    serving_customer: null,
    serving_start_time: null,
  });

  newStaffName.value = '';
  showError.value = false;
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 1500);
};

const confirmStaffRemoval = (staff: Staff) => {
  staffToRemove.value = staff;
  showConfirmModal.value = true;
};

const getRemovalMessage = () => {
  if (!staffToRemove.value) return '';

  if (staffToRemove.value.serving_customer) {
    const customerName = getCustomerName(staffToRemove.value.serving_customer);
    return `${staffToRemove.value.name} is currently serving ${customerName}. Are you sure you want to remove them?`;
  }

  return `Are you sure you want to remove ${staffToRemove.value.name}?`;
};

const confirmRemove = () => {
  if (staffToRemove.value) {
    emit('remove-staff', staffToRemove.value.id);
  }
  showConfirmModal.value = false;
  staffToRemove.value = null;
};

const cancelRemove = () => {
  showConfirmModal.value = false;
  staffToRemove.value = null;
};

const getCustomerName = (customerId: string) => {
  const customer = waitList.value.find((c) => c.id === customerId);
  return customer ? customer.name : 'Unknown';
};

const getTimeElapsed = (timestamp: string | null) => {
  const _ = updateTimestamps.value;

  if (!timestamp) return '0m';

  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);

  let timeString = '';
  if (hours > 0) {
    timeString += `${hours}h `;
  }
  timeString += `${minutes}m`;

  return timeString;
};

const toggleLunchBreak = (staff: Staff) => {
  if (staff.serving_customer) {
    // If staff is serving someone, don't allow lunch break
    return;
  }
  emit('toggle-lunch', staff.id);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background-color: #f5ede2;
  padding: 1.5rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #0d54ff;
}

.header-icon {
  font-size: 24px;
  color: #0d54ff;
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.staff-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

.staff-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 150px;
}

.staff-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
}

.staff-name {
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.delete-button {
  background: none;
  border: none;
  color: #f96449;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
  width: 20px;
  display: flex;
  justify-content: center;
}

.delete-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
}

.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 0.5rem;
}

input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.error {
  border-color: #f96449;
}

.staff-list-section {
  margin-top: 2rem;
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}

.cancel {
  padding: 0.5rem 2rem;
  min-width: 150px;
  background-color: #bebebe;
  border: none;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  text-align: center;
}

.cancel:hover {
  background: #666;
  color: white;
}

.add-button {
  background-color: #0d54ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
}

.staff-time {
  color: #666;
  font-size: 0.9em;
  margin-left: auto;
  margin-right: 1rem;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 120px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.staff-time.serving {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.staff-time.lunch {
  background: #fff3e0;
  color: #ff9800;
  font-weight: 500;
}

.serving-time {
  font-size: 0.8em;
  opacity: 0.8;
}

.staff-actions {
  display: flex;
  align-items: center;
  margin-left: 2px;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  opacity: 0.7;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  width: 20px;
  justify-content: center;
}

.lunch-button {
  color: #795548;
  margin-right: -40px;
  margin-left: -10px;
}

.lunch-button:hover {
  opacity: 1;
}

.lunch-button .on-lunch {
  color: #ff9800;
  transform: rotate(15deg);
  transition: transform 0.3s ease;
}

.lunch-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
