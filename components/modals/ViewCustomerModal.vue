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
            <select 
              v-model="selectedStaff" 
              @change="assignStaff"
              class="staff-select"
            >
              <option value="">Unassigned</option>
              <option 
                v-for="staff in availableStaff" 
                :key="staff.name" 
                :value="staff.name"
              >
                {{ staff.name }}
              </option>
            </select>
          </div>
          <div class="input-wrapper">
            <label>Notes:</label>
            <textarea
              v-model="notes"
              placeholder="Add notes here..."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveNotes" class="action">Save Notes</button>
          <div class="spacer"></div>
          <button @click="$emit('close')" class="cancel">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Object,
      required: true,
      default: () => ({})
    },
    availableStaff: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      notes: '',
      showNotification: false,
      selectedStaff: ''
    }
  },
  watch: {
    customer: {
      immediate: true,
      handler(newCustomer) {
        this.notes = newCustomer.notes || ''
        this.selectedStaff = newCustomer.assignedStaff || ''
      }
    }
  },
  methods: {
    saveNotes() {
      this.$emit('update-notes', this.notes)
      this.showNotification = true
      setTimeout(() => {
        this.showNotification = false
      }, 1500)
    },
    assignStaff() {
      this.$emit('assign-staff', this.selectedStaff)
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return 'Not available'
      
      const date = new Date(timestamp)
      return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    }
  }
}
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

.action {
  padding: 10px 20px;
  text-transform: uppercase;
  border: 2px solid #d8f0fe;
  background: #0d54ff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.action:hover {
  background: white;
  color: #0d54ff;
}

.cancel {
  padding: 10px 20px;
  text-transform: uppercase;
  border: 2px solid #666;
  background: white;
  color: #666;
  font-weight: bold;
  cursor: pointer;
}

.cancel:hover {
  background: #666;
  color: white;
}

.spacer {
  flex: 1;
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
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>