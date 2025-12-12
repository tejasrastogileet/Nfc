const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = 'admin@nfcstore.com';
  const adminPassword = 'admin123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin user created:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Please change the password after first login!');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Create sample products
  const products = [
    {
      name: 'NFC Card Classic',
      description: 'Standard NFC card for contactless payments and data transfer',
      price: 199.99,
      stock: 50,
      category: 'NFC_CARD',
      model: 'NFC-CLASSIC-001',
      specs: {
        frequency: '13.56 MHz',
        memory: '1KB',
        readRange: '4cm',
        writeCycles: '100,000'
      },
      images: []
    },
    {
      name: 'NFC Tag Sticker',
      description: 'Adhesive NFC tag for smart home automation and marketing',
      price: 49.99,
      stock: 100,
      category: 'NFC_TAG',
      model: 'NFC-TAG-STICKER-001',
      specs: {
        frequency: '13.56 MHz',
        memory: '144 bytes',
        readRange: '2cm',
        writeCycles: '10,000'
      },
      images: []
    },
    {
      name: 'NFC Card Pro',
      description: 'Premium NFC card with enhanced security and memory',
      price: 399.99,
      stock: 30,
      category: 'NFC_CARD',
      model: 'NFC-PRO-001',
      specs: {
        frequency: '13.56 MHz',
        memory: '4KB',
        readRange: '5cm',
        writeCycles: '500,000',
        encryption: 'AES-128'
      },
      images: []
    }
  ];

  for (const productData of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { model: productData.model }
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: productData
      });
      console.log(`✅ Created product: ${productData.name}`);
    } else {
      console.log(`ℹ️  Product already exists: ${productData.name}`);
    }
  }

  console.log('\n✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



