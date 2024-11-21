import { useSupabaseClient } from '#imports';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { onMounted, onUnmounted, ref } from 'vue';
import type { Customer, Staff } from '~/types';

interface DatabaseCustomer {
  id: string;
  name: string;
  contact: string;
  notes: string | null;
  customer_type: 'VIP' | 'Consumer' | 'Business';
  category: string;
  timestamp: string;
  assigned_staff: string | null;
  served_timestamp: string | null;
  appearance: {
    outfits: Array<{
      type: string;
      color: string;
      hex: string;
    }>;
  } | null;
}

interface DatabaseStaff {
  id: string;
  name: string;
  ready_timestamp: string;
  serving_customer: string | null;
  serving_start_time: string | null;
  on_lunch: boolean;
  lunch_start_time: string | null;
}

// Create a singleton instance
let queueSubscription: RealtimeChannel | null = null;
let staffSubscription: RealtimeChannel | null = null;

export const useQueue = () => {
  const supabase = useSupabaseClient();
  const waitList = ref<Customer[]>([]);
  const staffList = ref<Staff[]>([]);
  const isInitialized = ref(false);

  const transformDatabaseCustomer = (dbCustomer: DatabaseCustomer): Customer => ({
    id: dbCustomer.id,
    name: dbCustomer.name,
    contact: dbCustomer.contact,
    notes: dbCustomer.notes || '',
    customerType: dbCustomer.customer_type,
    category: dbCustomer.category,
    timestamp: dbCustomer.timestamp,
    assignedStaff: dbCustomer.assigned_staff,
    servedTimestamp: dbCustomer.served_timestamp,
    appearance: dbCustomer.appearance,
  });

  const handleQueueUpdate = async (payload: RealtimePostgresChangesPayload<DatabaseCustomer>) => {
    if (payload.eventType === 'INSERT') {
      const transformedCustomer = transformDatabaseCustomer(payload.new);
      waitList.value = [...waitList.value, transformedCustomer];
    } else if (payload.eventType === 'DELETE') {
      waitList.value = waitList.value.filter((c) => c.id !== payload.old.id);
    } else if (payload.eventType === 'UPDATE') {
      const transformedCustomer = transformDatabaseCustomer(payload.new);
      waitList.value = waitList.value.map((c) => (c.id === payload.new.id ? transformedCustomer : c));
    }
  };

  const handleStaffUpdate = async (payload: RealtimePostgresChangesPayload<DatabaseStaff>) => {
    if (payload.eventType === 'INSERT') {
      const exists = staffList.value.some((s) => s.id === payload.new.id);
      if (!exists) {
        const transformedStaff: Staff = {
          id: payload.new.id,
          name: payload.new.name,
          readyTimestamp: payload.new.ready_timestamp,
          servingCustomer: payload.new.serving_customer,
          servingStartTime: payload.new.serving_start_time,
          onLunch: payload.new.on_lunch,
          lunchStartTime: payload.new.lunch_start_time,
        };
        staffList.value = [...staffList.value, transformedStaff];
      }
    } else if (payload.eventType === 'DELETE') {
      staffList.value = staffList.value.filter((s) => s.id !== payload.old.id);

      const { data: customers } = await supabase.from('customers').select('*').eq('assigned_staff', payload.old.id);

      if (customers) {
        await Promise.all(
          customers.map(async (customer) => {
            await supabase
              .from('customers')
              .update({
                assigned_staff: null,
                served_timestamp: null,
              })
              .eq('id', customer.id);
          })
        );
      }
    } else if (payload.eventType === 'UPDATE') {
      // Get the latest data to ensure we have all relationships
      const { data: staff } = await supabase
        .from('staff')
        .select(
          `
          *,
          customers!customers_assigned_staff_fkey (
            id,
            name
          )
        `
        )
        .eq('id', payload.new.id)
        .single();

      if (staff) {
        const transformedStaff: Staff = {
          id: staff.id,
          name: staff.name,
          readyTimestamp: staff.ready_timestamp,
          servingCustomer: staff.serving_customer,
          servingStartTime: staff.serving_start_time,
          onLunch: staff.on_lunch,
          lunchStartTime: staff.lunch_start_time,
        };
        staffList.value = staffList.value.map((s) => (s.id === staff.id ? transformedStaff : s));
      }
    }
  };

  const subscribeToQueue = async () => {
    if (!queueSubscription) {
      queueSubscription = supabase
        .channel('queue-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, handleQueueUpdate)
        .subscribe();
    }

    if (!staffSubscription) {
      staffSubscription = supabase
        .channel('staff-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, handleStaffUpdate)
        .subscribe();
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          contact: customer.contact,
          notes: customer.notes || '',
          customer_type: customer.customerType,
          category: customer.category,
          timestamp: customer.timestamp,
          appearance: customer.appearance,
          assigned_staff: null,
          served_timestamp: null,
        })
        .select()
        .single();

      if (error) throw error;

      // Remove local state update since it will be handled by the realtime subscription
      return data;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const removeCustomer = async (customerId: string) => {
    try {
      // Get the customer before removal to check if they have assigned staff
      const customer = waitList.value.find((c) => c.id === customerId);
      if (!customer) return;

      // If customer has assigned staff, update staff status first
      if (customer.assignedStaff) {
        const { error: staffError } = await supabase
          .from('staff')
          .update({
            serving_customer: null,
            serving_start_time: null,
            ready_timestamp: new Date().toISOString(),
          })
          .eq('id', customer.assignedStaff)
          .select()
          .single();

        if (staffError) {
          console.error('Error updating staff status:', staffError);
          throw staffError;
        }
      }

      // Then remove the customer
      const { error } = await supabase.from('customers').delete().eq('id', customerId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing customer:', error);
      throw error;
    }
  };

  const addStaffMember = async (staff: Omit<Staff, 'id'>) => {
    try {
      const timestamp = new Date().toISOString();
      const { data, error } = await supabase
        .from('staff')
        .insert({
          name: staff.name,
          ready_timestamp: timestamp,
          serving_customer: null,
          serving_start_time: null,
          on_lunch: false,
          lunch_start_time: null,
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the data for local state
      const transformedStaff: Staff = {
        id: data.id,
        name: data.name,
        readyTimestamp: data.ready_timestamp,
        servingCustomer: data.serving_customer,
        servingStartTime: data.serving_start_time,
        onLunch: data.on_lunch,
        lunchStartTime: data.lunch_start_time,
      };

      staffList.value = [...staffList.value, transformedStaff];
      return data;
    } catch (error) {
      console.error('Error adding staff member:', error);
      throw error;
    }
  };

  const removeStaffMember = async (staffId: string) => {
    try {
      // Update local state first for immediate feedback
      staffList.value = staffList.value.filter((s) => s.id !== staffId);

      const { error } = await supabase.from('staff').delete().eq('id', staffId);
      if (error) {
        // Revert local state if database update fails
        await fetchInitialData();
        throw error;
      }

      // Get any customers assigned to this staff member
      const { data: customers } = await supabase.from('customers').select('*').eq('assigned_staff', staffId);

      if (customers) {
        await Promise.all(
          customers.map(async (customer) => {
            await supabase
              .from('customers')
              .update({
                assigned_staff: null,
                served_timestamp: null,
              })
              .eq('id', customer.id);
          })
        );
      }
    } catch (error) {
      console.error('Error removing staff member:', error);
      throw error;
    }
  };

  const assignStaffToCustomer = async (customerId: string, staffId: string) => {
    const timestamp = new Date().toISOString();

    try {
      // Update customer first
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          assigned_staff: staffId,
          served_timestamp: timestamp,
        })
        .eq('id', customerId)
        .select()
        .single();

      if (customerError) {
        console.error('Error updating customer:', customerError);
        throw customerError;
      }

      // Then update staff member
      const { error: staffError } = await supabase
        .from('staff')
        .update({
          serving_customer: customerId,
          serving_start_time: timestamp,
        })
        .eq('id', staffId)
        .select()
        .single();

      if (staffError) {
        console.error('Error updating staff:', staffError);
        throw staffError;
      }

      // Fetch updated data to ensure state is in sync
      await fetchInitialData();
    } catch (error) {
      console.error('Error assigning staff to customer:', error);
      throw error;
    }
  };

  const fetchInitialData = async () => {
    try {
      const { data: customers } = await supabase.from('customers').select('*').order('timestamp', { ascending: true });

      const { data: staff } = await supabase.from('staff').select('*');

      if (customers) {
        waitList.value = customers.map(transformDatabaseCustomer);
      }
      if (staff) {
        // Transform staff data preserving lunch status
        staffList.value = staff.map((s) => ({
          id: s.id,
          name: s.name,
          readyTimestamp: s.ready_timestamp,
          servingCustomer: s.serving_customer,
          servingStartTime: s.serving_start_time,
          onLunch: s.on_lunch,
          lunchStartTime: s.lunch_start_time,
        }));
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const init = async () => {
    if (!isInitialized.value) {
      console.log('Initializing queue subscriptions...');
      await fetchInitialData();
      await subscribeToQueue();
      isInitialized.value = true;
      console.log('Queue subscriptions initialized');
    }
  };

  const updateCustomerNotes = async (customerId: string, newNotes: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          notes: newNotes,
        })
        .eq('id', customerId)
        .select()
        .single();

      if (error) throw error;

      // Let the realtime subscription handle the state update
    } catch (error) {
      console.error('Error updating customer notes:', error);
      throw error;
    }
  };

  const toggleStaffLunch = async (staffId: string) => {
    try {
      const staff = staffList.value.find((s) => s.id === staffId);
      if (!staff) return;

      const timestamp = new Date().toISOString();
      const { error } = await supabase
        .from('staff')
        .update({
          on_lunch: !staff.onLunch,
          lunch_start_time: !staff.onLunch ? timestamp : null,
          ready_timestamp: staff.onLunch ? timestamp : staff.readyTimestamp,
          serving_customer: null,
          serving_start_time: null,
        })
        .eq('id', staffId);

      if (error) throw error;

      // If staff was serving someone, update the customer
      if (staff.servingCustomer) {
        await supabase
          .from('customers')
          .update({
            assigned_staff: null,
            served_timestamp: null,
          })
          .eq('id', staff.servingCustomer);
      }
    } catch (error) {
      console.error('Error toggling staff lunch break:', error);
      throw error;
    }
  };

  init();

  onMounted(async () => {
    await init();
  });

  onUnmounted(() => {
    console.log('Cleaning up queue subscriptions...');
    if (queueSubscription) {
      queueSubscription.unsubscribe();
      queueSubscription = null;
    }
    if (staffSubscription) {
      staffSubscription.unsubscribe();
      staffSubscription = null;
    }
  });

  return {
    waitList,
    staffList,
    addCustomer,
    removeCustomer,
    addStaffMember,
    removeStaffMember,
    assignStaffToCustomer,
    updateCustomerNotes,
    toggleStaffLunch,
  };
};
