<template>
  <div>
    <div class="container">
      <SaveNotification :show="showRemoveNotification" :message="removeNotificationMessage" type="error" />
      <AddCustomerModal :is-open="showModal" @close="showModal = false" @add-customer="handleAddCustomer" />
      <ViewCustomerModal
        v-if="selectedCustomer"
        :is-open="showViewModal"
        :customer="selectedCustomer"
        :available-staff="staffList"
        @close="showViewModal = false"
        @update-notes="handleUpdateNotes"
        @assign-staff="(staffId) => assignStaffToCustomer(selectedCustomer.id, staffId)"
      />
      <ManageStaffModal
        :is-open="showStaffModal"
        :staff-list="staffList"
        @close="showStaffModal = false"
        @add-staff="handleAddStaff"
        @remove-staff="handleStaffRemoval"
        @toggle-lunch="handleToggleLunch"
      />
      <ConfirmModal
        :is-open="showConfirmModal"
        :title="getRemovalTitle()"
        :message="customerToRemove ? getRemovalMessage(customerToRemove) : ''"
        @confirm="confirmRemove"
        @cancel="cancelRemove"
      />
      <div class="header-section">
        <div class="tabs">
          <button class="tab-button" :class="{ active: activeTab === 'waiting' }" @click="activeTab = 'waiting'">
            Waiting
            <span class="tab-count">{{ waitList.filter((c) => !c.assignedStaff).length }}</span>
          </button>
          <button class="tab-button" :class="{ active: activeTab === 'serving' }" @click="activeTab = 'serving'">
            Being Served
            <span class="tab-count">{{ waitList.filter((c) => c.assignedStaff).length }}</span>
          </button>
        </div>
        <button class="toggle-button" @click="toggleContacts">
          <span class="material-icons">{{ hideContacts ? 'visibility_off' : 'visibility' }}</span>
          {{ hideContacts ? 'Show Contacts' : 'Hide Contacts' }}
        </button>
      </div>
      <div v-if="waitList.length === 0" class="empty-queue">No customers in queue</div>
      <div v-else-if="sortedWaitList.length === 0" class="empty-queue">
        No customers {{ activeTab === 'waiting' ? 'waiting' : 'being served' }}
      </div>
      <ul v-else>
        <template v-for="(queue, index) in sortedWaitList" :key="index">
          <li>
            <div class="customer-row" @click.stop>
              <div class="tag-section">
                <template v-if="hideContacts && !queue.assignedStaff">
                  <span
                    v-tooltip
                    class="customer-type-tag"
                    :class="queue.customerType.toLowerCase()"
                    :title="queue.customerType"
                  >
                    {{ getCustomerTypeShort(queue.customerType) }}
                  </span>
                  <span
                    v-tooltip
                    class="category-tag"
                    :class="getCategoryClass(queue.category)"
                    :title="queue.category"
                  >
                    {{ getCategoryShort(queue.category) }}
                  </span>
                </template>
              </div>
              <div class="details-section" @click.stop="showCustomerNotes(queue)">
                <div class="customer-details">
                  <span v-if="queue.assignedStaff" class="serving-icon" title="Currently being served">
                    <span class="material-icons">person</span>
                  </span>
                  <div class="name-and-appearance">
                    <span class="customer-info">
                      {{ queue.name }}{{ !hideContacts ? ` (${queue.contact})` : '' }}
                    </span>
                    <div
                      v-if="queue.appearance?.outfits && activeTab === 'waiting' && hideContacts"
                      class="appearance-tags"
                    >
                      <div
                        v-for="outfit in queue.appearance.outfits"
                        :key="`${outfit.type}-${outfit.color}`"
                        class="outfit-tag"
                      >
                        <span class="outfit-text">{{ outfit.type }}</span>
                        <span class="color-swatch" :style="{ backgroundColor: outfit.hex }">
                          <span v-if="outfit.hex === '#ffffff'" class="white-swatch"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <span v-if="queue.assignedStaff" class="assigned-staff">
                  • Assigned to {{ getStaffName(queue.assignedStaff) }}
                </span>
                <span class="time-elapsed-tag">
                  <template v-if="queue.assignedStaff">
                    Serving: {{ getTimeElapsed(queue.timestamp, queue.servedTimestamp) }}
                  </template>
                  <template v-else> Waiting: {{ getTimeElapsed(queue.timestamp) }} </template>
                </span>
                <button class="delete-button" @click.stop="onRemove(queue)">
                  <span class="material-icons">remove_circle</span>
                </button>
              </div>
            </div>
          </li>
          <div v-if="shouldShowDivider(index)" class="vip-divider"></div>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { useQueue } from '~/composables/useQueue';
import type { Customer } from '~/types';
import AddCustomerModal from './modals/AddCustomerModal.vue';
import ConfirmModal from './modals/ConfirmModal.vue';
import ManageStaffModal from './modals/ManageStaffModal.vue';
import ViewCustomerModal from './modals/ViewCustomerModal.vue';
import SaveNotification from './SaveNotification.vue';

const {
  waitList,
  staffList,
  addCustomer,
  removeCustomer,
  addStaffMember,
  removeStaffMember,
  assignStaffToCustomer,
  updateCustomerNotes: updateNotes,
  toggleStaffLunch,
} = useQueue();

// Add missing state with proper types
const showModal = ref(false);
const showViewModal = ref(false);
const showStaffModal = ref(false);
const showConfirmModal = ref(false);
const selectedCustomer = ref<Customer | null>(null);
const customerToRemove = ref<Customer | null>(null);
const showRemoveNotification = ref(false);
const hideContacts = ref(true);
const activeTab = ref('waiting');
const removeNotificationMessage = ref('');

// Add timer ref
const timer = ref<NodeJS.Timer | null>(null);

// Start the timer when component is mounted
onMounted(() => {
  // Update every 30 seconds instead of every second
  timer.value = setInterval(() => {
    // Force a re-render to update all timestamps
    waitList.value = [...waitList.value];
  }, 30000);
});

// Clean up timer when component is unmounted
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
});

// Add missing methods
const handleUpdateNotes = async (newNotes: string) => {
  if (selectedCustomer.value) {
    try {
      await updateNotes(selectedCustomer.value.id, newNotes);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  }
};

const handleStaffRemoval = async (staffId: string) => {
  const staffMember = staffList.value.find((staff) => staff.id === staffId);
  if (staffMember) {
    try {
      await removeStaffMember(staffId);
      removeNotificationMessage.value = `✕ Staff member ${staffMember.name} removed`;
      showRemoveNotification.value = true;
      setTimeout(() => {
        showRemoveNotification.value = false;
      }, 1500);
    } catch (error) {
      console.error('Error removing staff member:', error);
    }
  }
};

const addTestData = (data: { customers: Customer[]; staff: any[] }) => {
  if (data.customers) {
    waitList.value.push(...data.customers);
  }
  if (data.staff) {
    staffList.value.push(...data.staff);
  }
};

// Add helper method to get staff name from ID
const getStaffName = (staffId: string) => {
  const staff = staffList.value.find((s) => s.id === staffId);
  return staff ? staff.name : 'Unknown';
};

// Update method signatures with proper types
const getRemovalMessage = (customer: Customer) => {
  if (activeTab.value === 'serving') {
    const staffName = getStaffName(customer.assignedStaff || '');
    return `Has ${staffName} finished serving ${customer.name}?`;
  }
  return `Are you sure you want to remove ${customer.name} from the queue?`;
};

const onRemove = (customer: Customer) => {
  customerToRemove.value = customer;
  showConfirmModal.value = true;
};

const getCustomerTypeShort = (type: string) => {
  return type.charAt(0);
};

const getCategoryClass = (category: string) => {
  return category?.toLowerCase().replace(/&/g, 'and').replace(/\s+/g, '-') || '';
};

const getCategoryShort = (category: string) => {
  const shortcuts: { [key: string]: string } = {
    'Mobiles & Tablets': 'MOB',
    'Pre-Paid': 'PRE',
    Internet: 'INT',
    Accessories: 'ACS',
    'Account Help': 'ACT',
    'Tech Help': 'TEH',
  };
  return shortcuts[category] || category;
};

const getTimeElapsed = (timestamp: string, servedTimestamp: string | null = null) => {
  if (!timestamp) return '';

  const now = new Date();
  const time = servedTimestamp ? new Date(servedTimestamp) : new Date(timestamp);
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

const showCustomerNotes = (customer: Customer) => {
  selectedCustomer.value = customer;
  showViewModal.value = true;
};

const shouldShowDivider = (index: number) => {
  if (activeTab.value !== 'waiting') return false;

  const currentCustomer = sortedWaitList.value[index];
  const nextCustomer = sortedWaitList.value[index + 1];

  return currentCustomer.customerType === 'VIP' && (!nextCustomer || nextCustomer.customerType !== 'VIP');
};

// Add missing computed with proper types
const sortedWaitList = computed(() => {
  return waitList.value
    .filter((customer) => {
      if (activeTab.value === 'waiting') {
        return !customer.assignedStaff;
      } else {
        return customer.assignedStaff;
      }
    })
    .sort((a, b) => {
      if (a.customerType === 'VIP' && b.customerType !== 'VIP') return -1;
      if (a.customerType !== 'VIP' && b.customerType === 'VIP') return 1;
      return 0;
    });
});

// Add these methods
const getRemovalTitle = () => {
  return activeTab.value === 'serving' ? 'Complete Service' : 'Remove Customer';
};

const toggleContacts = () => {
  hideContacts.value = !hideContacts.value;
};

const confirmRemove = async () => {
  if (customerToRemove.value) {
    await removeCustomer(customerToRemove.value.id);
    removeNotificationMessage.value = '✕ Customer removed from queue';
    showRemoveNotification.value = true;
    setTimeout(() => {
      showRemoveNotification.value = false;
    }, 1500);
  }
  showConfirmModal.value = false;
  customerToRemove.value = null;
};

const cancelRemove = () => {
  showConfirmModal.value = false;
  customerToRemove.value = null;
};

// Properly type the modalState
interface ModalState {
  showModal: boolean;
  showStaffModal: boolean;
}

// Get the modal state from the layout with proper typing
const modalState = inject<Ref<ModalState>>('modalState');

// Watch for changes in the modal state
watch(
  () => modalState?.value.showModal,
  (newValue) => {
    if (newValue !== undefined) {
      showModal.value = newValue;
    }
  },
  { immediate: true }
);

watch(
  () => modalState?.value.showStaffModal,
  (newValue) => {
    if (newValue !== undefined) {
      showStaffModal.value = newValue;
    }
  },
  { immediate: true }
);

// Update the modal state when local state changes
watch(showModal, (newValue) => {
  if (modalState?.value) {
    modalState.value.showModal = newValue;
  }
});

watch(showStaffModal, (newValue) => {
  if (modalState?.value) {
    modalState.value.showStaffModal = newValue;
  }
});

// Add handlers for modal actions
const handleAddCustomer = async (customer: Omit<Customer, 'id'>) => {
  await addCustomer(customer);
  showModal.value = false;
};

const handleAddStaff = async (staff: Omit<Staff, 'id'>) => {
  await addStaffMember(staff);
  showStaffModal.value = false;
};

// Add handler for lunch toggle
const handleToggleLunch = async (staffId: string) => {
  try {
    await toggleStaffLunch(staffId);
  } catch (error) {
    console.error('Error toggling staff lunch break:', error);
  }
};
</script>
