<template>
  <button @click="addTestData" class="header-button">
    Add Test Data
  </button>
</template>

<script>
export default {
  name: 'DevTools',
  methods: {
    addTestData() {
      const customerTypes = ['VIP', 'Consumer', 'Business'];
      const categories = [
        'Mobiles & Tablets',
        'Pre-Paid',
        'Internet',
        'Accessories',
        'Account Help',
        'Tech Help'
      ];
      const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Sarah', 'Emma', 'Olivia', 'Sophia'];
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
      
      const testCustomers = [];
      for (let i = 0; i < 15; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const phone = `04${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
        
        const now = new Date();
        const randomTime = new Date(now - Math.random() * 24 * 60 * 60 * 1000);
        
        testCustomers.push({
          name: `${firstName} ${lastName}`,
          contact: phone,
          customerType: customerType,
          category: category,
          timestamp: randomTime.toISOString(),
          notes: '',
          assignedStaff: null,
          servedTimestamp: null
        });
      }
      
      this.$emit('add-test-data', testCustomers);
    }
  }
}
</script>

<style scoped>
.header-button {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.header-button:hover {
  background-color: #e0e0e0;
}
</style>