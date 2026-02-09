import { PrismaClient } from '@prisma/client'

declare global {
    var __prismaClient: PrismaClient | undefined
}

const getPrisma = () => {
    if (process.env.NODE_ENV === 'production') {
        return new PrismaClient()
    }
    if (!global.__prismaClient) {
        global.__prismaClient = new PrismaClient()
    }
    return global.__prismaClient
}

export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const client = getPrisma()
        return (client as any)[prop]
    }
})



