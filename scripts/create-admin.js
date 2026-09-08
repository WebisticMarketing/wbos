const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://postgres.zznxhdkyucpfovvqhcwy:E8-ivnq7MMnwF*=@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres";

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const hashed = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@webistic.co' },
      update: { password: hashed },
      create: {
        email: 'admin@webistic.co',
        password: hashed,
        name: 'Admin',
      },
    });
    
    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@webistic.co');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();