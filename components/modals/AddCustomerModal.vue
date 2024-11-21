<template>
  <div>
    <SaveNotification :show="showNotification" message="✓ Customer added to queue" />
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add customer to queue</h2>
        </div>
        <div class="modal-body">
          <form @submit.prevent="onSubmit">
            <div class="input-wrapper">
              <label for="category">Queue Category:</label>
              <select id="category" v-model="category" name="category" :class="{ error: showError && !category }">
                <option value="">Select queue category</option>
                <option value="Mobiles & Tablets">Mobiles & Tablets</option>
                <option value="Pre-Paid">Pre-Paid</option>
                <option value="Internet">Internet</option>
                <option value="Accessories">Accessories</option>
                <option value="Account Help">Account Help</option>
                <option value="Tech Help">Tech Help</option>
              </select>
              <span v-if="showError && !category" class="error-message"> Please select a queue category </span>
            </div>
            <div class="input-wrapper">
              <label for="customerType">Customer Type:</label>
              <select
                id="customerType"
                v-model="customerType"
                name="customerType"
                :class="{ error: showError && !customerType }"
              >
                <option value="">Select customer type</option>
                <option value="VIP">VIP</option>
                <option value="Consumer">Consumer</option>
                <option value="Business">Business</option>
              </select>
              <span v-if="showError && !customerType" class="error-message"> Please select a customer type </span>
            </div>
            <div class="input-wrapper">
              <label for="customer">Customer Name:</label>
              <input id="customer" v-model="customer" name="customer" :class="{ error: showError && !customer }" />
              <span v-if="showError && !customer" class="error-message"> Please enter a customer name </span>
            </div>
            <div class="input-wrapper">
              <label for="contact">Contact Number:</label>
              <input
                id="contact"
                v-model="contact"
                name="contact"
                type="tel"
                :class="{ error: showError && !contact }"
              />
              <span v-if="showError && !contact" class="error-message"> Please enter a contact number </span>
            </div>
            <div class="input-wrapper">
              <label for="notes">Customer Notes:</label>
              <textarea id="notes" v-model="notes" name="notes" rows="3"></textarea>
            </div>
            <div class="input-wrapper">
              <label>Customer Appearance:</label>
              <div class="appearance-section">
                <div v-if="!selectedClothingForColor" class="clothing-type">
                  <button
                    v-for="item in clothingTypes"
                    :key="item"
                    :class="['appearance-tag', { active: selectedOutfits.some((outfit) => outfit.type === item) }]"
                    @click.prevent="selectClothing(item)"
                  >
                    {{ item }}
                  </button>
                </div>
                <div v-else class="clothing-colors">
                  <div class="color-selection-header">
                    <span>Select color for {{ selectedClothingForColor }}</span>
                    <button class="back-button" @click.prevent="selectedClothingForColor = null">← Back</button>
                  </div>
                  <div class="colors-grid">
                    <div
                      v-for="color in colors"
                      :key="color.name"
                      class="color-swatch"
                      :style="{ backgroundColor: color.hex }"
                      :title="color.name"
                      @click="selectColor(color)"
                    >
                      <span v-if="color.hex === '#ffffff'" class="white-swatch"></span>
                    </div>
                  </div>
                </div>
                <div v-if="selectedOutfits.length > 0" class="selected-outfits">
                  <div
                    v-for="outfit in selectedOutfits"
                    :key="`${outfit.type}-${outfit.color}`"
                    class="outfit-tag"
                    :style="{ backgroundColor: outfit.hex, color: isLightColor(outfit.hex) ? '#333' : 'white' }"
                  >
                    {{ outfit.type }}
                    <button
                      class="remove-outfit"
                      :style="{ color: isLightColor(outfit.hex) ? '#666' : 'rgba(255,255,255,0.8)' }"
                      @click.prevent="removeOutfit(outfit)"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
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
import SaveNotification from '../SaveNotification.vue';

export default {
  name: 'AddCustomerModal',
  components: {
    SaveNotification,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      customer: '',
      contact: '',
      notes: '',
      customerType: '',
      category: '',
      showError: false,
      showNotification: false,
      selectedClothingForColor: null,
      selectedOutfits: [],
      clothingTypes: ['Shirt', 'Pants', 'Dress', 'Hat'],
      colors: [
        { name: 'Red', hex: '#ff4444' },
        { name: 'Blue', hex: '#4444ff' },
        { name: 'Green', hex: '#44aa44' },
        { name: 'Black', hex: '#333333' },
        { name: 'White', hex: '#ffffff' },
        { name: 'Yellow', hex: '#ffff44' },
        { name: 'Pink', hex: '#ff44ff' },
        { name: 'Purple', hex: '#9944ff' },
        { name: 'Orange', hex: '#ff8844' },
        { name: 'Brown', hex: '#8b4513' },
      ],
    };
  },
  methods: {
    onSubmit() {
      if (!this.customer || !this.contact || !this.customerType || !this.category) {
        this.showError = true;
        return;
      }

      this.$emit('add-customer', {
        name: this.customer,
        contact: this.contact,
        notes: this.notes,
        customerType: this.customerType,
        category: this.category,
        timestamp: new Date().toISOString(),
        appearance: {
          outfits: this.selectedOutfits,
        },
      });
      this.$emit('close');
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 1500);
      this.closeModal();
    },
    closeModal() {
      this.customer = '';
      this.contact = '';
      this.notes = '';
      this.customerType = '';
      this.category = '';
      this.showError = false;
      this.selectedClothingForColor = null;
      this.selectedOutfits = [];
      this.$emit('close');
    },
    selectClothing(item) {
      this.selectedClothingForColor = item;
    },
    selectColor(color) {
      this.selectedOutfits.push({
        type: this.selectedClothingForColor,
        color: color.name,
        hex: color.hex,
      });
      this.selectedClothingForColor = null;
    },
    removeOutfit(outfit) {
      this.selectedOutfits = this.selectedOutfits.filter((o) => !(o.type === outfit.type && o.color === outfit.color));
    },
    isLightColor(hex) {
      const c = hex.substring(1);
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 127.5;
    },
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

.action:hover {
  background: white;
  color: #0d54ff;
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

select {
  height: 42px;
  padding: 5px 10px;
  font-size: 1.25rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
}

select.error {
  border: 2px solid #f96449;
}

.appearance-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.clothing-type,
.clothing-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.appearance-tag,
.color-tag {
  padding: 4px 12px;
  border-radius: 16px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.appearance-tag.active {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.color-tag {
  color: white;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  border: none;
}

.color-tag[style*='background-color: #ffffff'] {
  color: #333;
  text-shadow: none;
  border: 1px solid #ccc;
}

.color-tag.active {
  transform: scale(0.9);
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px #2196f3;
}

.color-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
}

.back-button {
  padding: 4px 8px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.back-button:hover {
  background: #e0e0e0;
}

.selected-outfits {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.outfit-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 16px;
  border: 2px solid;
  background: white;
  font-size: 0.9rem;
}

.remove-outfit {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 4px;
  font-size: 1.1rem;
}

.remove-outfit:hover {
  color: #f96449;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  border: none;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.white-swatch {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid #ccc;
  border-radius: 50%;
}

.color-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
