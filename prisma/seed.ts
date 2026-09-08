// prisma/seed.ts
import { prisma } from '../app/lib/prisma';
import bcrypt from 'bcryptjs';

// Pre-defined permissions
const PERMISSIONS = [
  { name: 'users.view', description: 'View users', category: 'users', resource: 'user', action: 'view' },
  { name: 'users.create', description: 'Create users', category: 'users', resource: 'user', action: 'create' },
  { name: 'users.update', description: 'Update users', category: 'users', resource: 'user', action: 'update' },
  { name: 'users.delete', description: 'Delete users', category: 'users', resource: 'user', action: 'delete' },
  { name: 'tickets.view', description: 'View tickets', category: 'tickets', resource: 'ticket', action: 'view' },
  { name: 'tickets.create', description: 'Create tickets', category: 'tickets', resource: 'ticket', action: 'create' },
  { name: 'tickets.update', description: 'Update tickets', category: 'tickets', resource: 'ticket', action: 'update' },
  { name: 'tickets.cancel', description: 'Cancel tickets', category: 'tickets', resource: 'ticket', action: 'cancel' },
  { name: 'payments.view', description: 'View payments', category: 'payments', resource: 'payment', action: 'view' },
  { name: 'payments.create', description: 'Create payments', category: 'payments', resource: 'payment', action: 'create' },
  { name: 'payments.update', description: 'Update payments', category: 'payments', resource: 'payment', action: 'update' },
  { name: 'expenses.view', description: 'View expenses', category: 'expenses', resource: 'expense', action: 'view' },
  { name: 'expenses.create', description: 'Create expenses', category: 'expenses', resource: 'expense', action: 'create' },
  { name: 'reports.view', description: 'View reports', category: 'reports', resource: 'report', action: 'view' },
  { name: 'settings.view', description: 'View settings', category: 'settings', resource: 'setting', action: 'view' },
  { name: 'settings.update', description: 'Update settings', category: 'settings', resource: 'setting', action: 'update' },
  { name: 'modules.view', description: 'View modules', category: 'modules', resource: 'module', action: 'view' },
];

const ROLES = {
  OWNER: {
    name: 'Owner',
    description: 'Full business control',
    isSystem: true,
    permissions: [
      'users.view', 'users.create', 'users.update', 'users.delete',
      'tickets.view', 'tickets.create', 'tickets.update', 'tickets.cancel',
      'payments.view', 'payments.create', 'payments.update',
      'expenses.view', 'expenses.create',
      'reports.view',
      'settings.view', 'settings.update',
      'modules.view',
    ],
  },
  MANAGER: {
    name: 'Manager',
    description: 'Day-to-day operations',
    isSystem: true,
    permissions: [
      'users.view',
      'tickets.view', 'tickets.create', 'tickets.update', 'tickets.cancel',
      'payments.view', 'payments.create', 'payments.update',
      'expenses.view', 'expenses.create',
      'reports.view',
    ],
  },
  STAFF: {
    name: 'Staff',
    description: 'Limited operational access',
    isSystem: true,
    permissions: [
      'tickets.view', 'tickets.create',
      'payments.view',
    ],
  },
  ACCOUNTANT: {
    name: 'Accountant',
    description: 'Financial access',
    isSystem: true,
    permissions: [
      'payments.view', 'payments.create', 'payments.update',
      'expenses.view', 'expenses.create',
      'reports.view',
    ],
  },
};

async function main() {
  console.log('🌱 Starting seed...');

  // 1. CREATE OR UPDATE ADMIN
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@webistic.co' },
    update: {},
    create: {
      email: 'admin@webistic.co',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // 2. CREATE PERMISSIONS
  for (const perm of PERMISSIONS) {
    await prisma.wbosPermission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }
  console.log(`✅ ${PERMISSIONS.length} permissions created`);

  // 3. CREATE TEST CLIENT + WBOS BUSINESS
  const existingClient = await prisma.client.findFirst({
    where: { name: 'Sadaat Travels' },
  });

  if (!existingClient) {
    console.log('📝 Creating test client: Sadaat Travels...');

    const client = await prisma.client.create({
      data: {
        name: 'Sadaat Travels',
        email: 'owner@sadaat.com',
        business: 'Transport & Travel',
        service: 'WBOS Platform',
        status: 'active',
        notes: 'Test business for WBOS - Transport/Ticketing',
      },
    });
    console.log(`✅ Client created: ${client.name}`);

    const business = await prisma.wbosBusiness.create({
      data: {
        clientId: client.id,
        name: 'Sadaat Travels',
        slug: 'sadaat',
        industry: 'transport',
        email: 'owner@sadaat.com',
        phone: '+92-300-1234567',
        address: 'Karachi, Pakistan',
        currency: 'PKR',
        timezone: 'Asia/Karachi',
        status: 'active',
        createdBy: admin.id,
      },
    });
    console.log(`✅ WBOS Business created: ${business.name}`);

    const rolesMap: Record<string, any> = {};
    for (const [key, roleDef] of Object.entries(ROLES)) {
      const role = await prisma.wbosRole.create({
        data: {
          businessId: business.id,
          name: roleDef.name,
          description: roleDef.description,
          isSystem: roleDef.isSystem,
        },
      });
      rolesMap[key] = role;

      const permObjects = await prisma.wbosPermission.findMany({
        where: { name: { in: roleDef.permissions } },
      });

      for (const perm of permObjects) {
        await prisma.wbosRolePermission.create({
          data: {
            roleId: role.id,
            permissionId: perm.id,
          },
        });
      }
    }
    console.log(`✅ ${Object.keys(rolesMap).length} roles created with permissions`);

    const ownerPassword = await bcrypt.hash('owner123', 12);
    const owner = await prisma.wbosUser.create({
      data: {
        businessId: business.id,
        email: 'owner@sadaat.com',
        password: ownerPassword,
        name: 'Ahmed Khan',
        status: 'active',
        personalExpenseEnabled: true,
        acceptedAt: new Date(),
      },
    });
    console.log(`✅ Owner user created: ${owner.email}`);

    await prisma.wbosUserRole.create({
      data: {
        userId: owner.id,
        roleId: rolesMap.OWNER.id,
      },
    });
    console.log('✅ Owner role assigned');

    await prisma.businessSettings.create({
      data: {
        businessId: business.id,
        brandColor: '#2563eb',
        allowStaffInvites: true,
        emailNotifications: true,
      },
    });
    console.log('✅ Business settings created');

    console.log('\n📋 TEST CREDENTIALS:');
    console.log('  Admin:   admin@webistic.co / admin123');
    console.log('  Owner:   owner@sadaat.com / owner123');
    console.log('  Business: Sadaat Travels');
  } else {
    await prisma.wbosBusiness.updateMany({
      where: { name: 'Sadaat Travels', slug: null },
      data: { slug: 'sadaat' },
    });
    await prisma.wbosUser.updateMany({
      where: { email: 'owner@sadaat.com', business: { name: 'Sadaat Travels' } },
      data: { personalExpenseEnabled: true },
    });
    console.log('ℹ️  Sadaat Travels already exists, skipping test creation');
  }

  // ============================================================
  // 4. SADAAT TRAVELS — SEED DATA
  // ============================================================

  console.log('\n📝 Seeding Sadaat Travels data...');

  // 4a. Create Adda Expense Categories
  const addaCategories = [
    { name: "Gas", description: "Gas bill" },
    { name: "Electricity", description: "Electricity bill" },
    { name: "Telephone", description: "Telephone bill" },
    { name: "Molvi Salary", description: "Molvi salary" },
    { name: "Watchman Salary", description: "Watchman salary" },
    { name: "Jalal Salary", description: "Jalal salary" },
    { name: "Flex Expense", description: "Flex expense" },
    { name: "Police Expense", description: "Police expense" },
    { name: "Petrol Expense", description: "Petrol expense" },
    { name: "Rent", description: "Rent expense" },
    { name: "Extra", description: "Extra expense" },
  ];

  for (const cat of addaCategories) {
    await prisma.addaExpenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${addaCategories.length} Adda expense categories created`);

  // 4b. Buses will be added by the manager
  console.log(`ℹ️  No buses seeded. Manager will add buses manually.`);

  // 4c. Create Installments — FIXED: Delete duplicates first
  const installments = [
    { name: "Bus Installments (10 buses)", type: "bus", totalAmount: 9600000, monthlyDeduction: 9600000 },
    { name: "Car Installment 1", type: "car", totalAmount: 123000, monthlyDeduction: 123000 },
    { name: "Car Installment 2", type: "car", totalAmount: 128000, monthlyDeduction: 128000 },
  ];

  // Delete existing installments first to avoid duplicates
  await prisma.installment.deleteMany({});
  console.log(`✅ Existing installments cleared`);

  for (const inst of installments) {
    await prisma.installment.create({
      data: {
        name: inst.name,
        type: inst.type,
        totalAmount: inst.totalAmount,
        monthlyDeduction: inst.monthlyDeduction,
        paidAmount: 0,
        remainingAmount: inst.totalAmount,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${installments.length} installments created`);

  console.log('\n✅ Sadaat Travels seed completed!');
  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });