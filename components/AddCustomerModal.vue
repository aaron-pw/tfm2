<template>
  <div>
    <SaveNotification :show="showNotification" message="✓ Customer added to queue" />
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add new customer</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="onSubmit">
            <div class="input-wrapper">
              <label for="customer">Customer Name:</label>
              <input 
                v-model="customer" 
                id="customer" 
                name="customer"
                :class="{ 'error': showError && !customer }"
              />
              <span class="error-message" v-if="showError && !customer">
                Please enter a customer name
              </span>
            </div>
            <div class="input-wrapper">
              <label for="contact">Contact Number:</label>
              <input 
                v-model="contact" 
                id="contact" 
                name="contact" 
                type="tel"
                :class="{ 'error': showError && !contact }"
              />
              <span class="error-message" v-if="showError && !contact">
                Please enter a contact number
              </span>
            </div>
            <div class="input-wrapper">
              <label for="notes">Customer Notes:</label>
              <textarea 
                v-model="notes" 
                id="notes" 
                name="notes"
                rows="3"
              ></textarea>
            </div>
            <div class="button-group">
              <button class="action" type="submit">Add to Queue</button>
              <div class="spacer"></div>
              <button class="cancel" type="button" @click="closeModal">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SaveNotification from './SaveNotification.vue'

export default {
  name: "AddCustomerModal",
  components: {
    SaveNotification
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      customer: "",
      contact: "",
      notes: "",
      showError: false,
      showNotification: false
    };
  },
  methods: {
    onSubmit() {
      if (!this.customer || !this.contact) {
        this.showError = true;
        return;
      }
      
      this.$emit('add-customer', {
        name: this.customer,
        contact: this.contact,
        notes: this.notes
      });
      this.$emit('close');
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 1500);
      this.closeModal();
    },
    closeModal() {
      this.customer = "";
      this.contact = "";
      this.notes = "";
      this.showError = false;
      this.$emit('close');
    }
  },
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

.input-wrapper input {
  height: 30px;
  padding: 5px 10px;
  font-size: 1.25rem;
  border: 1px solid #ccc;
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

.cancel {
  padding: 10px 20px;
  text-transform: uppercase;
  border: 2px solid #666;
  background: white;
  color: #666;
  font-weight: bold;
  cursor: pointer;
}

.action:hover {
  background: white;
  color: #0c80c4;
}

.cancel:hover {
  background: #666;
  color: white;
}

.spacer {
  flex-grow: 1;
}

.input-wrapper input.error {
  border: 2px solid #f96449;
}

.error-message {
  color: #f96449;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  text-align: left;
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

textarea {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  min-height: 80px;
}

textarea:focus {
  outline: none;
  border-color: #6ccbfe;
}
</style> 