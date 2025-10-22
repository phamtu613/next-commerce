import { randomDecimal } from '@/lib/utils'
import { PrismaClient, Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomInt } from 'crypto'
import * as crypto from "crypto";

const prisma = new PrismaClient()


async function main() {
  console.log("✅ Create users with hashed passwords");
  const users = [
    {
      name: "Alice",
      email: "alice@example.com",
      password: "password123",
      role: "admin",
      emailVerified: new Date(),
      image: "https://example.com/alice.jpg",
      address: { city: "Hanoi", country: "Vietnam" },
      paymentMethod: "card",
    },
    {
      name: "Bob",
      email: "bob@example.com",
      password: "secret456",
      role: "user",
      emailVerified: null,
      image: null,
      address: { city: "Ho Chi Minh", country: "Vietnam" },
      paymentMethod: null,
    },
        {
      name: "Tuan",
      email: "lntt20198@gmail.com",
      password: "password123",
      role: "admin",
      emailVerified: new Date(),
      image: "https://example.com/alice.jpg",
      address: { city: "Hanoi", country: "Vietnam" },
      paymentMethod: "card",
    },
    {
      name: "Thanh",
      email: "bluesky.dev0305@gmail.com",
      password: "secret456",
      role: "user",
      emailVerified: null,
      image: null,
      address: { city: "Ho Chi Minh", country: "Vietnam" },
      paymentMethod: null,
    },
 {
      name: "Tu",
      email: "phamtu613@gmail.com",
      password: "secret456",
      role: "user",
      emailVerified: null,
      image: null,
      address: { city: "Ho Chi Minh", country: "Vietnam" },
      paymentMethod: null,
    },
  ];
  // Hash passwords
  const usersWithHash = users.map((user) => ({
    ...user,
    password: user.password ? bcrypt.hashSync(user.password, 10) : null,
  }));

  // Insert users
  for (const user of usersWithHash) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log("🌱 Seeding verification tokens...");

  for (const user of users) {
    const token = crypto.randomBytes(32).toString("hex"); // tạo token ngẫu nhiên
    const expires = new Date(Date.now() + 1000 * 60 * 60); // token hợp lệ 1 giờ

    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: user.email,
          token,
        },
      },
      update: {},
      create: {
        identifier: user.email,
        token,
        expires,
      },
    });
  }

  console.log("✅ Seeded verification tokens");
  console.log("✅ Seeded users with hashed passwords");
  // Example: create accounts for OAuth
  const alice = await prisma.user.findUnique({ where: { email: "alice@example.com" } });
  if (alice) {
    await prisma.account.upsert({
      where: { provider_providerAccountId: { provider: "google", providerAccountId: "alice_google_1" } },
      update: {},
      create: {
        userId: alice.id,
        provider: "google",
        providerAccountId: "alice_google_1",
        type: "oauth",
        access_token: "mock_token",
        token_type: "Bearer",
        scope: "read:user write:email",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  console.log("✅ Seeded accounts");
    // Example: create session for Alice
  if (alice) {
    await prisma.session.upsert({
      where: { sessionToken: "alice_session_1" },
      update: {},
      create: {
        sessionToken: "alice_session_1",
        userId: alice.id,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
      },
    });
  }
  console.log("✅ Seeded sessions");
  const guitars = [
    { name: 'Yamaha F310', slug: 'yamaha-f310', brand: 'Yamaha', description: 'Acoustic guitar' },
    { name: 'Fender Stratocaster', slug: 'fender-stratocaster', brand: 'Fender', description: 'Electric guitar' },
    { name: 'Gibson Les Paul', slug: 'gibson-les-paul', brand: 'Gibson', description: 'Electric guitar' },
    { name: 'Ibanez RG', slug: 'ibanez-rg', brand: 'Ibanez', description: 'Electric guitar' },
    { name: 'Martin D-28', slug: 'martin-d28', brand: 'Martin', description: 'Acoustic guitar' },
    { name: 'Taylor 214ce', slug: 'taylor-214ce', brand: 'Taylor', description: 'Acoustic guitar' },
    { name: 'Epiphone Les Paul', slug: 'epiphone-les-paul', brand: 'Epiphone', description: 'Electric guitar' },
    { name: 'PRS SE Custom 24', slug: 'prs-se-custom24', brand: 'PRS', description: 'Electric guitar' },
    { name: 'Gretsch G2622', slug: 'gretsch-g2622', brand: 'Gretsch', description: 'Electric guitar' },
    { name: 'Squier Bullet', slug: 'squier-bullet', brand: 'Squier', description: 'Electric guitar' },
  ]
  console.log('🌱 Seeding 10 guitar products...')
  await prisma.product.createMany({
    data: guitars.map(g => ({
      ...g,
      category: 'Guitar',
      images: [],
      stock: randomInt(5, 50),
      price: randomDecimal(100, 1500),
      rating: randomDecimal(3, 5, 1),
      numReviews: randomInt(0, 50),
      isFeatured: Math.random() > 0.7,
      banner: null,
      createdAt: new Date(),
    })),
    skipDuplicates: true,
  })

  console.log('✅ 10 guitar products seeded!')
}

main()
.then(() => prisma.$disconnect())
.catch(async e => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})