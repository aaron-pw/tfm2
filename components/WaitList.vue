<template>
  <div>
    <AppHeader 
      @openModal="showModal = true"
      @openStaffModal="showStaffModal = true"
      @add-test-data="addTestCustomers"
    />
    <div class="container">
      <SaveNotification 
        :show="showRemoveNotification" 
        message="✕ Customer removed from queue" 
        type="error"
      />
      <AddCustomerModal 
        :is-open="showModal" 
        @close="showModal = false"
        @add-customer="addCustomer"
      />
      <ViewCustomerModal
        v-if="selectedCustomer"
        :is-open="showViewModal"
        :customer="selectedCustomer"
        :available-staff="staffList"
        @close="showViewModal = false"
        @update-notes="updateCustomerNotes"
        @assign-staff="assignStaffToCustomer"
      />
      <ManageStaffModal
        :is-open="showStaffModal"
        :staff-list="staffList"
        @close="showStaffModal = false"
        @add-staff="addStaffMember"
        @remove-staff="removeStaffMember"
      />
      <div class="header-section">
        <h2 class="wait-list-header">In-Store Queue</h2>
        <button @click="toggleContacts" class="toggle-button">
          <span class="material-icons">{{ hideContacts ? 'visibility_off' : 'visibility' }}</span>
          {{ hideContacts ? 'Show Contacts' : 'Hide Contacts' }}
        </button>
      </div>
      <div v-if="waitList.length === 0" class="empty-queue">
        No customers in queue
      </div>
      <ul v-else>
        <template v-for="(queue, index) in sortedWaitList" :key="index">
          <li>
            <div class="customer-row" @click="showCustomerNotes(queue)">
              <span 
                class="customer-type-tag" 
                :class="queue.customerType.toLowerCase()"
                :title="queue.customerType"
              >
                {{ getCustomerTypeShort(queue.customerType) }}
              </span>
              <span 
                class="category-tag" 
                :class="getCategoryClass(queue.category)"
                :title="queue.category"
              >
                {{ getCategoryShort(queue.category) }}
              </span>
              <span class="customer-info">
                {{ queue.name }}{{ !hideContacts ? ` (${queue.contact})` : '' }}
                <span v-if="queue.assignedStaff" class="assigned-staff">
                  • Assigned to {{ queue.assignedStaff }}
                </span>
              </span>
              <span class="time-elapsed-tag">
                <template v-if="queue.assignedStaff">
                  Serving: {{ getTimeElapsed(queue.timestamp, queue.servedTimestamp) }}
                </template>
                <template v-else>
                  Waiting: {{ getTimeElapsed(queue.timestamp) }}
                </template>
              </span>
              <button class="delete-button" @click.stop="onRemove(queue)">
                <span class="material-icons">remove_circle</span>
              </button>
            </div>
          </li>
          <div v-if="shouldShowDivider(index)" class="vip-divider"></div>
        </template>
      </ul>
    </div>
  </div>
</template>

<script>
import AddCustomerModal from './modals/AddCustomerModal.vue'
import ViewCustomerModal from './modals/ViewCustomerModal.vue'
import SaveNotification from './SaveNotification.vue'
import AppHeader from './AppHeader.vue'
import ManageStaffModal from './modals/ManageStaffModal.vue'
import DevTools from './dev/DevTools.vue'

export default {
  name: "WaitList",
  components: {
    AddCustomerModal,
    ViewCustomerModal,
    SaveNotification,
    AppHeader,
    ManageStaffModal,
    DevTools
  },
  data() {
    return {
      waitList: [],
      showModal: false,
      showViewModal: false,
      showStaffModal: false,
      selectedCustomer: null,
      showRemoveNotification: false,
      staffList: [],
      hideContacts: false
    };
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
  computed: {
    sortedWaitList() {
      return [...this.waitList].sort((a, b) => {
        if (a.customerType === 'VIP' && b.customerType !== 'VIP') return -1;
        if (a.customerType !== 'VIP' && b.customerType === 'VIP') return 1;
        return 0;
      });
    }
  },
  methods: {
    addCustomer(customer) {
      this.waitList.push({
        ...customer,
        timestamp: new Date().toISOString()
      })
      this.showModal = false
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
    onRemove(customer) {
      const index = this.waitList.findIndex(c => 
        c.name === customer.name && 
        c.timestamp === customer.timestamp
      );
      
      if (index !== -1) {
        this.waitList.splice(index, 1);
        this.showRemoveNotification = true;
        setTimeout(() => {
          this.showRemoveNotification = false;
        }, 1500);
      }
    },
    getCustomerTypeShort(type) {
      return type.charAt(0);
    },
    getTimeElapsed(timestamp, servedTimestamp) {
      if (!timestamp) return '';
      
      const added = new Date(timestamp);
      const now = new Date();
      let diffInSeconds;
      
      if (servedTimestamp) {
        // If being served, show time since service started
        const servedTime = new Date(servedTimestamp);
        diffInSeconds = Math.floor((now - servedTime) / 1000);
      } else {
        // If not being served, show total wait time
        diffInSeconds = Math.floor((now - added) / 1000);
      }
      
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
    getCategoryShort(category) {
      const shortcuts = {
        'Mobiles & Tablets': 'MOB',
        'Pre-Paid': 'PRE',
        'Internet': 'INT',
        'Accessories': 'ACC',
        'Account Help': 'ACNT',
        'Tech Help': 'TECH'
      };
      return shortcuts[category] || category;
    },
    getCategoryClass(category) {
      return category?.toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\s+/g, '-')
        || '';
    },
    addStaffMember(staff) {
      this.staffList.push(staff)
    },
    removeStaffMember(index) {
      const removedStaff = this.staffList[index].name;
      
      // Remove staff from list
      this.staffList.splice(index, 1);
      
      // Unassign staff from any customers
      this.waitList.forEach(customer => {
        if (customer.assignedStaff === removedStaff) {
          customer.assignedStaff = null;
        }
      });
    },
    assignStaffToCustomer(staffName) {
      const customerIndex = this.waitList.findIndex(c => c === this.selectedCustomer)
      if (customerIndex !== -1) {
        this.waitList[customerIndex] = {
          ...this.waitList[customerIndex],
          assignedStaff: staffName,
          servedTimestamp: staffName ? new Date().toISOString() : null
        }
      }
    },
    toggleContacts() {
      this.hideContacts = !this.hideContacts;
    },
    addTestCustomers(customers) {
      this.waitList.push(...customers);
    },
    shouldShowDivider(index) {
      const currentCustomer = this.sortedWaitList[index];
      const nextCustomer = this.sortedWaitList[index + 1];
      
      return currentCustomer.customerType === 'VIP' && 
             (!nextCustomer || nextCustomer.customerType !== 'VIP');
    }
  },
};
</script>

<style>
/* Global styles (no scoped) */
body {
  margin: 0;
  overflow: hidden; /* Prevents browser scrollbar */
}
</style>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wait-list-header {
  font-weight: bold;
  font-size: 1.5rem;
  margin: 0;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  max-height: calc(100vh - 200px);
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
  padding: 8px 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 8px;
  width: calc(100% - 2rem);
  margin: 0 auto;
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

.customer-type-tag, .category-tag {
  cursor: help;
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

.category-tag {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  margin-right: 8px;
  text-align: center;
}

.category-tag.mobiles-and-tablets {
  background-color: #e91e63;
  color: white;
}

.category-tag.pre-paid {
  background-color: #9c27b0;
  color: white;
}

.category-tag.internet {
  background-color: #2196f3;
  color: white;
}

.category-tag.accessories {
  background-color: #4caf50;
  color: white;
}

.category-tag.account-help {
  background-color: #ff9800;
  color: white;
}

.category-tag.tech-help {
  background-color: #795548;
  color: white;
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

.assigned-staff {
  color: #666;
  font-size: 0.9em;
  font-style: italic;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  margin-top: 0.5rem;
  padding: 0 1rem;
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  height: fit-content;
}

.toggle-button:hover {
  background-color: #e0e0e0;
}

.toggle-button .material-icons {
  font-size: 1.25rem;
  display: flex;
  align-items: center;
}

.vip-divider {
  height: 2px;
  background-color: #ffd700;
  margin: 1rem 0;
  opacity: 0.5;
  width: calc(100% - 2rem);
  margin-left: auto;
  margin-right: auto;
}
</style>