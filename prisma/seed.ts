import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDecimal(min: number, max: number, precision = 2) {
  return new Prisma.Decimal(
    (Math.random() * (max - min) + min).toFixed(precision)
  )
}

async function main() {
  console.log('🌱 Seeding 10 guitar products...')

  // xóa dữ liệu cũ
  await prisma.product.deleteMany()

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
