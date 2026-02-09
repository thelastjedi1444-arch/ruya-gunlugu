import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            username: true,
        },
    });
    console.log('Registered Users:', users.map(u => u.username));

    const adminUsername = process.env.ADMIN_USERNAME;
    console.log('ADMIN_USERNAME from env:', adminUsername ? 'DEFINED' : 'UNDEFINED');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
