<template>
  <div class="container">
    <Head>
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    </Head>
    <SaveNotification 
      :show="showRemoveNotification" 
      message="✕ Customer removed from queue" 
      type="error"
    />
    <AddCustomerModal 
      :is-open="showAddModal" 
      @close="$emit('closeModal')"
      @add-customer="addCustomer"
    />
    <ViewCustomerModal
      v-if="selectedCustomer"
      :is-open="showViewModal"
      :customer="selectedCustomer"
      @close="showViewModal = false"
      @update-notes="updateCustomerNotes"
    />
    <h2 class="wait-list-header">In-Store Queue</h2>
    <div v-if="waitList.length === 0" class="empty-queue">
      No customers in queue
    </div>
    <ul v-else>
      <li v-for="(queue, index) in waitList" :key="index">
        <div class="customer-row" @click="showCustomerNotes(queue)">
          <span class="customer-type-tag" :class="queue.customerType.toLowerCase()">
            {{ getCustomerTypeShort(queue.customerType) }}
          </span>
          <span class="customer-info">
            {{ queue.name }} ({{ queue.contact }})
          </span>
          <span class="time-elapsed-tag">
            {{ getTimeElapsed(queue.timestamp) }}
          </span>
          <button class="delete-button" @click.stop="onRemove(index)">
            <span class="material-icons">remove_circle</span>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import AddCustomerModal from './modals/AddCustomerModal.vue'
import ViewCustomerModal from './modals/ViewCustomerModal.vue'
import SaveNotification from './SaveNotification.vue'

export default {
  name: "WaitList",
  components: {
    AddCustomerModal,
    ViewCustomerModal,
    SaveNotification
  },
  props: {
    showModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      waitList: [],
      showViewModal: false,
      selectedCustomer: null,
      showRemoveNotification: false,
      timer: null,
    };
  },
  computed: {
    showAddModal() {
      return this.showModal;
    }
  },
  mounted() {
    this.timer = setInterval(() => {
      this.$forceUpdate();
    }, 1000);
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    addCustomer(customer) {
      this.waitList.push(customer);
      this.$emit('closeModal');
    },
    showCustomerNotes(customer) {
      this.selectedCustomer = customer;
      this.showViewModal = true;
    },
    updateCustomerNotes(newNotes) {
      if (this.selectedCustomer) {
        const index = this.waitList.findIndex(c => c === this.selectedCustomer);
        if (index !== -1) {
          this.waitList[index] = {
            ...this.selectedCustomer,
            notes: newNotes
          };
        }
      }
    },
    onRemove(index) {
      this.waitList.splice(index, 1);
      this.showRemoveNotification = true;
      setTimeout(() => {
        this.showRemoveNotification = false;
      }, 1500);
    },
    getCustomerTypeShort(type) {
      return type.charAt(0);
    },
    getTimeElapsed(timestamp) {
      if (!timestamp) return '';
      
      const added = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - added) / 1000);
      
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;
      
      let timeString = '';
      if (hours > 0) {
        timeString += `${hours}h `;
      }
      if (minutes > 0 || hours > 0) {
        timeString += `${minutes}m `;
      }
      timeString += `${seconds}s`;
      
      return timeString;
    },
  },
};
</script>

<style scoped>
:global(body) {
  margin: 0;
  overflow: hidden; /* Prevents browser scrollbar */
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Prevents container scrollbar */
}

.wait-list-header {
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  margin-top: 0.5rem;
}

ul {
  list-style: none;
  padding: 0 1rem 0 0;
  margin: 0;
  overflow-y: auto; /* Keeps customer list scrollbar */
  flex: 1;
  max-height: calc(100vh - 100px);
}

ul::-webkit-scrollbar {
  width: 8px;
}

ul::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

ul::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

ul::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.customer-row {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 8px;
}

.customer-row:hover {
  background-color: #e3e3e3;
}

.customer-info {
  margin-right: 4px;
  font-size: 1.2rem;
}

.delete-button {
  background: none;
  border: none;
  color: #f96449;
  cursor: pointer;
  padding: 2px;
  display: inline-flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete-button .material-icons {
  font-size: 2.25rem;
}

.delete-button:hover {
  opacity: 1;
}

.note-indicator {
  margin-left: 8px;
  font-size: 0.9em;
}

.empty-queue {
  color: #666;
  font-style: italic;
  margin-top: 1rem;
}

.customer-type-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-right: 8px;
  min-width: 25px;
  text-align: center;
}

.customer-type-tag.vip {
  background-color: #ffd700;
  color: #000;
}

.customer-type-tag.consumer {
  background-color: #90caf9;
  color: #000;
}

.customer-type-tag.business {
  background-color: #81c784;
  color: #000;
}

li {
  margin-bottom: 8px;
}

li:last-child {
  margin-bottom: 0;
}

.time-elapsed-tag {
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
  margin-left: auto;
  margin-right: 8px;
}
</style>