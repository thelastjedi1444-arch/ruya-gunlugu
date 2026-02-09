
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        take: 10,
        select: { username: true }
    })
    console.log('Total users:', await prisma.user.count())
    console.log('Sample users:', users)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
