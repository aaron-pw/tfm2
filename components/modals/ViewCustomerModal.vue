<template>
  <div>
    <SaveNotification :show="showNotification" message="✓ Notes saved successfully" />
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>View Customer</h2>
        </div>
        <div class="modal-body">
          <div class="input-wrapper">
            <label>Time Added:</label>
            <div class="readonly-display">{{ formatTimestamp(customer.timestamp) }}</div>
          </div>
          <div class="input-wrapper">
            <label>Queue Category:</label>
            <div class="readonly-display">{{ customer.category }}</div>
          </div>
          <div class="input-wrapper">
            <label>Customer Type:</label>
            <div class="readonly-display">{{ customer.customerType }}</div>
          </div>
          <div class="input-wrapper">
            <label>Customer Name:</label>
            <div class="readonly-display">{{ customer.name }}</div>
          </div>
          <div class="input-wrapper">
            <label>Contact Number:</label>
            <div class="readonly-display">{{ customer.contact }}</div>
          </div>
          <div class="input-wrapper">
            <label>Assigned Staff:</label>
            <select v-model="selectedStaffId" class="staff-select" @change="assignStaff">
              <option value="">Unassigned</option>
              <option v-for="staff in availableStaff" :key="staff.id" :value="staff.id">
                {{ staff.name }}
              </option>
            </select>
          </div>
          <div class="input-wrapper">
            <label>Notes:</label>
            <textarea v-model="notes" placeholder="Add notes here..." rows="3"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <div class="button-container">
            <button class="button action" @click="saveNotes">Save Notes</button>
            <div class="spacer"></div>
            <button class="button cancel" @click="$emit('close')">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Customer, Staff } from '~/types';

const props = defineProps<{
  isOpen: boolean;
  customer: Customer;
  availableStaff: Staff[];
}>();

const emit = defineEmits<{
  close: [];
  'update-notes': [notes: string];
  'assign-staff': [staffId: string];
}>();

const notes = ref('');
const showNotification = ref(false);
const selectedStaffId = ref('');

watch(
  () => props.customer,
  (newCustomer) => {
    notes.value = newCustomer.notes || '';
    // Find the staff member by name and use their ID
    const staffMember = props.availableStaff.find((s) => s.name === newCustomer.assignedStaff);
    selectedStaffId.value = staffMember?.id || '';
  },
  { immediate: true }
);

const saveNotes = () => {
  emit('update-notes', notes.value);
  showNotification.value = true;
  setTimeout(() => {
    showNotification.value = false;
  }, 1500);
  // Close the modal
  emit('close');
};

const assignStaff = () => {
  if (selectedStaffId.value) {
    emit('assign-staff', selectedStaffId.value);
  }
};

const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return 'Not available';

  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  padding: 0;
}

.modal-header {
  background-color: #f5ede2;
  padding: 1rem 2rem;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.modal-header h2 {
  color: #0d54ff;
  margin: 0;
  font-size: 1.5rem;
}

.modal-body {
  padding: 2rem;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.input-wrapper label {
  text-align: left;
  margin-bottom: 0.5rem;
}

.readonly-display {
  height: 30px;
  padding: 5px 10px;
  font-size: 1.25rem;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #666;
  display: flex;
  align-items: center;
  user-select: none;
}

.editable-notes {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
}

.editable-notes:focus {
  outline: none;
  border-color: #6ccbfe;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  margin-top: 2rem;
}

.button {
  flex: 1;
  height: 40px;
  padding: 0 2rem;
  min-width: 150px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.action {
  background-color: #0d54ff;
  color: white;
}

.action:hover {
  background: white;
  color: #0d54ff;
  box-shadow: inset 0 0 0 2px #0d54ff;
}

.cancel {
  background-color: #bebebe;
  color: #333;
}

.cancel:hover {
  background: #666;
  color: white;
}

.spacer {
  display: none;
}

.staff-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.staff-select:focus {
  outline: none;
  border-color: #0d54ff;
}

.modal-footer {
  padding: 1rem 2rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
  background-color: #f5f5f5;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.button-container {
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: space-between;
  padding: 0 2rem;
}

.button {
  height: 40px;
  padding: 0 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  min-width: 120px;
}
</style>
