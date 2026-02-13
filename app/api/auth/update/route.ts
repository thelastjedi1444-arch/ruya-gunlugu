import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getSession();

        if (!session || !session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { zodiacSign } = body;

        // Basic validation - check if zodiacSign is provided if that's the only thing we update for now
        if (typeof zodiacSign !== 'string') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: session.userId },
            data: {
                zodiacSign
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                zodiacSign: updatedUser.zodiacSign
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
