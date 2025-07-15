import type { Part } from './types';

export const partsData: Part[] = [
  {
    id: 'ROP-0001',
    name: 'AquaPure Membrane 100GPD',
    price: 2500,
    description: 'A high-quality RO membrane with a 100 GPD capacity, ensuring high rejection rates and long-lasting performance for pure, safe drinking water.',
    image: 'https://placehold.co/400x400.png',
    category: 'Membranes',
    features: 'High rejection rate, Long lifespan',
  },
  {
    id: 'ROP-0002',
    name: 'HydroFlow Sediment Filter',
    price: 550,
    description: '5-micron sediment filter that effectively removes sand, silt, rust, and other suspended particles to protect your RO system.',
    image: 'https://placehold.co/400x400.png',
    category: 'Filters',
    features: 'NSF certified, Easy installation',
  },
  {
    id: 'ROP-0003',
    name: 'PureStream Booster Pump',
    price: 4500,
    description: 'Powerful and quiet booster pump to increase water pressure for optimal RO membrane performance, suitable for low-pressure areas.',
    image: 'https://placehold.co/400x400.png',
    category: 'Pumps',
    features: 'Durable material, Low energy consumption',
  },
  {
    id: 'ROP-0004',
    name: 'EcoWater Solenoid Valve',
    price: 800,
    description: 'Reliable 24V DC solenoid valve to automatically control water flow, preventing wastage and ensuring efficient operation.',
    image: 'https://placehold.co/400x400.png',
    category: 'Valves',
    features: 'Leak-proof design, Universal compatibility',
  },
  {
    id: 'ROP-0005',
    name: 'MaxFlow 1/4" Fitting',
    price: 150,
    description: 'Quick-connect 1/4 inch elbow fitting for secure, leak-free connections between RO components. Made from food-grade plastic.',
    image: 'https://placehold.co/400x400.png',
    category: 'Fittings',
    features: 'High flow rate, High rejection rate',
  },
  {
    id: 'ROP-0006',
    name: 'UltraSafe Membrane Housing',
    price: 1200,
    description: 'Durable, high-pressure membrane housing compatible with standard residential RO membranes. Includes O-rings for a perfect seal.',
    image: 'https://placehold.co/400x400.png',
    category: 'Housing',
    features: 'Long lifespan, NSF certified',
  },
  {
    id: 'ROP-0007',
    name: 'AquaPure Carbon Block Filter',
    price: 750,
    description: 'Activated carbon block filter that removes chlorine, tastes, and odors to improve water quality and taste.',
    image: 'https://placehold.co/400x400.png',
    category: 'Filters',
    features: 'Easy installation, Durable material',
  },
  {
    id: 'ROP-0008',
    name: 'HydroFlow Auto Flush Valve',
    price: 600,
    description: 'An automatic flush valve that periodically rinses the membrane to prevent scaling and prolong its life.',
    image: 'https://placehold.co/400x400.png',
    category: 'Valves',
    features: 'Low energy consumption, Leak-proof design',
  },
  {
    id: 'ROP-0009',
    name: 'PureStream UV Sterilizer',
    price: 3500,
    description: 'UV sterilizer lamp and chamber to eliminate up to 99.99% of bacteria, viruses, and other microorganisms.',
    image: 'https://placehold.co/400x400.png',
    category: 'Sterilizers',
    features: 'Universal compatibility, High flow rate',
  },
  {
    id: 'ROP-0010',
    name: 'EcoWater Mineral Cartridge',
    price: 900,
    description: 'Adds essential minerals back into the purified water to improve taste and provide health benefits.',
    image: 'https://placehold.co/400x400.png',
    category: 'Filters',
    features: 'High rejection rate, Long lifespan',
  },
  ...Array.from({ length: 40 }, (_, i) => {
    const id = i + 11;
    const categories = ['Membranes', 'Filters', 'Pumps', 'Valves', 'Fittings', 'Housing', 'Sterilizers'];
    const names = ['AquaPure', 'HydroFlow', 'PureStream', 'EcoWater', 'MaxFlow', 'UltraSafe'];
    const category = categories[id % categories.length];
    return {
      id: `ROP-${String(id).padStart(4, '0')}`,
      name: `${names[id % names.length]} ${category.slice(0, -1)} ${Math.floor(Math.random() * 1000)}`,
      price: Math.floor(Math.random() * (9000 - 500 + 1)) + 500,
      description: 'A high-quality RO part designed for performance and durability. Ideal for various water purification systems.',
      image: 'https://placehold.co/400x400.png',
      category: category,
      features: 'Standard feature set, reliable performance',
    };
  }),
];
