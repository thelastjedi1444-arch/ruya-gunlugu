import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
    const url = process.env.DATABASE_URL || 'file:./dev.db'

    const libsql = createClient({ url })
    const adapter = new PrismaLibSql(libsql as any)

    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
