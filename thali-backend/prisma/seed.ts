// prisma/seed.ts — Seed data derived from frontend mockData.js

import { PrismaClient, DietaryType, AutoSwitchPref } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Suppliers ──────────────────────────────────────────────────
  const supplier1 = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-1' },
    update: {},
    create: {
      id: 'seed-supplier-1',
      name: 'Chennai Agro Traders',
      contact: '+91-9876543210',
      city: 'Chennai',
    },
  });

  // ── Ingredients ────────────────────────────────────────────────
  const ingredientData = [
    { id: 'ing-black-lentils',   name: 'Black Lentils',   unit: 'g',   currentPrice: 0.08 },
    { id: 'ing-butter',          name: 'Butter',           unit: 'g',   currentPrice: 0.04 },
    { id: 'ing-cream',           name: 'Cream',            unit: 'ml',  currentPrice: 0.02 },
    { id: 'ing-tomato',          name: 'Tomato',           unit: 'g',   currentPrice: 0.03 },
    { id: 'ing-spices',          name: 'Spices',           unit: 'g',   currentPrice: 0.15 },
    { id: 'ing-basmati-rice',    name: 'Basmati Rice',     unit: 'g',   currentPrice: 0.09 },
    { id: 'ing-chicken',         name: 'Chicken',          unit: 'g',   currentPrice: 0.25 },
    { id: 'ing-saffron',         name: 'Saffron',          unit: 'g',   currentPrice: 5.00 },
    { id: 'ing-fried-onion',     name: 'Fried Onion',      unit: 'g',   currentPrice: 0.06 },
    { id: 'ing-rice-batter',     name: 'Rice Batter',      unit: 'ml',  currentPrice: 0.02 },
    { id: 'ing-potato-masala',   name: 'Potato Masala',    unit: 'g',   currentPrice: 0.04 },
    { id: 'ing-coconut-chutney', name: 'Coconut Chutney',  unit: 'g',   currentPrice: 0.05 },
    { id: 'ing-sambar',          name: 'Sambar',           unit: 'ml',  currentPrice: 0.03 },
    { id: 'ing-rice',            name: 'Rice',             unit: 'g',   currentPrice: 0.07 },
    { id: 'ing-lemon',           name: 'Lemon',            unit: 'g',   currentPrice: 0.02 },
    { id: 'ing-peanuts',         name: 'Peanuts',          unit: 'g',   currentPrice: 0.12 },
    { id: 'ing-curry-leaves',    name: 'Curry Leaves',     unit: 'g',   currentPrice: 0.08 },
    { id: 'ing-mustard-seeds',   name: 'Mustard Seeds',    unit: 'g',   currentPrice: 0.10 },
    { id: 'ing-paneer',          name: 'Paneer',           unit: 'g',   currentPrice: 0.30 },
    { id: 'ing-tomato-gravy',    name: 'Tomato Gravy',     unit: 'ml',  currentPrice: 0.04 },
    { id: 'ing-noodles',         name: 'Noodles',          unit: 'g',   currentPrice: 0.06 },
    { id: 'ing-vegetables',      name: 'Vegetables',       unit: 'g',   currentPrice: 0.04 },
    { id: 'ing-soy-sauce',       name: 'Soy Sauce',        unit: 'ml',  currentPrice: 0.05 },
    { id: 'ing-sesame-oil',      name: 'Sesame Oil',       unit: 'ml',  currentPrice: 0.12 },
    { id: 'ing-pizza-dough',     name: 'Pizza Dough',      unit: 'g',   currentPrice: 0.05 },
    { id: 'ing-mozzarella',      name: 'Mozzarella',       unit: 'g',   currentPrice: 0.35 },
    { id: 'ing-tomato-sauce',    name: 'Tomato Sauce',     unit: 'ml',  currentPrice: 0.04 },
    { id: 'ing-basil',           name: 'Basil',            unit: 'g',   currentPrice: 0.20 },
    { id: 'ing-idli-batter',     name: 'Idli Batter',      unit: 'ml',  currentPrice: 0.02 },
    { id: 'ing-chickpeas',       name: 'Chickpeas',        unit: 'g',   currentPrice: 0.09 },
    { id: 'ing-tahini',          name: 'Tahini',           unit: 'g',   currentPrice: 0.18 },
    { id: 'ing-pita-bread',      name: 'Pita Bread',       unit: 'g',   currentPrice: 0.08 },
    { id: 'ing-olive-oil',       name: 'Olive Oil',        unit: 'ml',  currentPrice: 0.20 },
    { id: 'ing-bhature',         name: 'Bhature',          unit: 'g',   currentPrice: 0.06 },
    { id: 'ing-onion-gravy',     name: 'Onion Gravy',      unit: 'ml',  currentPrice: 0.04 },
  ];

  for (const ing of ingredientData) {
    await prisma.ingredient.upsert({
      where: { id: ing.id },
      update: { currentPrice: ing.currentPrice },
      create: ing,
    });
  }

  // ── Restaurant ─────────────────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where: { id: 'seed-restaurant-1' },
    update: {},
    create: {
      id: 'seed-restaurant-1',
      name: 'Rasoi Kitchen',
      fssaiLicense: 'FSSAI-TN-20230001',
      address: 'No. 12, Anna Salai, Chennai',
      city: 'Chennai',
      opensAt: '07:00',
      closesAt: '22:00',
      marginPct: 30,
    },
  });

  // ── Meals ──────────────────────────────────────────────────────
  type MealSeed = {
    id: string; name: string; cuisine: string; cuisineTag: string;
    dietaryType: DietaryType; colorHex: string; deliveryTimeMin: number;
    basePrice: number; currentPrice: number;
    ingredients: { id: string; qty: number; unit: string; pct: number }[];
    nutrition: { calories: number; proteinG: number; carbsG: number; fatG: number; fiberG: number };
  };

  const mealSeeds: MealSeed[] = [
    {
      id: 'meal-dal-makhani', name: 'Dal Makhani', cuisine: 'North Indian', cuisineTag: 'Indian',
      dietaryType: DietaryType.VEG, colorHex: '#8B4513', deliveryTimeMin: 30,
      basePrice: 129, currentPrice: 149,
      ingredients: [
        { id: 'ing-black-lentils', qty: 80, unit: 'g', pct: 35 },
        { id: 'ing-butter',        qty: 20, unit: 'g', pct: 20 },
        { id: 'ing-cream',         qty: 30, unit: 'ml', pct: 15 },
        { id: 'ing-tomato',        qty: 60, unit: 'g', pct: 18 },
        { id: 'ing-spices',        qty: 10, unit: 'g', pct: 12 },
      ],
      nutrition: { calories: 420, proteinG: 18, carbsG: 52, fatG: 14, fiberG: 8 },
    },
    {
      id: 'meal-chicken-biryani', name: 'Chicken Biryani', cuisine: 'Hyderabadi', cuisineTag: 'Indian',
      dietaryType: DietaryType.NON_VEG, colorHex: '#D4A017', deliveryTimeMin: 45,
      basePrice: 199, currentPrice: 249,
      ingredients: [
        { id: 'ing-basmati-rice', qty: 150, unit: 'g', pct: 40 },
        { id: 'ing-chicken',      qty: 120, unit: 'g', pct: 30 },
        { id: 'ing-saffron',      qty: 1,   unit: 'g', pct: 5 },
        { id: 'ing-fried-onion',  qty: 30,  unit: 'g', pct: 15 },
        { id: 'ing-spices',       qty: 10,  unit: 'g', pct: 10 },
      ],
      nutrition: { calories: 620, proteinG: 38, carbsG: 65, fatG: 18, fiberG: 2 },
    },
    {
      id: 'meal-masala-dosa', name: 'Masala Dosa', cuisine: 'South Indian', cuisineTag: 'South Indian',
      dietaryType: DietaryType.VEG, colorHex: '#CC5500', deliveryTimeMin: 20,
      basePrice: 79, currentPrice: 89,
      ingredients: [
        { id: 'ing-rice-batter',     qty: 150, unit: 'ml', pct: 45 },
        { id: 'ing-potato-masala',   qty: 80,  unit: 'g',  pct: 30 },
        { id: 'ing-coconut-chutney', qty: 30,  unit: 'g',  pct: 15 },
        { id: 'ing-sambar',          qty: 50,  unit: 'ml', pct: 10 },
      ],
      nutrition: { calories: 320, proteinG: 8, carbsG: 58, fatG: 6, fiberG: 4 },
    },
    {
      id: 'meal-lemon-rice', name: 'Lemon Rice', cuisine: 'South Indian', cuisineTag: 'South Indian',
      dietaryType: DietaryType.VEG, colorHex: '#F4D03F', deliveryTimeMin: 25,
      basePrice: 69, currentPrice: 79,
      ingredients: [
        { id: 'ing-rice',          qty: 150, unit: 'g', pct: 50 },
        { id: 'ing-lemon',         qty: 30,  unit: 'g', pct: 15 },
        { id: 'ing-peanuts',       qty: 20,  unit: 'g', pct: 15 },
        { id: 'ing-curry-leaves',  qty: 5,   unit: 'g', pct: 10 },
        { id: 'ing-mustard-seeds', qty: 3,   unit: 'g', pct: 10 },
      ],
      nutrition: { calories: 280, proteinG: 6, carbsG: 55, fatG: 5, fiberG: 3 },
    },
    {
      id: 'meal-paneer-butter-masala', name: 'Paneer Butter Masala', cuisine: 'North Indian', cuisineTag: 'Indian',
      dietaryType: DietaryType.VEG, colorHex: '#E74C3C', deliveryTimeMin: 35,
      basePrice: 159, currentPrice: 179,
      ingredients: [
        { id: 'ing-paneer',       qty: 120, unit: 'g',  pct: 35 },
        { id: 'ing-tomato-gravy', qty: 100, unit: 'ml', pct: 30 },
        { id: 'ing-butter',       qty: 20,  unit: 'g',  pct: 15 },
        { id: 'ing-cream',        qty: 30,  unit: 'ml', pct: 12 },
        { id: 'ing-spices',       qty: 8,   unit: 'g',  pct: 8 },
      ],
      nutrition: { calories: 480, proteinG: 22, carbsG: 30, fatG: 28, fiberG: 3 },
    },
    {
      id: 'meal-veg-hakka-noodles', name: 'Veg Hakka Noodles', cuisine: 'Indo-Chinese', cuisineTag: 'Chinese',
      dietaryType: DietaryType.VEG, colorHex: '#2ECC71', deliveryTimeMin: 25,
      basePrice: 119, currentPrice: 129,
      ingredients: [
        { id: 'ing-noodles',    qty: 120, unit: 'g',  pct: 45 },
        { id: 'ing-vegetables', qty: 80,  unit: 'g',  pct: 30 },
        { id: 'ing-soy-sauce',  qty: 15,  unit: 'ml', pct: 15 },
        { id: 'ing-sesame-oil', qty: 5,   unit: 'ml', pct: 10 },
      ],
      nutrition: { calories: 380, proteinG: 10, carbsG: 68, fatG: 8, fiberG: 5 },
    },
    {
      id: 'meal-margherita-pizza', name: 'Margherita Pizza', cuisine: 'Italian', cuisineTag: 'Italian',
      dietaryType: DietaryType.VEG, colorHex: '#E74C3C', deliveryTimeMin: 40,
      basePrice: 189, currentPrice: 199,
      ingredients: [
        { id: 'ing-pizza-dough',  qty: 150, unit: 'g',  pct: 35 },
        { id: 'ing-mozzarella',   qty: 80,  unit: 'g',  pct: 25 },
        { id: 'ing-tomato-sauce', qty: 60,  unit: 'ml', pct: 25 },
        { id: 'ing-basil',        qty: 10,  unit: 'g',  pct: 15 },
      ],
      nutrition: { calories: 520, proteinG: 20, carbsG: 62, fatG: 20, fiberG: 3 },
    },
    {
      id: 'meal-idli-sambar', name: 'Idli Sambar', cuisine: 'South Indian', cuisineTag: 'South Indian',
      dietaryType: DietaryType.VEG, colorHex: '#95A5A6', deliveryTimeMin: 15,
      basePrice: 59, currentPrice: 69,
      ingredients: [
        { id: 'ing-idli-batter',     qty: 200, unit: 'ml', pct: 50 },
        { id: 'ing-sambar',          qty: 100, unit: 'ml', pct: 30 },
        { id: 'ing-coconut-chutney', qty: 40,  unit: 'g',  pct: 20 },
      ],
      nutrition: { calories: 220, proteinG: 7, carbsG: 42, fatG: 3, fiberG: 4 },
    },
    {
      id: 'meal-hummus-platter', name: 'Hummus Platter', cuisine: 'Mediterranean', cuisineTag: 'Mediterranean',
      dietaryType: DietaryType.VEGAN, colorHex: '#F39C12', deliveryTimeMin: 20,
      basePrice: 149, currentPrice: 159,
      ingredients: [
        { id: 'ing-chickpeas',  qty: 120, unit: 'g',  pct: 40 },
        { id: 'ing-tahini',     qty: 30,  unit: 'g',  pct: 20 },
        { id: 'ing-pita-bread', qty: 80,  unit: 'g',  pct: 25 },
        { id: 'ing-olive-oil',  qty: 10,  unit: 'ml', pct: 15 },
      ],
      nutrition: { calories: 450, proteinG: 16, carbsG: 55, fatG: 18, fiberG: 10 },
    },
    {
      id: 'meal-chole-bhature', name: 'Chole Bhature', cuisine: 'Punjabi', cuisineTag: 'Indian',
      dietaryType: DietaryType.VEG, colorHex: '#E67E22', deliveryTimeMin: 30,
      basePrice: 119, currentPrice: 139,
      ingredients: [
        { id: 'ing-chickpeas',   qty: 120, unit: 'g',  pct: 40 },
        { id: 'ing-bhature',     qty: 100, unit: 'g',  pct: 35 },
        { id: 'ing-onion-gravy', qty: 60,  unit: 'ml', pct: 15 },
        { id: 'ing-spices',      qty: 8,   unit: 'g',  pct: 10 },
      ],
      nutrition: { calories: 560, proteinG: 18, carbsG: 72, fatG: 22, fiberG: 9 },
    },
  ];

  for (const ms of mealSeeds) {
    await prisma.meal.upsert({
      where: { id: ms.id },
      update: { currentPrice: ms.currentPrice },
      create: {
        id: ms.id,
        restaurantId: restaurant.id,
        name: ms.name,
        cuisine: ms.cuisine,
        cuisineTag: ms.cuisineTag,
        dietaryType: ms.dietaryType,
        colorHex: ms.colorHex,
        deliveryTimeMin: ms.deliveryTimeMin,
        basePrice: ms.basePrice,
        currentPrice: ms.currentPrice,
        nutritionalInfo: {
          create: ms.nutrition,
        },
        recipe: {
          create: {
            serves: 1,
            ingredients: {
              create: ms.ingredients.map(i => ({
                ingredientId: i.id,
                quantity: i.qty,
                unit: i.unit,
                pctOfCost: i.pct,
              })),
            },
          },
        },
      },
    });
  }

  // ── Demo User ───────────────────────────────────────────────────
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash('Demo@12345', 12);

  const demoUser = await prisma.user.upsert({
    where: { email: '10220s.karthicksnmhss@gmail.com' },
    update: {},
    create: {
      id: 'user-karthick',
      name: 'Karthick',
      email: '10220s.karthicksnmhss@gmail.com',
      phone: '+91-9876500001',
      passwordHash,
      isVerified: true,
      preferences: {
        create: {
          dietaryType: DietaryType.VEG,
          cuisines: ['Indian', 'South Indian'],
          dailyBudget: 150,
          alertThreshold: 20,
          autoSwitchPref: AutoSwitchPref.AI_AUTO_SWITCH,
          notifPush: true,
          notifEmail: true,
          notifWhatsapp: true,
        },
      },
      addresses: {
        create: {
          label: 'Home',
          addressLine: 'Block 4, Sector 12, Anna Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600040',
          isDefault: true,
        },
      },
    },
  });

  console.log(`✅ Seeded: ${ingredientData.length} ingredients, ${mealSeeds.length} meals, 1 demo user`);
  console.log(`   Demo login: 10220s.karthicksnmhss@gmail.com / Demo@12345`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
