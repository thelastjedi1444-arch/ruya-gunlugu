import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
    // If DATABASE_URL is not available (e.g. during build time), we can return a client
    // without explicit datasource configuration, relying on the schema or environment.
    // However, for Prisma 7 with config file, we try to pass it if sending.

    if (process.env.DATABASE_URL) {
        return new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        })
    }

    return new PrismaClient()
}

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
