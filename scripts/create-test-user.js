const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'CUSTOMER',
        isApproved: true
      }
    });

    console.log('Created test user:', user);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('User already exists');
    } else {
      console.error('Error:', error);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 