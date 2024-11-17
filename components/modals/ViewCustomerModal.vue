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
            <label for="customerType">Customer Type:</label>
            <div class="readonly-display">{{ customer.customerType }}</div>
          </div>
          <div class="input-wrapper">
            <label for="customer">Customer Name:</label>
            <div class="readonly-display">{{ customer.name }}</div>
          </div>
          <div class="input-wrapper">
            <label for="contact">Contact Number:</label>
            <div class="readonly-display">{{ customer.contact }}</div>
          </div>
          <div class="input-wrapper">
            <label for="notes">Customer Notes:</label>
            <textarea 
              v-model="tempNotes" 
              id="notes"
              rows="3"
              class="editable-notes"
            ></textarea>
          </div>
          <div class="button-group">
            <button class="action" @click="saveNotes">Save Notes</button>
            <div class="spacer"></div>
            <button class="cancel" type="button" @click="closeModal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SaveNotification from '../SaveNotification.vue'

export default {
  name: "ViewCustomerModal",
  components: {
    SaveNotification
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Object,
      required: true,
      default: () => ({
        name: '',
        contact: '',
        notes: '',
        customerType: ''
      })
    }
  },
  data() {
    return {
      tempNotes: '',
      showNotification: false
    }
  },
  watch: {
    customer: {
      immediate: true,
      handler(newCustomer) {
        this.tempNotes = newCustomer.notes;
      }
    }
  },
  methods: {
    saveNotes() {
      this.$emit('update-notes', this.tempNotes);
      this.$emit('close');
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 1500);
      this.closeModal();
    },
    closeModal() {
      this.tempNotes = this.customer.notes;
      this.$emit('close');
    }
  }
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
  flex-grow: 1;
}
</style>