<template>
    <button @click="addTestData" class="dev-button">
      <span class="material-icons">bug_report</span>
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
          
          testCustomers.push({
            name: `${firstName} ${lastName}`,
            contact: phone,
            customerType: customerType,
            category: category,
            timestamp: new Date().toISOString(),
            notes: ''
          });
        }
        
        this.$emit('add-test-data', testCustomers);
      }
    }
  }
  </script>
  
  <style scoped>
  .dev-button {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    background-color: #2d3436;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: bold;
  }
  
  .dev-button:hover {
    background-color: #636e72;
  }
  
  .dev-button .material-icons {
    font-size: 1.25rem;
    display: flex;
    align-items: center;
  }
  </style>