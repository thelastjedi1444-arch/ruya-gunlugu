import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const username = process.env.ADMIN_USERNAME || "jedicebi52";
    const password = process.env.ADMIN_PASSWORD || "cebijedi01234560aA";

    console.log(`Setting up admin user: ${username}`);

    const existingUser = await prisma.user.findUnique({
        where: { username },
    });

    if (existingUser) {
        console.log('Admin user already exists in database. Updating password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { username },
            data: { password: hashedPassword },
        });
        console.log('Password updated successfully.');
    } else {
        console.log('Creating new admin user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                zodiacSign: "Leo", // Default for admin
            },
        });
        console.log('Admin user created successfully.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
