import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getSession();

    if (!session || !session.userId) {
        return NextResponse.json({ user: null });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                username: true,
                zodiacSign: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                ...user,
                createdAt: user.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json({ user: null }, { status: 500 });
    }
}
