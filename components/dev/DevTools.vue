<template>
  <button class="header-button" @click="addTestData">Add Test Data</button>
</template>

<script>
export default {
  name: 'DevTools',
  methods: {
    addTestData() {
      const customerTypes = ['Consumer', 'Business'];
      const categories = ['Mobiles & Tablets', 'Pre-Paid', 'Internet', 'Accessories', 'Account Help', 'Tech Help'];
      const firstNames = [
        'James',
        'John',
        'Robert',
        'Michael',
        'William',
        'David',
        'Sarah',
        'Emma',
        'Olivia',
        'Sophia',
      ];
      const lastNames = [
        'Smith',
        'Johnson',
        'Williams',
        'Brown',
        'Jones',
        'Garcia',
        'Miller',
        'Davis',
        'Rodriguez',
        'Martinez',
      ];
      const clothingTypes = ['Shirt', 'Pants', 'Dress', 'Hat'];
      const colors = [
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
      ];

      // Add test staff members
      const staffNames = ['Alex', 'Sam', 'Jordan', 'Taylor'];
      const testStaff = staffNames.map((name) => ({
        name,
        readyTimestamp: new Date().toISOString(),
        servingCustomer: null,
        servingStartTime: null,
      }));

      // Generate test customers
      const testCustomers = [];

      // Generate VIP customers
      const vipCount = Math.floor(Math.random() * 3);
      for (let i = 0; i < vipCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const phone = `04${Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0')}`;

        // Generate random outfits
        const outfits = [];
        const numOutfits = Math.floor(Math.random() * 3) + 1; // 1-3 items of clothing
        const usedTypes = new Set();

        for (let j = 0; j < numOutfits; j++) {
          let type;
          do {
            type = clothingTypes[Math.floor(Math.random() * clothingTypes.length)];
          } while (usedTypes.has(type));

          usedTypes.add(type);
          const color = colors[Math.floor(Math.random() * colors.length)];
          outfits.push({
            type,
            color: color.name,
            hex: color.hex,
          });
        }

        const now = new Date();
        const randomTime = new Date(now - Math.random() * 5400000);

        testCustomers.push({
          name: `${firstName} ${lastName}`,
          contact: phone,
          customerType: 'VIP',
          category: category,
          timestamp: randomTime.toISOString(),
          notes: '',
          assignedStaff: null,
          servedTimestamp: null,
          appearance: {
            outfits,
          },
        });
      }

      // Generate regular customers
      for (let i = 0; i < 13; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const customerType = customerTypes[Math.floor(Math.random() * customerTypes.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const phone = `04${Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0')}`;

        // Generate random outfits
        const outfits = [];
        const numOutfits = Math.floor(Math.random() * 3) + 1; // 1-3 items of clothing
        const usedTypes = new Set();

        for (let j = 0; j < numOutfits; j++) {
          let type;
          do {
            type = clothingTypes[Math.floor(Math.random() * clothingTypes.length)];
          } while (usedTypes.has(type));

          usedTypes.add(type);
          const color = colors[Math.floor(Math.random() * colors.length)];
          outfits.push({
            type,
            color: color.name,
            hex: color.hex,
          });
        }

        const now = new Date();
        const randomTime = new Date(now - Math.random() * 5400000);

        testCustomers.push({
          name: `${firstName} ${lastName}`,
          contact: phone,
          customerType: customerType,
          category: category,
          timestamp: randomTime.toISOString(),
          notes: '',
          assignedStaff: null,
          servedTimestamp: null,
          appearance: {
            outfits,
          },
        });
      }

      // Emit both staff and customers together
      this.$emit('add-test-data', {
        customers: testCustomers,
        staff: testStaff,
      });
    },
  },
};
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
