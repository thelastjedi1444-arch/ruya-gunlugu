
import { prisma } from '../lib/prisma';

async function main() {
    try {
        const userCount = await prisma.user.count();
        const users = await prisma.user.findMany({
            take: 20,
            select: { username: true }
        });
        console.log('Total users:', userCount);
        console.log('Sample users:', JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Error querying database:', err);
    }
}

main();
