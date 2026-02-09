import { PrismaClient } from '@prisma/client'

declare global {
    var __prismaClient: PrismaClient | undefined
}

const getPrisma = () => {
    const url = process.env.DATABASE_URL
    if (!url) {
        throw new Error('DATABASE_URL environment variable is not set')
    }

    if (process.env.NODE_ENV === 'production') {
        return new PrismaClient({ datasourceUrl: url })
    }
    if (!global.__prismaClient) {
        global.__prismaClient = new PrismaClient({ datasourceUrl: url })
    }
    return global.__prismaClient
}

export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrisma()
        return (client as any)[prop]
    }
})



