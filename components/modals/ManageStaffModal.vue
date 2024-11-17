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
              :class="{ 'error': showError && !newStaffName }"
              @keyup.enter="addStaffMember"
            >
            <button @click="addStaffMember" class="add-button">
              <span class="material-icons add-icon">add</span>
              <span>Add</span>
            </button>
          </div>
          <span class="error-message" v-if="showError && !newStaffName">
            Please enter staff name
          </span>

          <div class="staff-list-section">
            <div class="staff-list" v-if="staffList.length > 0">
              <div v-for="(staff, index) in staffList" 
                   :key="index" 
                   class="staff-item"
              >
                <div class="staff-info">
                  <span class="material-icons staff-icon">person</span>
                  <span class="staff-name">{{ staff.name }}</span>
                </div>
                <button @click="removeStaffMember(index)" class="delete-button">
                  <span class="material-icons">remove_circle</span>
                </button>
              </div>
            </div>
            
            <div v-else class="empty-state">
              No staff members added yet
            </div>
          </div>
        </div>
        <div class="modal-footer">
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
    staffList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      newStaffName: '',
      showError: false,
      showNotification: false
    }
  },
  methods: {
    addStaffMember() {
      if (!this.newStaffName) {
        this.showError = true
        return
      }
      this.$emit('add-staff', { name: this.newStaffName })
      this.newStaffName = ''
      this.showError = false
      this.showNotification = true
      setTimeout(() => {
        this.showNotification = false
      }, 1500)
    },
    removeStaffMember(index) {
      this.$emit('remove-staff', index)
    }
  }
}
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
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
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
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  text-align: center;
}

.cancel:hover {
  background-color: #e0e0e0;
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
</style> 