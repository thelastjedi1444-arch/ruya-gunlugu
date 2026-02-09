import { PrismaClient } from '@prisma/client'

declare global {
    var __prismaClient: PrismaClient | undefined
}

let prismaInstance: PrismaClient | undefined

function getPrismaClient() {
    if (!prismaInstance) {
        if (global.__prismaClient) {
            prismaInstance = global.__prismaClient
        } else {
            const url = process.env.DATABASE_URL
            prismaInstance = new PrismaClient({
                datasources: {
                    db: {
                        url: url
                    }
                }
            } as any)
            if (process.env.NODE_ENV !== 'production') {
                global.__prismaClient = prismaInstance
            }
        }
    }
    return prismaInstance
}

// Export a Proxy that lazily initializes Prisma
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrismaClient()
        return (client as any)[prop]
    }
})



